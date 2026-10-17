import express, { Request, Response } from 'express';
import { db, hashPassword, generateToken, verifyToken } from '../db';
import { User, UserRole } from '../types';

export const authRouter = express.Router();

export function authenticate(req: Request, res: Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Session expired or invalid token' });
  }

  const user = db.getUserById(payload.id);
  if (!user) {
    return res.status(401).json({ error: 'User account not found' });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: 'This account has been suspended by administration' });
  }

  (req as any).user = user;
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: express.NextFunction) => {
    const user = (req as any).user as User;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
}

authRouter.post('/register', (req: Request, res: Response) => {
  const { name, email, password, role, bio } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const userRole: UserRole = role === 'seller' ? 'seller' : 'buyer';
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    role: userRole,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString(),
    isVerifiedSeller: userRole === 'seller' ? false : undefined,
    bio: bio || '',
    dealsCount: 0,
    rating: 5.0
  };

  db.createUser(newUser);
  const token = generateToken(newUser);

  const { passwordHash, ...userSafe } = newUser;
  return res.json({ user: userSafe, token });
});

authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const hashed = hashPassword(password);
  if (user.passwordHash !== hashed) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: 'Account suspended by administration' });
  }

  const token = generateToken(user);
  const { passwordHash, ...userSafe } = user;
  return res.json({ user: userSafe, token });
});

authRouter.get('/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { passwordHash, ...userSafe } = user;
  return res.json({ user: userSafe });
});

// Demo Persona Quick-Switch for easy testing of Buyer, Seller, and Admin roles
authRouter.post('/quick-switch', (req: Request, res: Response) => {
  const { role } = req.body;
  let targetUser: User | undefined;

  if (role === 'admin') {
    return res.status(403).json({ error: 'Admin quick switch disabled. Please log in with alifsheenshopping@gmail.com' });
  } else if (role === 'seller') {
    targetUser = db.getUserByEmail('apex.creators@gmail.com');
  } else {
    targetUser = db.getUserByEmail('investor.mark@gmail.com');
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Target persona user not found' });
  }

  const token = generateToken(targetUser);
  const { passwordHash, ...userSafe } = targetUser;
  return res.json({ user: userSafe, token });
});

authRouter.put('/profile', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { name, bio, avatar, role } = req.body;

  const updates: Partial<User> = {};
  if (name) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (avatar) updates.avatar = avatar;
  if (role && (role === 'buyer' || role === 'seller')) updates.role = role;

  const updated = db.updateUser(user.id, updates);
  if (!updated) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }

  const { passwordHash, ...userSafe } = updated;
  return res.json({ user: userSafe });
});
