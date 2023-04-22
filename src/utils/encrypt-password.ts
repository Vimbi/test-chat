import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

/**
 * Encrypt password by bcryptjs with salt
 * @param password password
 * @returns return encrypted password
 */

export const encryptPassword = async (password: string) => {
  const saltRounds = process.env.SALT_ROUNDS;
  const salt = await bcrypt.genSalt(parseInt(saltRounds, 10));
  return await bcrypt.hash(password, salt);
};
