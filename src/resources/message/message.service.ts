import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './entities/message.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  /**
   * Create message
   * @param text message text
   * @param author message author
   * @returns message
   */

  async create(text: string, author: User) {
    const createdMessage = new this.messageModel({
      text,
      createdAt: new Date(),
    });
    createdMessage.author = author;
    // return await auth.save();
    return await createdMessage.save();
  }

  /**
   * Return all messages
   * @returns array of messages
   */

  async findAll() {
    return await this.messageModel.find();
  }

  /**
   * Return messages by filter
   * @param filter message filter
   * @returns array of messages
   */

  async findBy(filter: FilterQuery<Message>) {
    const msgs = await this.messageModel.find(filter).exec();
    return msgs;
  }
}
