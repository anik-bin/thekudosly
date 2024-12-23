import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxLength: 100,
        index: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, // Email validation
    },

    password: {
        type: String,
        required: [true, "Password is required"],
    },

    profilePicture: {
        type: String,
        default: "https://res.cloudinary.com/dgrmoexeo/image/upload/v1734859619/n17fniccnbqhxjjormoj.jpg" // to be added in .env variables
    },

    kudos: {
        type: Number,
        default: 3,
        min: 0,
    },

    lastKudosRefresh: {
        type: Date,
        default: Date.now,
    },
    refreshToken: {
        type: String,
      },

},
    {
        timestamps: true,
    }
)

// Hash the password before saving the user model

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// call methods

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { 
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { 
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        { 
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
        }
    )
}
export const User = mongoose.model("User", userSchema);