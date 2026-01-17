import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { CONFIG } from "./config";

export interface TokenPayload extends JWTPayload {
  userId: string;
  username: string;
}

const secret = new TextEncoder().encode(CONFIG.JOSE_SECRET);
const alg = "HS256";

export const SignToken = async (payload: TokenPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
};

export const VerifyToken = async (token: string): Promise<TokenPayload> => {
  const { payload } = await jwtVerify(token, secret);

  return payload as TokenPayload;
};
