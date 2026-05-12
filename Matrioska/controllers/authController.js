"use strict";

import User from "../models/User.js";
import bcrypt from "bcrypt";

export const registrar = async (req, res) => {
    try {
        const { email, username, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ code: "passwordMismatch" });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ code: "userExists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const novoUser = new User({ email, username, password: hashedPassword });
        await novoUser.save();

        req.session.user = { id: novoUser._id, username: novoUser.username, avatar: novoUser.avatar };

        res.status(201).json({ code: "registerSuccess" });
    } catch (err) {
        res.status(500).json({ code: "serverError" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const user = await User.findOne({ email, username });
        if (!user) {
            return res.status(400).json({ code: "userNotFound" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ code: "wrongPassword" });
        }

        req.session.user = { id: user._id, username: user.username, avatar: user.avatar };

        res.status(200).json({ code: "loginSuccess" });
    } catch (err) {
        res.status(500).json({ code: "serverError" });
    }
};

export const updateAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;
        const userId = req.session.user.id;

        await User.findByIdAndUpdate(userId, { avatar });

        if (req.session.user) {
            req.session.user.avatar = avatar;
            req.session.save((err) => {
                if (err) return res.status(500).json({ message: "Erro" });
                return res.status(200).json({ message: "Sucesso" });
            });
        }
    } catch (err) {
        res.status(500).json({ message: "Erro" });
    }
};
export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Erro ao terminar sessão:", err);
            return res.redirect("/profile");
        }
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
};