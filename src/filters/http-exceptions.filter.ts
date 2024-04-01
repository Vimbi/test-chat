import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}
  catch(exception, host: ArgumentsHost) {
    this.logger.error('0000000');
    if (host.getType() === 'ws') {
      const client = host.switchToWs().getClient() as WebSocket;
      const data = host.switchToWs().getData();
      // const error =
      //   exception instanceof WsException
      //     ? exception.getError()
      //     : exception.getResponse();
      const error = exception.getError();
      const details =
        error instanceof Object ? { ...error } : { message: error };
      // this.logger.error(
      //   `${protocol} | ${status} | [${method}] | ${req.ip} | ${url}
      //       query={${query}}
      //       body={${body}}
      //       message={${JSON.stringify(message)}}`,
      // );
      this.logger.error('!!!!!', JSON.stringify(data));
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
    } else {
      this.logger.error('!!!!!');
      const ctx = host.switchToHttp();
      const res = ctx.getResponse();

      const req = ctx.getRequest();
      const { method, protocol, originalUrl: url } = req;
      const query = JSON.stringify(req.query);
      let body = '';
      if (req.body) {
        body = JSON.stringify(
          req.body.password ? { ...req.body, password: '******' } : req.body,
        );
      }
      let status: number;
      let message = '';
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        exception = exception.getResponse();
        if (typeof exception === 'string') {
          message = exception;
        } else if (exception.message) {
          message = exception.message;
        } else {
          message = exception;
        }
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = exception.message;
      }
      this.logger.error(
        `${protocol} | ${status} | [${method}] | ${req.ip} | ${url}
          query={${query}}
          body={${body}}
          message={${JSON.stringify(message)}}`,
      );
      res.status(status).json({
        statusCode: status,
        message: message,
        timestamp: new Date().toLocaleString('en-GB', {
          timeZone: 'Europe/London',
          hour12: false,
        }),
        path: req.url,
      });

      if (exception instanceof Error && !(exception instanceof HttpException)) {
        this.logger.error(`message: ${exception.message}
          stack trace: ${exception.stack}`);
      }
    }
  }
}
