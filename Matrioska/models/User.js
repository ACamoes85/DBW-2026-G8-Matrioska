"use strict";

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    avatar: { 
        type: String, 
        default: '/images/profile1.png' 
    },
    stats: {
        totalScore: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
        wrongAnswers: { type: Number, default: 0 },
        gamesPlayed: { type: Number, default: 0 }
    }
});

export default model("User", userSchema);