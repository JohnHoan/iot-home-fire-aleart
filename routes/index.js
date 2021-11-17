const express = require('express');
const router = express.Router();
const model = require('../models/index');

router.get('/', async (req, res) => {
    let session = req.session;
    if (session.userid) {
        let dataTempHumid = await model.getLatestTempHumid();
        let dataGas = await model.getLatestGas();
        let data = dataTempHumid;
        data['gas'] = dataGas['gas_data'];
        res.render('index', { data: data });
    } else {
        res.render('login', { layout: false });
    }
});

router.get('/dashboard', async (req, res) => {
    let session = req.session;
    if (session.userid) {
        let data = await model.getLatestTempHumid();
        let averageTempHumid = await model.getTempHumidAverage();
        let tempPeriodData = await model.getTempPeriod();
        data['average_temp'] = averageTempHumid['temp'];
        data['average_humid'] = averageTempHumid['humid'];
        data['period_temp'] = tempPeriodData;
        res.render('dashboard', { data: data });
    } else {
        res.render('login', { layout: false });
    }
});

router.get('/login', (req, res) => {
    res.render('login', { layout: false });
});

router.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let result = await model.authentication(username, password);
    if (result) {
        let session = req.session;
        session.userid = username;
        res.redirect('/');
    } else {
        res.redirect('login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
