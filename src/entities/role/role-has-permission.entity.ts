import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { RolePermission } from '@/entities/role/permission.entity';
import { Role } from '@/entities/role/role.entity';

@Entity('role_has_permission')
export class RoleHasPermission {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Role, { nullable: false, eager: true })
  role: Role;

  @ManyToOne(() => RolePermission, { nullable: false })
  permission: RolePermission;
}
