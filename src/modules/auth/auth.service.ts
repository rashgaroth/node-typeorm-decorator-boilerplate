import path from 'path';
import { UnauthorizedError } from 'routing-controllers';
import { Repository } from 'typeorm';

import { AuthLib } from '@/lib/auth.lib';

import { Role } from '@/entities/role/role.entity';
import { Account } from '@/entities/user/account.entity';
import { Session } from '@/entities/user/session.entity';
import { User } from '@/entities/user/user.entity';
import { AuthorizeDto } from '@/modules/auth/dto/authorize.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import BaseService from '@/services/base/base.service';
import { withTransaction } from '@/utilities/db.utility';

export class AuthService extends BaseService {
  userRepository: Repository<User>;
  sessionRepository: Repository<Session>;
  accountRepository: Repository<Account>;
  authLib: AuthLib;

  constructUser(dto: AuthorizeDto) {
    const user = new User();
    const canSplit = dto.name.split(' ')[1];
    user.email = dto.email;
    if (canSplit) {
      const [firstName, lastName] = dto.name.split(' ');
      user.firstName = firstName;
      user.lastName = lastName;
    } else {
      user.firstName = dto.name;
      user.lastName = '';
    }
    return user;
  }

  constructAccount(dto: AuthorizeDto, user: User, role: Role) {
    const account = new Account();
    account.provider = dto.provider;
    account.userId = user.id;
    account.user = user;
    account.role = role;

    if (dto.accessToken) {
      account.access_token = dto.accessToken;
    }

    if (dto.providerAccountId) {
      account.providerAccountId = dto.providerAccountId;
    }

    if (dto.refreshToken) {
      account.refreshToken = dto.refreshToken;
    }

    if (dto.expiresAt && new Date(dto.expiresAt) !== new Date('Invalid Date')) {
      account.expiresAt = new Date(dto.expiresAt).getDate();
    }

    if (dto.scope) {
      account.scope = dto.scope;
    }

    if (dto.tokenType) {
      account.tokenType = dto.tokenType;
    }

    if (dto.idToken) {
      account.idToken = dto.idToken;
    }
    return account;
  }

  constructSession(user: User) {
    const session = new Session();
    session.userId = user.id;
    session.user = user;
    session.sessionToken = this.authLib.generateSessionToken({
      id: user.id,
      _as: user?.account?.role?.name,
      name: user.name,
      email: user.email,
    });
    session.expires = new Date(new Date().setDate(new Date().getDate() + 30)); // 30 days

    return session;
  }

  downloadImage(url: string, path: string) {
    return this.authLib.downloadImage(url, path);
  }

  constructor() {
    super();
    this.authLib = new AuthLib();
    this.userRepository = this.dataSource.getRepository(User);
    this.sessionRepository = this.dataSource.getRepository(Session);
    this.accountRepository = this.dataSource.getRepository(Account);
  }

