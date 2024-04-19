import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Role } from '@/entities/role/role.entity';
import { User } from '@/entities/user/user.entity';
import { entityTransformers } from '@/utilities/db.utility';

@Entity({ name: 'user_account' })
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column('text', { nullable: true, select: true })
  password: string;

  @ManyToOne(() => Role, { eager: true, nullable: true })
  role!: Role;

  @Column({ type: 'varchar', nullable: true })
  type!: string;

  @Column({ type: 'varchar', nullable: true })
  provider!: string;

  @Column({ type: 'text', nullable: true })
  providerAccountId!: string;

  @Column({ type: 'text', nullable: true })
  refreshToken!: string | null;

  @Column({ type: 'text', nullable: true })
  accessToken?: string | null;

  @Column({
    nullable: true,
    type: 'bigint',
    transformer: entityTransformers.bigint,
  })
  expiresAt!: number | null;

  @Column({ type: 'text', nullable: true })
  tokenType!: string | null;

  @Column({ type: 'text', nullable: true })
  scope!: string | null;

  @Column({ type: 'text', nullable: true })
  idToken!: string | null;

  @Column({ type: 'text', nullable: true })
  sessionState!: string | null;

  @Column({ type: 'text', nullable: true })
  authTokenSecret!: string | null;

  @Column({ type: 'text', nullable: true })
  oauthToken!: string | null;

  @OneToOne(() => User, {
    cascade: true,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
