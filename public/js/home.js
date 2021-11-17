let time = document.querySelector('#time-now');
let btnLight = document.querySelectorAll('.toggle-btn')[0];
let btnSpeaker = document.querySelectorAll('.toggle-btn')[1];
let light = document.getElementById('light_img');
let speaker = document.getElementById('speaker_img');

const socket = io();

let temp = 0;
let gasCheck = 0;
let flag = false;

socket.on('data-temp-humid', (data) => {
    let receivedData = JSON.parse(data);
    let tempHumid = receivedData['data'];
    temp = Number(tempHumid.split('-')[0]);
    let humid = Number(tempHumid.split('-')[1]);
    receiveHandler(temp, gasCheck);
    tempUpdate(temp);
    humidUpdate(humid);
    flag = true;
});

socket.on('data-gas', (data) => {
    let receivedData = JSON.parse(data);
    gasCheck = Number(receivedData['data']);
    receiveHandler(temp, gasCheck);
    gasUpdate(gasCheck);
});

socket.on('data-speaker', (data) => {
    let receivedData = JSON.parse(data);
    let dataSpeaker = Number(receivedData['data']);
    if (!btnLight.classList.contains('active') && dataSpeaker == 0) return;
    if (btnLight.classList.contains('active') && dataSpeaker == 0)
        turnOff(btnSpeaker, speaker);
    if (btnLight.classList.contains('active') && dataSpeaker != 0) return;
    if (!btnLight.classList.contains('active') && dataSpeaker != 0)
        turnOn(btnSpeaker, speaker);
});

socket.on('data-led', (data) => {
    let receivedData = JSON.parse(data);
    let dataLed = Number(receivedData['data']);
    if (!btnLight.classList.contains('active') && dataLed == 0) return;
    if (btnLight.classList.contains('active') && dataLed == 0)
        turnOff(btnLight, light);
    if (btnLight.classList.contains('active') && dataLed != 0) return;
    if (!btnLight.classList.contains('active') && dataLed != 0)
        turnOn(btnLight, light);
});

function receiveHandler(temp, gasCheck) {
    let sendLed = '0';
    let sendBuzzer = '0';
    if (temp > 70 || gasCheck == 1) {
        if (!btnLight.classList.contains('active')) turnOn(btnLight, light);
        if (!btnSpeaker.classList.contains('active')) {
            turnOn(btnSpeaker, speaker);
        }
        sendLed = '1';
        sendBuzzer = '255';
        socket.emit('send-led', sendLed);
        socket.emit('send-buzzer', sendBuzzer);
    } else {
        turnOff(btnLight, light);
        turnOff(btnSpeaker, speaker);
        sendLed = '0';
        sendBuzzer = '0';
        socket.emit('send-led', sendLed);
        socket.emit('send-buzzer', sendBuzzer);
    }
    return;
}

btnLight.addEventListener('click', () => {
    let sendLed = '0';
    if (btnLight.classList.contains('active')) {
        turnOff(btnLight, light);
        socket.emit('send-led', sendLed);
    } else {
        sendLed = '1';
        turnOn(btnLight, light);
        socket.emit('send-led', sendLed);
    }
});

btnSpeaker.addEventListener('click', () => {
    let sendBuzzer = '0';
    if (btnSpeaker.classList.contains('active')) {
        turnOff(btnSpeaker, speaker);
        socket.emit('send-buzzer', sendBuzzer);
    } else {
        sendBuzzer = '255';
        turnOn(btnSpeaker, speaker);
        socket.emit('send-buzzer', sendBuzzer);
    }
});

function turnOn(btn, bulb) {
    if (btn.classList.contains('active')) return;
    btn.classList.toggle('active');
    if (bulb.src.match('bulboff')) {
        bulb.src =
            'https://s3-us-west-2.amazonaws.com/s.cdpn.io/93927/pic_bulbon.gif';
    }
}
function turnOff(btn, bulb) {
    if (!btn.classList.contains('active')) return;
    btn.classList.remove('active');
    if (bulb.src.match('bulbon')) {
        bulb.src =
            'https://s3-us-west-2.amazonaws.com/s.cdpn.io/93927/pic_bulboff.gif';
    }
}

function timeUpdate() {
    let hour = new Date().getHours();
    let minutes = new Date().getMinutes();
    time.innerHTML = `${hour}:${minutes}`;
}

function tempUpdate(num) {
    let temp = document.querySelector('#temp-res');
    temp.innerHTML = `Temperature: ${num}°C`;
}

function humidUpdate(num) {
    let temp = document.querySelector('#humid-res');
    temp.innerHTML = `Humidity: ${num}%`;
}

function gasUpdate(check) {
    let gas = document.querySelector('#gas-res');
    if (check) {
        gas.innerHTML = `Gas Checking: Unsafety`;
        return;
    }
    gas.innerHTML = `Gas Checking: Safety`;
}
if (!flag) {
    tempUpdate(tempdb);
    humidUpdate(humiddb);
    gasUpdate(gasdb);
    receiveHandler(tempdb, gasdb);
}
setInterval(timeUpdate, 1000);
