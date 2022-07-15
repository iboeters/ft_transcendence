import {
  //HttpModule,
  Module,
} from '@nestjs/common';
//import { AuthService } from './auth.service';
//import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
//import { FtStrategy } from './ft.strategy';

@Module({
  imports    : [
    //UsersModule,
    //HttpModule,
  ],
  providers  : [
    //AuthService,
    //FtStrategy,
  ],
  controllers: [
    AuthController,
  ],
})
export class AuthModule
{
}
