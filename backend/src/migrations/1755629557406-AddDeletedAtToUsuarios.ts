import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDeletedAtToUsuarios implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('usuarios', new TableColumn({
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('usuarios', 'deleted_at');
    }
}
