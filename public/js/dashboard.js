class Gauge {
    constructor(_canvas, _size, _type, _unit) {
        this.mcanvas = _canvas;
        this.mcanvas.width = _size;
        this.mcanvas.height = _size;
        this.size = _size;
        this.type = _type;
        this.unit = _unit;
        this.ctx = this.mcanvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = true;
        this.glass_png = new Image();
        this.glass_png.src =
            'https://raw.githubusercontent.com/mateczek/level-and-temperature-gauge-js/main/glass3.png';
        this.initialize_class_filled();
        this.glass_png.onload = () => {
            this.draw();
        };
    }
    initialize_class_filled() {
        this.center = { x: this.size / 2, y: this.size / 2 };
        this.gauge_level_value = 0;
        this.gauge_level_smoth_Value = 0;
        this.gauge_value = 0;
        this.gauge_smoth_value = 0;
    }
    smoth_Value() {
        this.gauge_level_smoth_Value =
            (this.gauge_level_value + 100 * this.gauge_level_smoth_Value) / 101;
        const val1_ZeroToPI = (Math.PI * this.gauge_level_smoth_Value) / 100;

        this.gauge_smoth_value =
            (this.gauge_value + 100 * this.gauge_smoth_value) / 101;

        const start2 = 0.3;
        const val2_ZeroToPI =
            start2 + (0.8 * Math.PI * this.gauge_smoth_value) / 100;
        return {
            start: Math.PI / 2 - val1_ZeroToPI,
            end: Math.PI / 2 + val1_ZeroToPI,
            start2: Math.PI / 2 + start2,
            end2: Math.PI / 2 + val2_ZeroToPI,
        };
    }
    update(value, value_temp) {
        this.gauge_level_value = parseFloat(value);
        this.gauge_value = parseFloat(value_temp);
    }

    draw() {
        const radius = (this.size / 2) * 0.78;
        const radius2 = (this.size / 2) * 0.82;
        const arcArea = this.smoth_Value();

        this.ctx.clearRect(0, 0, this.size, this.size);

        this.ctx.font = '60px Comic Sans MS';
        this.ctx.fillStyle = 'rgb(53,140,214)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            this.gauge_level_value + this.unit,
            this.center.x,
            this.center.y + 25
        );
        this.ctx.fillStyle = 'rgba(80,80,80,0.5)';
        this.ctx.beginPath();
        this.ctx.arc(
            this.center.x,
            this.center.y,
            radius,
            arcArea.start,
            arcArea.end,
            false
        );
        this.ctx.fill();

        this.ctx.beginPath();
        if (this.gauge_value < 37) this.ctx.strokeStyle = '#00c8ff';
        //"#Faf60a"
        else {
            this.ctx.strokeStyle = '#ff0000';
        }
        this.ctx.lineWidth = 18;
        this.ctx.lineCap = 'round';
        this.ctx.arc(
            this.center.x,
            this.center.y,
            radius2,
            arcArea.start2,
            arcArea.end2,
            false
        );
        this.ctx.stroke();

        this.ctx.strokeStyle = 'rgba(80,80,80,0.5)';
        this.ctx.beginPath();
        this.ctx.lineWidth = 14;
        this.ctx.arc(
            this.center.x,
            this.center.y,
            radius2,
            arcArea.start2,
            1.25,
            false
        );
        this.ctx.stroke();

        this.ctx.font = '35px Comic Sans MS';
        this.ctx.fillStyle = 'rgb(80, 80, 80)';
        this.ctx.fillText(this.type, this.center.x, this.size * 0.97);

        requestAnimationFrame(() => {
            this.draw();
        });
    }
}

const gaugeTemp = new Gauge(
    document.getElementById('_canvas_temp'),
    400,
    'Temperature',
    '°C'
);

const gaugeHumid = new Gauge(
    document.getElementById('_canvas_humid'),
    400,
    'Humidity',
    '%'
);

let flag = false;
const socket = io();

socket.on('data-temp-humid', (data) => {
    let receivedData = JSON.parse(data);
    let tempHumid = receivedData['data'];
    let temp = Number(tempHumid.split('-')[0]);
    let humid = Number(tempHumid.split('-')[1]);
    gaugeTemp.update(temp, temp);
    gaugeHumid.update(humid, humid);
    flag = true;
});

function tempAverageUpdate(num) {
    let tempAverage = document.querySelector('#temp_average');
    let data = parseFloat(num).toFixed(1);
    tempAverage.innerHTML = `${data}°C`;
}

function humidAverageUpdate(num) {
    let tempAverage = document.querySelector('#humid_average');
    let data = parseFloat(num).toFixed(1);
    tempAverage.innerHTML = `${data}%`;
}

if (!flag) {
    gaugeTemp.update(tempdb, tempdb);
    gaugeHumid.update(humidb, humidb);
}

tempAverageUpdate(tempAverage);
humidAverageUpdate(humidAverage);

let res = [];
for (let i = 0; i < tempPeriod.length; i++) {
    let item = {
        x: new Date(tempPeriod[i]['datetime']),
        y: [tempPeriod[i]['mintemp'], tempPeriod[i]['maxtemp']],
    };
    res.push(item);
}
let dataPoints = res;
