/*
=============================================
Author      : <ยุทธภูมิ ตวันนา>
Create date : <๐๒/๐๘/๒๕๖๔>
Modify date : <๐๒/๐๘/๒๕๖๔>
Description : <>
=============================================
*/

const express = require('express');
const router = express.Router();

const util = require('../util')

class UserSchema {
    constructor(
        ID,
        username,
        permission,
        ownerCode,
        fullName,
        email,
        image,
        cancelStatus,
        actionDate
    ) {
        this.ID = ID,
        this.username = username,
        this.permission = permission,
        this.ownerCode = ownerCode,
        this.fullName = fullName,
        this.email = email,
        this.image = image,
        this.cancelStatus = cancelStatus,
        this.actionDate = actionDate
    }
}

async function getList() {
    let db = new util.DB(); 

    return db.executeStoredProcedure('sp_finrscGetListAuthorizedUser');
}

router.get('/GetList', (request, response, next) => {
    let authorization = new util.Authorization();
    let authen = authorization.ADFS.isAuthenticated();

    if (authen.isAuthenticated) {
        getList().then((result) => {
            let ds = []

            result.data.forEach(dr => {
                ds.push(new UserSchema(
                    dr.ID,
                    dr.username,
                    dr.permission,
					dr.ownerCode,
                    {
                        th: dr["fullNameTH"],
                        en: dr["fullNameEN"]
                    },
					dr.email,
					dr.image,
					dr.cancelStatus,
					dr.actionDates
                ));
            });

            response.json(util.getAPIMessage(response.statusCode, ds, result.message));
        });
    }
    else
        response.json(util.getAPIMessage(authen.statusCode, [], authen.message));
});

module.exports = router;