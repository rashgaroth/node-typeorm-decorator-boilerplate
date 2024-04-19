import { Seeder } from '@jorgebodega/typeorm-seeding';
import { EntityValues } from 'common.interface';
import { DataSource } from 'typeorm';

import { RolePermission } from '@/entities/role/permission.entity';
import { Role } from '@/entities/role/role.entity';

export default class RolePermissionSeeder extends Seeder {
  async run(dataSource: DataSource) {
    const modules = ['personalization', 'template', 'files', 'users'];
    const perms = ['create', 'read', 'update', 'delete'];
    const basePermissions = [
      '*:*',
      'create:*',
      'read:*',
      'update:*',
      'delete:*',
    ];

    const permissions = perms.reduce((acc, basePermission) => {
      modules.forEach((module) => {
        acc.push(`${module}:${basePermission}`);
      });
      return acc;
    }, basePermissions);

    const roles: EntityValues<Role>[] = [
      {
        id: 1,
        name: 'superadmin',
        description: 'Super Admin Role',
      },
      {
        id: 2,
        name: 'customer',
        description: 'Customer Role',
      },
      {
        id: 3,
        name: 'creator',
        description: 'Creator Role',
      },
      {
        id: 4,
        name: 'vendor',
        description: 'Vendor Role',
      },
    ];

    await dataSource
      .createQueryBuilder()
      .insert()
      .into(RolePermission)
      .orUpdate(['name'])
      .values(permissions.map((name, idx) => ({ name, id: idx + 1 })))
      .orIgnore()
      .execute();

    await dataSource
      .createQueryBuilder()
      .insert()
      .into(Role)
      .orUpdate(['name'])
      .values(roles)
      .orIgnore()
      .execute();
  }
}
