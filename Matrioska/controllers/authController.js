"use strict";

import User from "../models/User.js";
import bcrypt from "bcrypt";

export const registrar = async (req, res) => {
    try {
        const { email, username, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "As passwords não coincidem." });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: "Email ou utilizador já em uso." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const novoUser = new User({
            email,
            username,
            password: hashedPassword
        });

        await novoUser.save();
        
        // Criar sessão automaticamente ao registar
        req.session.user = { id: novoUser._id, username: novoUser.username, avatar: novoUser.avatar };
        
        res.status(201).json({ message: "Conta criada com sucesso!" });
    } catch (err) {
        res.status(500).json({ message: "Erro ao registar." });
    }
};

export const login = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const user = await User.findOne({ email, username });
        if (!user) {
            return res.status(400).json({ message: "Utilizador não encontrado." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password incorreta." });
        }

        // Guardar dados importantes na sessão
        req.session.user = {
            id: user._id,
            username: user.username,
            avatar: user.avatar
        };

        res.status(200).json({ message: "Login efetuado!" });
    } catch (err) {
        res.status(500).json({ message: "Erro ao entrar." });
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