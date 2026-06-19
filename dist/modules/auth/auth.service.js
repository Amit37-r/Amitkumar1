import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from './user.model';
const SALT_ROUNDS = 10;
export class AuthService {
    jwtSecret;
    constructor(jwtSecret) {
        this.jwtSecret = jwtSecret;
    }
    async signup(data) {
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
    async login(data) {
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
    async getUserById(userId) {
        const user = await UserModel.findById(userId).select('-password');
        if (!user)
            return null;
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        };
    }
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            return decoded;
        }
        catch {
            return null;
        }
    }
    generateToken(user) {
        return jwt.sign({ userId: user._id.toString() }, this.jwtSecret, { expiresIn: '7d' });
    }
}
//# sourceMappingURL=auth.service.js.map