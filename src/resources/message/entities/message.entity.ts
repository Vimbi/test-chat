import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../../user/entities/user.entity';

@Schema()
export class Message extends Document {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: User;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
