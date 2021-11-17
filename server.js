const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const indexRouter = require('./routes/index');
const model = require('./models/index');
const server = require('http').Server(app);
const socketio = require('socket.io');
const oneDay = 1000 * 60 * 60 * 24;
const port = process.env.PORT || 3000;
const io = socketio(server);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.set('socketio', io);
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(cookieParser());
app.use(
    sessions({
        secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
        saveUninitialized: true,
        cookie: { maxAge: oneDay },
        resave: false,
    })
);
app.use('/', indexRouter);

const client = mqtt.connect('mqtt://io.adafruit.com', {
    username: 'NguyenHoan',
    password: 'aio_nhzM065IHnR7qKFRgRCtuD8NvXjy',
});

const client1 = mqtt.connect('mqtt://io.adafruit.com', {
    username: 'NguyenHoan',
    password: 'aio_nhzM065IHnR7qKFRgRCtuD8NvXjy',
});

io.on('connection', (socket) => {
    socket.on('send-led', (dataLed) => {
        let data = {
            id: '1',
            name: 'LED',
            data: dataLed,
            unit: '',
        };
        client.publish(
            'NguyenHoan/feeds/bk-iot-led',
            JSON.stringify(data),
            { qos: 2, retain: true },
            function (err) {
                if (err) {
                    console.log('error publish', err);
                }
            }
        );
    });
    socket.on('send-buzzer', (dataBuzzer) => {
        let data = {
            id: '2',
            name: 'SPEAKER',
            data: dataBuzzer,
            unit: '',
        };
        client.publish(
            'NguyenHoan/feeds/bk-iot-speaker',
            JSON.stringify(data),
            { qos: 2, retain: true },
            function (err) {
                if (err) {
                    console.log('error publish', err);
                }
            }
        );
    });
});

client.on('connect', function () {
    client.subscribe('NguyenHoan/feeds/bk-iot-led', function (err) {
        if (err) {
            console.log(err);
        }
    });

    client.subscribe('NguyenHoan/feeds/bk-iot-temp-humid', function (err) {
        if (err) {
            console.log(err);
        }
    });
    client.subscribe('NguyenHoan/feeds/bk-iot-speaker', function (err) {
        if (err) {
            console.log(err);
        }
    });
});

client.on('message', function (topic, message) {
    // save to database
    let data = message.toString();
    console.log(data);
    if (topic == 'NguyenHoan/feeds/bk-iot-temp-humid') {
        let sendData = JSON.parse(data)['data'];
        let temp = Number(sendData.split('-')[0]);
        let humid = Number(sendData.split('-')[1]);
        model.insertTempHumid(temp, humid);
        io.emit('data-temp-humid', data);
    } else if (topic == 'NguyenHoan/feeds/bk-iot-led') {
        io.emit('data-led', data);
    } else if (topic == 'NguyenHoan/feeds/bk-iot-speaker') {
        io.emit('data-speaker', data);
    }
});

client1.on('connect', function () {
    client1.subscribe('NguyenHoan/feeds/bk-iot-gas', function (err) {
        if (err) {
            console.log(err);
        }
    });
});
client1.on('message', function (topic, message) {
    let data = message.toString();
    if (topic == 'NguyenHoan/feeds/bk-iot-gas') {
        let dataSend = JSON.parse(data)['data'];
        let gasData = Number(dataSend);
        model.insertGas(gasData);
        io.emit('data-gas', data);
    }
    console.log(data);
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
