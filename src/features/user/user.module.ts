import {UserController} from './controller/user.controller';
import {SettingsController} from './controller/settings.controller';
import {
    forwardRef,
    Module,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import {AuthModule} from '../auth/auth.module';
import {UserService} from './service/user.service';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from './schema/user.schema';


@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: User.name,
                schema: UserSchema,
            }
        ]),
        forwardRef(() => AuthModule),
    ],
    controllers: [
        UserController,
        SettingsController,
    ],
    providers: [
        UserService,
    ],
    exports: [
        UserService,
    ],
})
export class UserModule implements OnModuleInit, OnModuleDestroy {
    constructor() {
    }

    onModuleInit() {
        return this.deleteConnections();
    }

    onModuleDestroy() {
        return this.deleteConnections();
    }

    private deleteConnections() {
      //  return this.socketConnectionService.deleteAllConnections();
    }
}
