import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../../../lib/db';
import { users } from '../../../lib/schema';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password, isDoctor, firstName, lastName } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    // Check for existing user
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)))
      .limit(1);

    if (existing.length > 0) {
      const field = existing[0].username === username ? 'username' : 'email';
      return res.status(409).json({ error: `An account with this ${field} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        isDoctor: isDoctor || false,
        firstName: firstName || null,
        lastName: lastName || null,
      })
      .returning({ id: users.id, username: users.username, email: users.email });

    return res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
