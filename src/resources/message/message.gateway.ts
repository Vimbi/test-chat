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

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { text }: MessageDto,
  ) {
    const authHeader = client?.handshake?.headers?.authorization;
    let user: User;
    try {
      user = await this.authService.getUserByToken(authHeader);
    } catch (error) {
      throw new WsException('User not found');
    }
    const message = await this.messageService.create(text, user);
    this.logger.log('send_message', text, user);

    this.server.sockets.emit('receive_message', message);
  }

  async handleConnection(client: Socket) {
    const authHeader = client?.handshake?.headers?.authorization;
    let user: User;
    try {
      user = await this.authService.getUserByToken(authHeader);
      this.server.emit('user_connect_chat', user);
      this.logger.log('user_connect_chat', user);
    } catch (error) {
      this.logger.error(
        'Socket disconnected within handleConnection() in AppGateway:',
        error,
      );
      client.disconnect(true);
      return;
    }
    try {
      const messages = await this.messageService.findAll();
      this.server.emit('connect_chat_messages', messages);
      this.logger.log('connect_chat_messages', messages);
    } catch (error) {
      this.logger.error(
        'Socket disconnected within handleConnection() in AppGateway:',
        error,
      );
      client.disconnect(true);
      return;
    }
  }

  async handleDisconnect(client: Socket) {
    const authHeader = client?.handshake?.headers?.authorization;
    if (authHeader) {
      let user: User;
      try {
        user = await this.authService.getUserByToken(authHeader);
        this.server.emit('user_disconnect_chat', user);
      } catch (error) {
        this.logger.error(
          'Socket disconnected within handleDisconnect() in AppGateway:',
          error,
        );
        client.disconnect(true);
        return;
      }
    }
  }

  afterInit(server: Server): void {
    this.logger.log('Init');
  }
}
