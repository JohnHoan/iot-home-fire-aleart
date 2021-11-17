const { json } = require('body-parser');
const mysql = require('mysql2');
const dbcon = require('./connection');

const promisePool = dbcon.promise();

const authentication = async (username, password) => {
    try {
        let sql =
            'SELECT username, password FROM users WHERE username =? and password=?';
        let [rows, fields] = await promisePool.query(sql, [username, password]);
        if (rows.length > 0) return true;
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const insertTempHumid = async (temp, humid) => {
    try {
        let sql = 'INSERT INTO temp_humid (temp, humid) VALUES (?,?) ';
        let [rows, fields] = await promisePool.query(sql, [temp, humid]);
        if (rows.length > 0) return true;
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const insertGas = async (data) => {
    try {
        let sql = 'INSERT INTO gas (gas_data) VALUES (?) ';
        let [rows, fields] = await promisePool.query(sql, [data]);
        if (rows.length > 0) return true;
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const getLatestTempHumid = async () => {
    try {
        let sql =
            'SELECT temp, humid FROM temp_humid ORDER BY create_time DESC LIMIT ?';
        let [rows, fields] = await promisePool.query(sql, [1]);
        if (rows.length > 0) {
            return rows[0];
        }
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const getLatestGas = async () => {
    try {
        let sql = 'SELECT gas_data FROM gas ORDER BY create_time DESC LIMIT ?';
        let [rows, fields] = await promisePool.query(sql, [1]);
        if (rows.length > 0) {
            return rows[0];
        }
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const getTempHumidAverage = async () => {
    try {
        let sql =
            'SELECT AVG(temp) as temp, AVG(humid) as humid FROM temp_humid WHERE DATE(create_time)=curdate()';
        let [rows, fields] = await promisePool.query(sql, []);
        if (rows.length > 0) {
            return rows[0];
        }
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const getTempPeriod = async () => {
    try {
        let sql =
            'SELECT DATE(create_time) as datetime, MIN(temp) as mintemp, MAX(temp) as maxtemp FROM temp_humid GROUP BY DATE(create_time)';
        let [rows, fields] = await promisePool.query(sql, []);
        if (rows.length > 0) {
            return rows;
        }
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
};

module.exports = {
    authentication,
    insertTempHumid,
    insertGas,
    getLatestTempHumid,
    getLatestGas,
    getTempHumidAverage,
    getTempPeriod,
};
