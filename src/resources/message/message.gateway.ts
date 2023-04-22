import { WsException, ConnectedSocket } from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { User } from '../user/entities/user.entity';
import { MessageService } from './message.service';
import { MessageDto } from './dto/message.dto';
import { AuthService } from '../auth/auth.service';
import { EventEnum } from './event.enum';
import { errorMsgs } from '../../shared/error-messages';

@WebSocketGateway()
@UseGuards(WsAuthGuard)
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly logger: Logger,
  ) {}

  @SubscribeMessage(EventEnum.send_message)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { text }: MessageDto,
  ) {
    try {
      const user = (client?.handshake as any)?.user;
      const message = await this.messageService.create(text, user);
      this.logger.log(EventEnum.send_message, text, user.email);
      this.server.sockets.emit(EventEnum.receive_message, message);
    } catch (error) {
      throw new WsException(error);
    }
  }

  async handleConnection(client: Socket) {
    const authHeader = client?.handshake?.headers?.authorization;
    let user: User;
    try {
      user = await this.authService.getUserByToken(authHeader);
      this.server.emit(EventEnum.user_connect_chat, user);
      this.logger.log(EventEnum.user_connect_chat, user);
    } catch (error) {
      this.logger.error(errorMsgs.connectError, error);
      client.disconnect(true);
      return;
    }
    try {
      const messages = await this.messageService.findAll();
      this.server.emit(EventEnum.connect_get_chat_messages, messages);
      this.logger.log(EventEnum.connect_get_chat_messages, messages);
    } catch (error) {
      this.logger.error(errorMsgs.getMessagesError, error);
      return;
    }
  }

  async handleDisconnect(client: Socket) {
    const authHeader = client?.handshake?.headers?.authorization;
    if (authHeader) {
      let user: User;
      try {
        user = await this.authService.getUserByToken(authHeader);
        this.server.emit(EventEnum.user_disconnect_chat, user);
      } catch (error) {
        this.logger.error(errorMsgs.disconnectError, error);
        client.disconnect(true);
        return;
      }
    }
  }

  afterInit(server: Server): void {
    this.logger.log('Init');
  }
}
