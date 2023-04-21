import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '../../../types/user.interface';
import { Message } from '../../message/entities/message.entity';

@Schema()
export class User extends Document implements IUser {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, select: false })
  loginAt: Date;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Message' })
  messages: Message[];
}

export const UserSchema = SchemaFactory.createForClass(User);
