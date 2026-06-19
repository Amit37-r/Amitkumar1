import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUserDocument } from './user.model';
import { ISignupRequest, ILoginRequest, IAuthResponse } from './auth.types';

const SALT_ROUNDS = 10;

export class AuthService {
  private jwtSecret: string;

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret;
  }

  async signup(data: ISignupRequest): Promise<IAuthResponse> {
    // Check if user already exists
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      throw new Error('A user with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(data: ILoginRequest): Promise<IAuthResponse> {
    // Find user
    const user = await UserModel.findOne({ email: data.email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isMatch = await bcryptjs.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  }

  async getUserById(userId: string): Promise<{ id: string; name: string; email: string } | null> {
    const user = await UserModel.findById(userId).select('-password');
    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      return decoded;
    } catch {
      return null;
    }
  }

  private generateToken(user: IUserDocument): string {
    return jwt.sign(
      { userId: user._id.toString() },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }
}
