const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mqtt = require('mqtt');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');
const io = socketio(server);

app.use(express.static(publicDirectoryPath));

const client = mqtt.connect('mqtt://io.adafruit.com', {
    username: 'NguyenHoan',
    password: 'aio_ZRXy64054lmtZlS12rdVw77QSO7M',
});

const pubLed = (data) => {
    client.on('connect', function () {
        console.log('ok');
        client.publish(
            'NguyenHoan/feeds/bk-iot-led',
            JSON.stringify(data),
            { qos: 1, retain: true },
            function (err) {
                if (err) {
                    console.log('error publish', err);
                }
            }
        );
    });
};

const pubBuzzer = (data) => {
    client.on('connect', function () {
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
};

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

    client.subscribe('NguyenHoan/feeds/bk-iot-gas', function (err) {
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
    let data = message.toString();
    console.log(data);
    if (topic == 'NguyenHoan/feeds/bk-iot-temp-humid') {
        io.emit('data-temp-humid', data);
    } else if (topic == 'NguyenHoan/feeds/bk-iot-led') {
        io.emit('data-led', data);
    } else if (topic == 'NguyenHoan/feeds/bk-iot-gas') {
        io.emit('data-gas', data);
    } else if (topic == 'NguyenHoan/feeds/bk-iot-speaker') {
        io.emit('data-speaker', data);
    }
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
