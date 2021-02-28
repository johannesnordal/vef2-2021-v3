import bcrypt from 'bcrypt';
import { query, end } from './db.js';

export async function createUser(username, password, admin = false) {
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = `
    INSERT INTO
      users (username, password, admin)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  try {
    const result = await query(q, [username, hashedPassword, admin]);
    return result.rows[0];
  } catch (e) {
    console.error('Gat ekki búið til notanda', e);
  }

  return null;
}

export async function comparePasswords(password, user) {
  const ok = await bcrypt.compare(password, user.password);

  if (ok) {
    return user;
  }

  return false;
}

export async function findByUsername(username) {
  const q = `
    SELECT * FROM users WHERE username = $1
  `;
  try {
    const user = await query(q, [username]);
    return user.rows[0];
  } catch (e) {
    console.error(`Fann ekki notanda með notandanafn: ${username}`, e);
  }
}

export async function findById(id) {
  const q = `
    SELECT * FROM users WHERE id = $1
  `;
  try {
    const user = await query(q, [id]);
    return user.rows[0];
  } catch (e) {
    console.error(`Fann ekki notanda með id: ${id}`, e);
  }
}
