"use strict";

import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
    try {
        const players = await User.find()
            .sort({ "stats.totalScore": -1 })
            .limit(10)
            .select("username stats.totalScore avatar");

        const userAtualizado = await User.findById(req.session.user.id);

        res.render('leaderboard', { 
            players, 
            user: userAtualizado 
        });
    } catch (err) {
        res.render('leaderboard', { players: [], user: req.session.user });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.redirect('/login');
        res.render('profile', { user });
    } catch (err) {
        res.redirect('/hub');
    }
};

export const getEditProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.redirect('/login');
        res.render('edit-profile', { user });
    } catch (err) {
        res.redirect('/profile');
    }
};

export const getHub = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render('hub', { user });
    } catch (err) {
        res.render('hub', { user: req.session.user });
    }
};

export const getHowToPlay = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render('howtoplay', { user });
    } catch (err) {
        res.render('howtoplay', { user: req.session.user });
    }
};

export const getCreateMatch = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render('create-match', { user }); 
    } catch (err) {
        res.render('create-match', { user: req.session.user });
    }
};

export const getLoadingMatch = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render('loadingmatch', { user });
    } catch (err) {
        res.render('loadingmatch', { user: req.session.user });
    }
};

export const getResultsLoading = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render('resultsloading', { user });
    } catch (err) {
        res.render('resultsloading', { user: req.session.user });
    }
};

export const getScoreboard = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render('scoreboard', { user });
    } catch (err) {
        res.render('scoreboard', { user: req.session.user });
    }
};