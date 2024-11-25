import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfiguration } from './database/database.configuration';
import { LocationModule } from './location/location.module';
import { UserModule } from './user/user.module';
import { WeatherModule } from './weather/weather.module';
import { AuthenticationGuard } from './acl/authentication.guard';

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
  providers: [AppService, JwtService, AuthenticationGuard],
})
export class AppModule {}
