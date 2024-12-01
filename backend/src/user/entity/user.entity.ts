import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Location } from '../../location/entity/location.entity';

import * as bcrypt from 'bcrypt';

@Entity()
@Unique(['email'])
@Unique(['uuid'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, select: false })
  password: string;

  @ManyToMany(() => Location, (location) => location.users)
  @JoinTable()
  favoriteLocations: Location[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPasswordBeforeCreateOrUpdate() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
