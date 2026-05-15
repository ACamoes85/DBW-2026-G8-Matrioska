"use strict";

import User from "../models/User.js";
import bcrypt from "bcrypt";

/**
 * Regista um novo utilizador.
 * Verifica se as passwords coincidem e se o email/username já existem.
 * Guarda a password com hash (bcrypt) antes de armazenar na BD.
 */
export const registrar = async (req, res) => {
    try {
        const { email, username, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ code: "passwordMismatch" });
        }

        // Verifica duplicados de email e username numa só query
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ code: "userExists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const novoUser = new User({ email, username, password: hashedPassword });
        await novoUser.save();

        // Cria a sessão imediatamente após o registo
        req.session.user = {
            id: novoUser._id,
            username: novoUser.username,
            avatar: novoUser.avatar,
        };

        res.status(201).json({ code: "registerSuccess" });
    } catch (err) {
        console.error("Erro ao registar:", err);
        res.status(500).json({ code: "serverError" });
    }
};

/**
 * Autentica um utilizador com email, username e password.
 * Cria a sessão em caso de sucesso.
 */
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

        req.session.user = {
            id: user._id,
            username: user.username,
            avatar: user.avatar,
        };

        res.status(200).json({ code: "loginSuccess" });
    } catch (err) {
        console.error("Erro ao fazer login:", err);
        res.status(500).json({ code: "serverError" });
    }
};

/**
 * Actualiza o avatar do utilizador na BD e sincroniza a sessão.
 */
export const updateAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;
        const userId = req.session.user?.id;
        if (!userId) return res.status(401).json({ message: "Sessão expirada." });

        await User.findByIdAndUpdate(userId, { avatar });

        req.session.user.avatar = avatar;
        req.session.save((err) => {
            if (err) return res.status(500).json({ message: "Erro ao guardar sessão." });
            return res.status(200).json({ message: "Avatar actualizado." });
        });
    } catch (err) {
        console.error("Erro ao actualizar avatar:", err);
        res.status(500).json({ message: "Erro interno." });
    }
};

/**
 * Termina a sessão do utilizador e redireciona para a homepage.
 */
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
