import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TimestampedEntity } from '@/entities/base/base.entity';

@Entity('role_permission')
export class RolePermission extends TimestampedEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { nullable: false })
  name: string;
}
