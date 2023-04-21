import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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

  public createUserModel(user) {
    return new this.userModel(user);
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findUser(filter: FilterQuery<User>) {
    return await this.userModel.findOne(filter).select('password').exec();
  }

  async findNoPass(filter: FilterQuery<User>) {
    return await this.userModel
      .findOne(filter)
      .populate('messages')
      .select('loginAt')
      .exec();
  }

  async findUserOrFail(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Пользователя не существует');
    }

    return user;
  }

  async updateUser(_id: string, body: UpdateDto) {
    await this.findUserOrFail(_id);
    return await this.userModel
      .updateOne({ _id }, { $set: { ...body } })
      .exec();
  }

  async deleteUser(id: string) {
    await this.findUserOrFail(id);
    return await this.userModel.deleteOne({ id }).exec();
  }
}
