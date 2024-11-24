import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfiguration } from './database/database.configuration';
import { LocationModule } from './location/location.module';
import { WeatherModule } from './weather/weather.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: DatabaseConfiguration }),
    LocationModule,
    WeatherModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
