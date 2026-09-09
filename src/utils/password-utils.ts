import bcrypt from "bcrypt";

export const enctyptPassword = async (password: string): Promise<string> => {
  const passwordSalt = Number(process.env.PASSWORD_SALT || 10);
  return await bcrypt.hash(password, passwordSalt);
};

export const comparePassword = async (password: string,hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};