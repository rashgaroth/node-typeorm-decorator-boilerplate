import { instanceToPlain } from 'class-transformer';
import {
  AfterLoad,
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export class EntityHelper extends BaseEntity {
  __entity?: string;

  @AfterLoad()
  setEntityName() {
    this.__entity = this.constructor.name;
  }

  toJSON() {
    return instanceToPlain(this);
  }
}

export class TimestampedEntity extends EntityHelper {
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
