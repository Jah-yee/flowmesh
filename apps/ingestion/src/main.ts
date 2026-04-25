import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Logger } from 'nestjs-pino'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const config = app.get(ConfigService)

  app.useLogger(app.get(Logger))
  app.useGlobalFilters(app.get(HttpExceptionFilter))
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  const port = config.get<number>('PORT')!
  await app.listen(port, '0.0.0.0')
  app.get(Logger).log(`Ingestion service listening on port ${port}`, 'Ingestion')
}

bootstrap()
