import mongoose, { Document } from 'mongoose';
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
export declare const UserModel: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, mongoose.DefaultSchemaOptions> & IUserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUserDocument>;
//# sourceMappingURL=user.model.d.ts.map