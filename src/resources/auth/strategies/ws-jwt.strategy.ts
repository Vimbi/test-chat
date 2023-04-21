import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { WsException } from '@nestjs/websockets';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from '../../../types/jwt-payload.interface';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'wsjwt') {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.secret'),
    });
  }

  async validate(payload: IJwtPayload) {
    if (!payload.id) {
      throw new WsException('Unauthorized access');
    }

    try {
      return await this.userService.findUserOrFail(payload.id);
    } catch (error) {
      throw new WsException('Unauthorized access');
    }
  }
}
