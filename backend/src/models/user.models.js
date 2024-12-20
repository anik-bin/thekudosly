import mongoose, { Schema } from "mongoose";

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
        lowerCase: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, // Email validation
    },

    password: {
        type: String,
        required: [true, "Password is required"],
    },

    tokens: {
        type: Number,
        default: 3,
        min: 0,
    },

    lastTokenRefresh: {
        type: Date,
        default: Date.now,
    }

},
    {
        timestamps: true,
    }
)

export const User = mongoose.model("User", userSchema);