/*
=============================================
Author      : <ยุทธภูมิ ตวันนา>
Create date : <๐๒/๐๘/๒๕๖๔>
Modify date : <๒๒/๐๘/๒๕๖๔>
Description : <>
=============================================
*/

const { response } = require('express');
const express = require('express');
const sql = require('mssql');
const util = require('../util');

const router = express.Router();


class UserSchema {
    constructor(
        CUID,
        ID,
        role,
        HRiID,
        username,
        ownerCode,
        fullName,
        givenName,
        familyName,
        email,
        image,
        cancelStatus,
        actionDate
    ) {
        this.CUID = CUID,
        this.ID = ID,
        this.role = role,
        this.HRiID = HRiID,
        this.username = username,
        this.ownerCode = ownerCode,
        this.fullName = fullName,
        this.givenName = givenName,
        this.familyName = familyName,
        this.email = email,
        this.image = image,
        this.cancelStatus = cancelStatus,
        this.actionDate = actionDate
    }
}

async function getList(ID) {
    let db = new util.DB(); 
    let connRequest;
    
    try {
        connRequest = await db.getConnectRequest();
        connRequest.input('ID', sql.VarChar, ID);
    }
    catch { }

    return db.executeStoredProcedure('sp_rscGetListAuthorizationUsersByAdmin', connRequest);
}

async function get(ID, username) {
    let db = new util.DB(); 
    let connRequest;
    
    try {
        connRequest = await db.getConnectRequest();
        connRequest.input('ID', sql.VarChar, ID);
        connRequest.input('username', sql.VarChar, username);
    }
    catch { }

    return db.executeStoredProcedure('sp_rscGetAuthorizationUsers', connRequest);
}

router.get('/GetList', (request, response, next) => {
    let ID = request.payload.userID;

    getList(ID).then((result) => {
        let ds = [];
        let fullNameSplit = [];

        result.data.forEach(dr => {
            fullNameSplit = dr["fullNameEN"].split(' ');

            ds.push(new UserSchema(
                util.getCUID([dr.ID, dr.HRiID]),
                dr.ID,
                {
                    name: dr.roleName,
                    description: dr.roleDescription,
                    cancelStatus: dr.roleCancelStatus
                },
                dr.HRiID,
                dr.username,
                dr.ownerCode,
                {
                    th: dr["fullNameTH"],
                    en: dr["fullNameEN"]
                },
                fullNameSplit[0],
                fullNameSplit[fullNameSplit.length - 1],
                dr.email,
                dr.image,
                dr.cancelStatus,
                dr.actionDates
            ));
        });

        response.json(util.getAPIMessage(response.statusCode, ds, result.message));
    });
});

router.get('/Get', (request, response, next) => {
    let ID = request.payload.userID;
    let username = request.payload.winaccountname;

    get(ID, username).then((result) => {
        let ds = [];
        let dr = {};
        let fullNameSplit = [];
        
        if (result.data.length > 0) {
            dr = result.data[0];
            fullNameSplit = dr["fullNameEN"].split(' ');


            ds.push(new UserSchema(
                util.getCUID([dr.ID, dr.HRiID]),
                dr.ID,
                {
                    name: dr.roleName,
                    description: dr.roleDescription,
                    cancelStatus: dr.roleCancelStatus
                },
                dr.HRiID,
                dr.username,
                dr.ownerCode,
                {
                    th: dr["fullNameTH"],
                    en: dr["fullNameEN"]
                },
                fullNameSplit[0],
                fullNameSplit[fullNameSplit.length - 1],
                dr.email,
                dr.image,
                dr.cancelStatus,
                dr.actionDates
            ));
        }

        response.json(util.getAPIMessage(response.statusCode, ds, result.message));
    });
});

module.exports = router;