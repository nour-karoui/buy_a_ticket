import mongoose from 'mongoose';
import {Password} from "../services/password";

// Interface that describes the properties to create a new user
interface UserAttrs {
    email: string;
    password: string;
}

// Interface that describes the properties of a mongoose model
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

// Interface that describes the actual properties of a User Document
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema(
    {
    email: { type: String, required: true },
    password: { type: String, required: true }
    },
    {
        toJSON: {
            versionKey: false,
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
            }
        }
    });

userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export {User};
