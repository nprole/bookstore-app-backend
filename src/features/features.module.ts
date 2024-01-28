import {forwardRef, Module} from '@nestjs/common';
import {AuthModule} from "./auth/auth.module";
import {UserModule} from "./user/user.module";
import {CoreModule} from "../core/core.module";
import {SharedModule} from "../shared/shared.module";

@Module({
    imports: [
        AuthModule,
        UserModule,
        CoreModule,
    ],
    controllers: [],
    exports: [
        AuthModule,
        UserModule,
        CoreModule,
    ],
})
export class FeaturesModule {}