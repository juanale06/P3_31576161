import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'mi?claveSecretaDawaherJuanSecc2';
const JWT_EXPIRES_IN:any = process.env.JWT_EXPIRES_IN || '24h';

export interface JwtPayload {
  id: number;
  email: string;
}

export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };

  // 👇 Forzamos el tipo correcto de opciones
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
