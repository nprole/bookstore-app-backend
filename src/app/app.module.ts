import {Module, ValidationPipe} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {APP_FILTER, APP_PIPE} from '@nestjs/core';
import {FeaturesModule} from "../features/features.module";
import {environments} from "../environments/environments";
import {ExceptionsFilter} from "../core/filter/exceptions.filter";
import {EventEmitterModule} from "@nestjs/event-emitter";

@Module({
    imports: [
        FeaturesModule,
        ConfigModule.forRoot(),
        EventEmitterModule.forRoot(),
        MongooseModule.forRoot(environments.mongoUri, {
            autoIndex: false,
        })
    ],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({transform: true}),
        },
        {
            provide: APP_FILTER,
            useClass: ExceptionsFilter,
        },
    ],
    controllers: [AppController]
})
export class AppModule {
}
