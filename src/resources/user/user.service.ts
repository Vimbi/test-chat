import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { MessageService } from '../message/message.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private messageService: MessageService,
  ) {}

  /**
   * Create user
   * @param dto data to create user
   * @returns user
   * @throws BadRequestException if email already exist
   */

  async createUser(dto: RegisterDto) {
    const { email } = dto;
    const existingUser = await this.findUser({ email });
    if (existingUser) {
      throw new BadRequestException(
        'Пользователя с такой электронной почтой уже существует',
      );
    }
    const newUser = new this.userModel(dto);
    const result = await newUser.save();
    const user = this.findUser(result._id);
    return user;
  }

  /**
   * Return all user
   * @returns array of users
   */

  async findAll() {
    return await this.userModel.find();
  }

  /**
   * Return user with password
   * @param filter filter options
   * @returns user
   */

  async findUser(filter: FilterQuery<User>) {
    return await this.userModel.findOne(filter).select('password').exec();
  }

  /**
   * Return user without password, with extended information
   * @param filter filter options
   * @returns user
   */

  async findBy(filter: FilterQuery<User>) {
    const user = await this.userModel.findOne(filter).select('loginAt').exec();
    user.messages = await this.messageService.findBy({
      author: user._id,
    });
    return user;
  }

  /**
   * Return user by id or fail
   * @param id user id
   * @returns user
   * @throws NotFoundException
   */

  async findUserOrFail(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Пользователя не существует');
    }
    return user;
  }

  /**
   * Update user by id
   * @param _id user id
   * @param body data to update user
   * @returns user
   */

  async updateUser(_id: string, body: UpdateDto) {
    await this.findUserOrFail(_id);
    return await this.userModel
      .updateOne({ _id }, { $set: { ...body } })
      .exec();
  }

  /**
   * Delete user by id
   * @param id user id
   * @returns delete result
   */

  async deleteUser(id: string) {
    await this.findUserOrFail(id);
    return await this.userModel.deleteOne({ id }).exec();
  }
}
