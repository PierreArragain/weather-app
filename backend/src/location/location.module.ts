import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Location } from './entity/location.entity';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Location, User])],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
