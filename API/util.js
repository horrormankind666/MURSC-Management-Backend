/*
=============================================
Author      : <ยุทธภูมิ ตวันนา>
Create date : <๐๒/๐๘/๒๕๖๔>
Modify date : <๑๘/๐๘/๒๕๖๔>
Description : <>
=============================================
*/

const btoa = require('btoa');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const fs = require('fs');

function getAPIMessage(statusCode, data, message) {
    return {
        statusCode: statusCode,
        data: data,
        message: (message ? message : (statusCode === 200 ? 'OK' : ''))
    };
}

function generateRandAlphaNumStr(len = 10) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    let result = '';

    for (let i = 0; i < len; i++) {
        const rnum = Math.floor(Math.random() * chars.length);

        result += chars.substring(rnum, rnum + 1);
    }

    return result;
}

function getCUID(data = []) {
    let randAlphaNumStr = this.generateRandAlphaNumStr(20);

    return (
        btoa(
            (btoa(randAlphaNumStr).split('').reverse().join('')) + '.' +
            (randAlphaNumStr.split('').reverse().join('')) + '.' +
            (btoa(data.join('.')).split('').reverse().join(''))
        )
    );
}

class DB {
    config = {
        user: 'admrscuat',
        password: 'RSC@uatdb19!',
        database: 'ExamRSC-UAT',
        server: 'mucbex-uat-db.mahidol',
        pool: {
            idleTimeoutMillis: 1000
        },
        options: {
            encrypt: true,
            trustServerCertificate: true
        } 
    }

    async executeStoredProcedure(spName) {
        try {
            let conn = await sql.connect(this.config);
            let ds = await conn.request().execute(spName);

            return {
                data: ds.recordset,
                message: 'OK'
            };
        } catch (error) {
            return {
                data: [],
                message: 'Database Connection Fail'
            };
        }
    }
}

class Authorization {
    ADFS = {
        get(request) {
            let authorization = request.headers.authorization;
            let isAuthenticated = false;
            let token = '';
            let payload = {};
            let message = '';

            if (authorization) {
                if (authorization.startsWith("Bearer ")) {
                    token = authorization.substring("Bearer ".length).trim();

                    let publickey = fs.readFileSync(__dirname + '/public.key');

                    try {
                        payload = jwt.verify(token, publickey, { algorithms: ['RS256'] });
                        isAuthenticated = true;
                    }
                    catch(error) {
                        message = error;
                    }
                }
            }

            return {
                statusCode: (isAuthenticated ? 200 : 401),
                isAuthenticated: isAuthenticated,
                payload: payload,
                message: (isAuthenticated ? 'OK' : (message ? message : 'Unauthorized'))
            }
        }
    };
}

module.exports = {
    getAPIMessage: getAPIMessage,
    generateRandAlphaNumStr: generateRandAlphaNumStr,
    getCUID: getCUID,
    DB: DB,
    Authorization: Authorization
};