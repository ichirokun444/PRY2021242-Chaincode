const bcrypt = require('bcrypt');
const saltRounds = 10;

export function HashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}


export function ComparePassword(hash: string, password: string): string {
  return bcrypt.compareSync(password, hash);
}