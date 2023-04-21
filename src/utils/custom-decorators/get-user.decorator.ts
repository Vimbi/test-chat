import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (request.user) {
      if (!data) return request.user;
      return request.user[data];
    }
    return;
  },
);
