import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfiguration } from './database/database.configuration';
import { LocationModule } from './location/location.module';
import { WeatherModule } from './weather/weather.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: DatabaseConfiguration }),
    LocationModule,
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