  async validateUserRole(userId: string, roles: string[]) {
    // TODO: change to redis process
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      loadEagerRelations: false,
      relations: ['account', 'account.role'],
    });
    if (user?.account) {
      roles = roles.map((role) => role.trim().toLowerCase());
      if (roles.includes(user.account.role.name)) {
        return true;
      }
      throw new UnauthorizedError(
        `You're not authorized to access this resource`
      );
    }
    throw new UnauthorizedError(
      `You're not authorized to access this resource`
    );
  }

  async registerAdmin({
    email,
    password,
    firstName,
    lastName,
  }: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return await withTransaction(this.userRepository)(async ({ manager }) => {
      const user = new User();
      user.email = email;
      user.emailVerified = new Date();
      user.firstName = firstName;
      user.lastName = lastName;
      const savedUser = await manager.save(User, user);

      const role = await manager.findOne(Role, {
        where: {
          id: 1, // customer!
        },
      });

      const account = new Account();
      account.provider = 'credential';
      account.userId = savedUser.id;
      account.user = savedUser;
      account.role = role;
      account.password = await this.authLib.hashPassword(password);

      await manager.save(Account, account);

      user.account = account;
      await user.save();

      const session = new Session();
      session.userId = savedUser.id;
      session.user = savedUser;
      session.sessionToken = this.authLib.generateSessionToken({
        id: savedUser.id,
        _as: savedUser?.account?.role?.name,
        name: savedUser.name,
        email: savedUser.email,
      });
      session.expires = new Date(new Date().setDate(new Date().getDate() + 30)); // 30 days

      await manager.save(Session, session);

      return {
        result: {
          user: savedUser,
          account,
          session,
          token: session.sessionToken,
          isNewUser: true,
        },
      };
    });
  }

  async saveUserPicture(pictureUrl: string, user: User) {
    await this.downloadImage(
      pictureUrl,
      path.join(
        process.cwd(),
        'public',
        'files',
        'png',
        `profile`,
        `${user.id}`,
        `${user.id}.png`
      )
    );
    const filePath = `${process.env.BASE_URL}/static/png/profile/${user.id}/${user.id}.png`;
    user.image = filePath;
    return user;
  }

  async loginAdmin(dto: LoginDto) {
    return await withTransaction(this.userRepository)(async ({ manager }) => {
      const user = await manager.findOne(User, {
        where: {
          email: dto.email,
        },
        relations: ['account', 'account.role'],
      });
      if (user) {
        const isPasswordValid = await this.authLib.comparePassword(
          dto.password,
          user.account.password
        );
        if (isPasswordValid) {
          const token = this.authLib.generateSessionToken({
            id: user.id,
            _as: user?.account?.role?.name,
            name: user.name,
            email: user.email,
          });

          const session = await manager.findOne(Session, {
            where: {
              user: {
                id: user.id,
              },
            },
          });

          const newSess = new Session();
          newSess.sessionToken = token;
          if (session.id) {
            newSess.id = session.id;
          }
          newSess.expires = new Date(
            new Date().setDate(new Date().getDate() + 30)
          ); // 30 days
          await newSess.save();

          return {
            result: {
              user,
              account: user.account,
              session,
              token: token,
              isNewUser: false,
            },
          };
        }
      }
      throw new UnauthorizedError(`Invalid email or password`);
    });
  }

  async authorize(dto: AuthorizeDto) {
    return await withTransaction(this.userRepository)(async ({ manager }) => {
      // check if user exists
      // if exist this should not be a new user
      const existingUser = await manager.findOne(User, {
        where: { email: dto.email },
      });
      if (dto.picture) {
        if (existingUser) {
          const usr = await this.saveUserPicture(dto.picture, existingUser);
          await manager.save(User, usr);
        }
      }
      if (existingUser) {
        const account = await manager.findOne(Account, {
          where: {
            provider: dto.provider,
            user: {
              id: existingUser.id,
            },
          },
        });
        if (account) {
          const session = await manager.findOne(Session, {
            where: {
              user: {
                id: existingUser.id,
              },
            },
          });
          return {
            result: {
              user: existingUser,
              account,
              session,
              token: session.sessionToken,
              isNewUser: false,
            },
          };
        }
      }

      const user = this.constructUser(dto);
      const savedUser = await manager.save(User, user);

      // need to enhance this side
      // should be able to setup with dynamic roles
      // TODO: setup dynamic roles
      const role = await manager.findOne(Role, {
        where: {
          id: 2, // customer!
        },
      });

      const account = this.constructAccount(dto, savedUser, role);
      const session = this.constructSession(savedUser);

      const [savedAccount, savedSession] = await Promise.all([
        manager.save(Account, account),
        manager.save(Session, session),
      ]);

      if (dto.picture) {
        await this.downloadImage(
          dto.picture,
          path.join(
            process.cwd(),
            'public',
            'files',
            'png',
            `profile`,
            `${savedUser.id}`,
            `${savedUser.id}.png`
          )
        );
        const filePath = `${process.env.BASE_URL}/static/png/profile/${savedUser.id}/${savedUser.id}.png`;
        savedUser.image = filePath;
        await manager.save(User, savedUser);
      }

      return {
        result: {
          user: savedUser,
          account: savedAccount,
          session: savedSession,
          token: savedSession.sessionToken,
          isNewUser: true,
        },
      };
    });
  }
}
