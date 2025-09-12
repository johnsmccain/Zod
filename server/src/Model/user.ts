import mongoose, { Query } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    passwordConfirm: {
        type: String,
        required: [true, "Password confirmation is required"],
        validate: {
            validator: function(this: any, value: string) {
                return value === this.password;
            },
            message: "Password confirmation does not match",
        },
    },
    passwordChangedAt: Date,
    address: String,
    privateKey: String,
    mnemonic: String,
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = "";
    next();
});

userSchema.pre("save", async function(next) { 
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
});

userSchema.pre(/^find/, function(this: Query<any, any>, next) {
    (this as Query<any, any>).find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword: string, userPassword: string) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp: number) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000).toString(), 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};


const User = mongoose.model("User", userSchema);

export default User;