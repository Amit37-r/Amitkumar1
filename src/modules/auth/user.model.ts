import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  githubToken?: string;
  githubUsername?: string;
  githubRepos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    githubToken: {
      type: String,
      default: null,
    },
    githubUsername: {
      type: String,
      default: null,
    },
    githubRepos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast email lookups
UserSchema.index({ email: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
