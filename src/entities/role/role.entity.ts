import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TimestampedEntity } from '@/entities/base/base.entity';

@Entity('role')
export class Role extends TimestampedEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', { length: 255, nullable: false })
  name: string;

  @Column('text', { nullable: true })
  description: string;
}
