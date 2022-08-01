import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import entities from './typeorm';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth/auth.module';
import { TwoFactorAuthenticationModule } from './auth/twoFactorAuthentication.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MatchModule } from './match/match.module';
import { WaitingRoomModule } from './waitingroom/waitingroom.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ScheduleModule.forRoot(),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('DB_HOST'),
				port: +configService.get<number>('DB_PORT'),
				username: configService.get('DB_USERNAME'),
				password: configService.get('DB_PASSWORD'),
				database: configService.get('DB_NAME'),
				entities: entities,
				synchronize: true,
				ssl: false,
				autoLoadEntities: true
				// options: {"trustServerCertificate": true},
				// extra: {
				// 	ssl: {
				// 		rejectUnauthorized: false,
				// 	},
				// },
				//options: {encrypt: false}
			}),
			inject: [ConfigService],
		}),
		AuthModule,
		TwoFactorAuthenticationModule,
		UsersModule,
		MatchModule,
		ChannelsModule,
		WaitingRoomModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'test_homepage'), 
    }),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
