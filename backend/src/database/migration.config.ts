import { DataSource, DataSourceOptions } from 'typeorm';
import { DatabaseConfiguration } from './database.configuration';

const datasource = new DataSource(
  <DataSourceOptions>new DatabaseConfiguration().createTypeOrmOptions(),
);
datasource.initialize();
export default datasource;
