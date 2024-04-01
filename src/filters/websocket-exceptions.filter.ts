import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { inspect } from 'util';
import { PacketType } from 'socket.io-parser';

@Catch()
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  // constructor(private readonly logger: Logger) {
  //   super();
  // }

  catch(exception: WsException, host: ArgumentsHost) {
    // super.catch(exception, host);
    // if (host.getType() === 'ws') {
    const args = host.getArgs();
    // event ack callback
    if ('function' === typeof args[args.length - 1]) {
      const ACKCallback = args.pop();
      ACKCallback({ error: exception.message, exception });
    }

    const client = host.switchToWs().getClient();
    const data = host.switchToWs().getData();
    // console.log('99999', inspect(client));
    // client.packet({
    //   type: PacketType.EVENT,
    //   namespace: 'error',
    //   data: [{ error: exception?.message }],
    //   id: client.nsp._ids++,
    // });
    // const error =
    //   exception instanceof WsException
    //     ? exception.getError()
    //     : exception.getResponse();
    const error = exception.getError();
    const details = error instanceof Object ? { ...error } : { message: error };
    client.send(
      JSON.stringify({
        event: 'error',
        data: {
          id: (client as any).id,
          rid: data.rid,
          ...details,
        },
      }),
    );
    // }
  }
}
