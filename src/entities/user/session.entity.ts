import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TimestampedEntity } from '@/entities/base/base.entity';
import { User } from '@/entities/user/user.entity';

@Entity({ name: 'user_session' })
export class Session extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  sessionToken!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: Date })
  expires!: Date;

  @ManyToOne(() => User, (user) => user.sessions)
  user!: User;
}
