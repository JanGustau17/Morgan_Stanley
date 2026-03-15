import { createHmac, timingSafeEqual } from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export function signPhoneToken(payload: { volunteerId: string; exp: number }): string {
  if (!AUTH_SECRET) throw new Error("AUTH_SECRET or NEXTAUTH_SECRET not set");
  const data = JSON.stringify(payload);
  const sig = createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");
  return `${Buffer.from(data).toString("base64url")}.${sig}`;
}

export function verifyPhoneToken(token: string): { volunteerId: string } | null {
  if (!AUTH_SECRET) return null;
  const [raw, sig] = token.split(".");
  if (!raw || !sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(raw, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    const data = JSON.stringify({ volunteerId: payload.volunteerId, exp: payload.exp });
    const expected = createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");
    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
    return { volunteerId: payload.volunteerId };
  } catch {
    return null;
  }
}
