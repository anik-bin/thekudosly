import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
    url: {
        type: String,
        required: true,
        unique: true,
        match: /^https:\/\/www\.youtube\.com\/watch\?v=.+$/, // Ensures it's a valid YouTube link
    },
    title: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    submittedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to User schema
        required: true,
    },
    tokenCount: {
        type: Number,
        default: 0,
    },
    appreciatedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User', // List of users who appreciated the video
        },
    ],
},
    {
        timestamps: true,
    }
);


export const Videos = mongoose.model("Videos", videoSchema);
