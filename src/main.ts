import {Logger} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app/app.module';
import {environments} from './environments/environments';
import * as fs from "fs";
async function bootstrap() {
    const httpsOptions: {
        key: Buffer,
        cert: Buffer
    } = {
        key: null,
        cert: null
    };
    let app = null;
    if (environments.production) {
        try {
            httpsOptions.key = fs.readFileSync('/etc/letsencrypt/live/formule.obrtnexpro.com/privkey.pem');
            httpsOptions.cert = fs.readFileSync('/etc/letsencrypt/live/formule.obrtnexpro.com/fullchain.pem');
        } catch (error) {
            console.error('Error reading SSL certificate or key files:', error);
            process.exit(1); // Exit the application on error
        }
        app = await NestFactory.create(
            AppModule,
            {httpsOptions}
        );
    } else {
        app = await NestFactory.create(
            AppModule,
        );
    }

    app.set('trust proxy', environments.proxyEnabled);
    app.enableShutdownHooks();
    app.setGlobalPrefix('api');
    app.enableCors();


    const port = environments.port;
    const logger = new Logger('NestApplication');

    await app.listen(port, () =>
        logger.log(`Server initialized on port ${port}`),
    );
}

bootstrap();
