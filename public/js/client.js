let time = document.querySelector('#time-now');
let sidebar = document.querySelector('.sidebar');
let closeBtn = document.querySelector('#btn');
let btnLight = document.querySelectorAll('.toggle-btn')[0];
let btnSpeaker = document.querySelectorAll('.toggle-btn')[1];
let light = document.getElementById('light_img');
let speaker = document.getElementById('speaker_img');

closeBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    menuBtnChange(); //calling the function(optional)
});
// following are the code to change sidebar button(optional)
function menuBtnChange() {
    if (sidebar.classList.contains('open')) {
        closeBtn.classList.replace('bx-menu', 'bx-menu-alt-right'); //replacing the iocns class
    } else {
        closeBtn.classList.replace('bx-menu-alt-right', 'bx-menu'); //replacing the iocns class
    }
}

const socket = io();

let temp = 0;
let gasCheck = 0;

socket.on('data-temp-humid', (data) => {
    let receivedData = JSON.parse(data);
    let tempHumid = receivedData['data'];
    temp = Number(tempHumid.split('-')[0]);
    let humid = Number(tempHumid.split('-')[1]);
    receiveHandler(temp, gasCheck);
    tempUpdate(temp);
    humidUpdate(humid);
});

socket.on('data-gas', (data) => {
    let receivedData = JSON.parse(data);
    gasCheck = Number(receivedData['data']);
    receiveHandler(temp, gasCheck);
    gasUpdate(gasCheck);
});

function receiveHandler(temp, gasCheck) {
    console.log(temp);
    console.log(gasCheck);
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

function alertPossibility(num) {
    const progress = document.querySelector('.progression');
    progress.setAttribute('data-progress', `${num}`);
    progress.textContent = `${num}%`;
    progress.style.height = progress.getAttribute('data-progress') + '%';
    if (num <= 40) {
        progress.style.backgroundColor = 'rgb(87, 245, 87)';
    } else if (num > 40 && num < 75) {
        progress.style.backgroundColor = 'orange';
    } else {
        progress.style.backgroundColor = 'red';
    }
    progress.style.opacity = 1;
}

setInterval(timeUpdate, 1000);
alertPossibility(70);
