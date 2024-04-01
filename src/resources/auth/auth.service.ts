import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { AuthEmailLoginDto } from './dto/auth-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { encryptPassword } from '../../utils/encrypt-password';
import { errorMsgs } from '../../shared/error-messages';

@Injectable()
export class AuthService {
  _authSecret: string;
  _authExpiresIn: string;
  _frontendDomain: string;
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
    private configService: ConfigService,
  ) {
    this._authSecret = this.configService.get('auth.secret');
    this._authExpiresIn = this.configService.get('auth.expires');
    this._frontendDomain = this.configService.get('app.frontendDomain');
  }

  /**
   * Create token
   * @param user User
   * @return token
   */

  createToken(user: User) {
    const jwtPayload = {
      id: user._id,
    };
    const tokenOptions = {
      secret: this._authSecret,
      expiresIn: this._authExpiresIn,
    };
    const token = this.jwtService.sign(jwtPayload, tokenOptions);
    return {
      token,
    };
  }

  /**
   * Validate login
   * @param loginDto login dto
   * @returns token and user
   */

  async validateLogin(loginDto: AuthEmailLoginDto) {
    const user = await this.usersService.findUser({
      email: loginDto.email,
    });

    if (!user) {
      throw new UnprocessableEntityException('Пользователь не существует');
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (isValidPassword) {
      const token = this.createToken(user);
      await this.usersService.updateUser(user._id, { loginAt: new Date() });
      return token;
    } else {
      throw new UnprocessableEntityException('Логин/Пароль не верный');
    }
  }

  /**
   * Create user, send confirm email
   * @param dto data to create User
   * @return void
   */

  async register(dto: AuthRegisterLoginDto) {
    const password = await encryptPassword(dto.password);
    return await this.usersService.createUser({ email: dto.email, password });
  }

  /**
   * Get user by token
   * @param authHeader authorization header
   * @returns user
   * @throws WsException
   */

  async getUserByToken(authHeader: string) {
    if (!authHeader) {
      throw new WsException(errorMsgs.authSchemeError);
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new WsException(errorMsgs.authSchemeError);
    }

    const payload = await this.jwtService.verify(token, {
      secret: this._authSecret,
    });
    return await this.usersService.findUserOrFail(payload['id']);
  }
}
