import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { Message, MessageSchema } from './entities/message.entity';
import MessageController from './message.controller';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    UserModule,
  ],
  providers: [MessageService, MessageGateway, Logger],
  exports: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
