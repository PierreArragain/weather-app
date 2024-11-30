import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class Migration1732966389405 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({ name: 'user' }), true);
    await queryRunner.createTable(new Table({ name: 'location' }), true);
    await queryRunner.createTable(
      new Table({ name: 'user_location_favorite_locations_users' }),
      true,
    );
    await queryRunner.addColumns('user', [
      new TableColumn({
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
      }),
      new TableColumn({
        name: 'uuid',
        type: 'uuid',
        isUnique: true,
        default: 'uuid_generate_v4()',
      }),
      new TableColumn({
        name: 'email',
        type: 'varchar',
        length: '100',
        isUnique: true,
      }),
      new TableColumn({
        name: 'password',
        type: 'varchar',
        length: '100',
        isNullable: false,
      }),
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'now()',
      }),
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'now()',
      }),
    ]);

    await queryRunner.addColumns('location', [
      new TableColumn({
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
      }),
      new TableColumn({
        name: 'name',
        type: 'varchar',
      }),
      new TableColumn({
        name: 'latitude',
        type: 'varchar',
      }),
      new TableColumn({
        name: 'longitude',
        type: 'varchar',
      }),
      new TableColumn({
        name: 'local_name',
        type: 'varchar',
      }),
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'now()',
      }),
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'now()',
      }),
    ]);

    await queryRunner.addColumns('user_location_favorite_locations_users', [
      new TableColumn({
        name: 'user_id',
        type: 'int',
        foreignKeyConstraintName:
          'user_location_favorite_locations_users_userId_fk',
      }),

      new TableColumn({
        name: 'location_id',
        type: 'int',
      }),
    ]);
    await queryRunner.createPrimaryKey(
      'user_location_favorite_locations_users',
      ['user_id', 'location_id'],
    );

    await queryRunner.createForeignKey(
      'user_location_favorite_locations_users',
      new TableForeignKey({
        columnNames: ['location_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'location',
      }),
    );

    await queryRunner.createForeignKey(
      'user_location_favorite_locations_users',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'user_location_favorite_locations_users',
      new TableIndex({
        columnNames: ['location_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_location_favorite_locations_users',
      new TableIndex({
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_location_favorite_locations_users');
    await queryRunner.dropTable('user');
    await queryRunner.dropTable('location');
  }
}
