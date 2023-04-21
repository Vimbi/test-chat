import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './entities/message.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly userService: UserService,
  ) {}

  async create(text: string, author: User) {
    const createdMessage = new this.messageModel({
      text,
      createdAt: new Date(),
    });
    createdMessage.author = author;
    // return await auth.save();
    return await createdMessage.save();
  }

  async findAll() {
    return await this.messageModel.find();
  }
}
