/*
=============================================
Author      : <ยุทธภูมิ ตวันนา>
Create date : <๐๒/๐๘/๒๕๖๔>
Modify date : <๐๒/๐๘/๒๕๖๔>
Description : <>
=============================================
*/

const sql = require('mssql');

function getAPIMessage(statusCode, data, message) {
    return {
        statusCode: statusCode,
        data: data,
        message: (message ? message : (statusCode === 200 ? 'OK' : ''))
    };
}

class DB {
    config = {
        user: 'admrscuat',
        password: 'RSC@uatdb19!',
        database: 'FinancialMURSC',
        server: 'mucbex-uat-db.mahidol',
        pool: {
            idleTimeoutMillis: 1000
        },
        options: {
            encrypt: true,
            trustServerCertificate: true
        } 
    }

    async connect() {
        let conn = await sql.connect(this.config);

        return conn;
    }

    async executeStoredProcedure(spName) {
        try {
            let conn = await this.connect();
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
        isAuthenticated() {
            let isAuthenticated = true;

            return {
                statusCode: (isAuthenticated ? 200 : 401),
                isAuthenticated: isAuthenticated,
                message: (isAuthenticated ? 'OK' : 'Unauthorized')
            }
        }
    };
}

module.exports = {
    getAPIMessage: getAPIMessage,
    DB: DB,
    Authorization: Authorization
};