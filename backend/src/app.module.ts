import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfiguration } from './database/database.configuration';

@Global()
@Module({
  imports: [TypeOrmModule.forRootAsync({ useClass: DatabaseConfiguration })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
