import express from 'express';
const router = express.Router();

router.get(['/', '/homepage'], (req, res) => res.render('homepage'));
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));
router.get('/hub', (req, res) => res.render('hub'));
router.get('/profile', (req, res) => res.render('profile'));
router.get('/leaderboard', (req, res) => res.render('leaderboard'));
router.get('/howtoplay', (req, res) => res.render('howtoplay'));
router.get('/create-match', (req, res) => res.render('create-match'));
router.get('/lobby', (req, res) => res.render('lobby'));
router.get('/edit-profile', (req, res) => res.render('edit-profile'));
router.get('/gamescreen', (req, res) => res.render('gamescreen'));
router.get('/loadingmatch', (req, res) => res.render('loadingmatch'));
router.get('/resultsloading', (req, res) => res.render('resultsloading'));
router.get('/scoreboard', (req, res) => res.render('scoreboard'));

export default router;