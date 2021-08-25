/*
=============================================
Author      : <ยุทธภูมิ ตวันนา>
Create date : <๐๒/๐๘/๒๕๖๔>
Modify date : <๒๓/๐๘/๒๕๖๔>
Description : <>
=============================================
*/

const btoa = require('btoa');
const atob = require('atob');
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

    async getConnectRequest() {
        try {
            let conn = await sql.connect(this.config);

            return conn.request();
        }
        catch { }
    }

    async executeStoredProcedure(spName, request) {
        try {
            let ds = await request.execute(spName);

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
        parserCUID(str) {
            try {
                let strDecode = atob(str);
                let strDecodeSplit = strDecode.split('.');
                let data = strDecodeSplit[2];
                let dataReverse = data.split('').reverse().join('');
                let dataReverseDecode = atob(dataReverse);
                let dataReverseDecodeSplit = dataReverseDecode.split('.');
        
                return ({
                    userID: dataReverseDecodeSplit[0],
                    HRiID: dataReverseDecodeSplit[1]
                });
            }
            catch {
                return null;
            }
        },
        parserToken(str) {
            try {
                let strDecode = atob(str);
                let strDecodeSplit = strDecode.split('.');
                let CUIDInfo = this.parserCUID(atob(strDecodeSplit[0]).split('').reverse().join(''));
                let tokenParse = CUIDInfo;

                tokenParse.token = atob(strDecodeSplit[1]).split('').reverse().join('');

                return tokenParse;
            }
            catch {
                return null;
            }
        },
        getInfo(request) {
            let authorization = request.headers.authorization;
            let statusCode = 200;
            let isAuthenticated = false;
            let payload = {};
            let message = '';
            
            if (authorization) {
                if (authorization.startsWith("Bearer ")) {
                    let bearerToken = authorization.substring("Bearer ".length).trim();
                    let bearerTokenInfo = this.parserToken(bearerToken);
                    let publickey = fs.readFileSync(__dirname + '/public.key');
                    
                    try {
                        payload = jwt.verify(bearerTokenInfo.token, publickey, { algorithms: ['RS256'] });

                        if (bearerTokenInfo.HRiID === payload.ppid) {
                            statusCode = 200;
                            isAuthenticated = true;
                            payload.userID = bearerTokenInfo.userID;
                            message = 'OK';
                        }
                        else {
                            statusCode = 404;
                            isAuthenticated = false;
                            message = 'Not Found';
                        }
                    }
                    catch(error) {
                        statusCode = 401;
                        isAuthenticated = false;
    
                        if (error.name === 'TokenExpiredError')
                            message = 'Token Expired';
                        else
                            message = 'Token Invalid';
                    }
                }
                else {
                    statusCode = 401;
                    isAuthenticated = false;
                    message = 'Unauthorized';
                }
            }
            else {
                statusCode = 401;
                isAuthenticated = false;
                message = 'Unauthorized';
            }

            return {
                statusCode: statusCode,
                isAuthenticated: isAuthenticated,
                payload: payload,
                message: message
            };
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