import mongoose from "mongoose";
import { Password } from "../services/password";

// describe properties that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// describe properties that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// describe the properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// define user schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// hash user password
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

// build user
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// define User model from schema
const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
