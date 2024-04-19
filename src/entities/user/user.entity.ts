import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { TimestampedEntity } from '@/entities/base/base.entity';
import { Account } from '@/entities/user/account.entity';
import { Session } from '@/entities/user/session.entity';
import { entityTransformers } from '@/utilities/db.utility';

@Entity('user', { orderBy: { createdAt: 'DESC' } })
export class User extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: false })
  @Unique(['email'])
  email!: string;

  @Column({
    type: Date,
    nullable: true,
    transformer: entityTransformers.date,
  })
  emailVerified!: Date;

  @Column({ type: 'text', nullable: true })
  image!: string | null;

  @Column('text', { nullable: false })
  @Index('IDX_USER_FIRST_NAME')
  firstName: string;

  @Column('text', { nullable: false })
  @Index('IDX_USER_LAST_NAME')
  lastName: string;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @OneToOne(() => Account, {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'accountId' })
  account!: Account;

  public get name(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
