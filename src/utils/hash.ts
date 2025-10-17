import bcrypt from "bcrypt";

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10);

export const hashPassword = (password: string)=> {
    return bcrypt.hash(password, saltRounds);
}

export const verifyPassword = (password: string, hash: string)=> {
    return bcrypt.compare(password, hash);
}