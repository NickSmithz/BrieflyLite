import crypto from "node:crypto";

export function passwordMatches(password: string) {
  const plain = process.env.TEAM_PASSWORD;
  const hash = process.env.TEAM_PASSWORD_HASH;

  if (hash) {
    const digest = crypto.createHash("sha256").update(password).digest("hex");
    return digest === hash;
  }

  return Boolean(plain) && password === plain;
}
