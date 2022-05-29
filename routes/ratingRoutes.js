const express = require('express');
const mw = require('../middleware')
const {upOrDownVote, giveRating} = require('../handlers/ratings');
const router = express.Router();

router.post('/id=:id', mw.isLoggedIn, giveRating);
router.post('/vote/id=:id', mw.isLoggedIn, upOrDownVote);

module.exports = router;