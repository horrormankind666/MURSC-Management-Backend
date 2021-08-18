/*
=============================================
Author      : <ยุทธภูมิ ตวันนา>
Create date : <๐๒/๐๘/๒๕๖๔>
Modify date : <๑๘/๐๘/๒๕๖๔>
Description : <>
=============================================
*/

const express = require('express');
const util = require('../util');

const router = express.Router();


class UserSchema {
    constructor(
        CUID,
        ID,
        roleName,
        roleDescription,
        roleCancelStatus,
        HRiID,
        username,
        ownerCode,
        fullName,
        email,
        image,
        cancelStatus,
        actionDate
    ) {
        this.CUID = CUID,
        this.ID = ID,
        this.roleName = roleName,
        this.roleDescription = roleDescription,
        this.roleCancelStatus = roleCancelStatus,
        this.HRiID = HRiID,
        this.username = username,
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

    return db.executeStoredProcedure('sp_rscGetListAuthorizationUsersByAdmin');
}

router.get('/GetList', (request, response, next) => {
    response.json(request.payload);

    /*
    if (authen.isAuthenticated) {
        getList().then((result) => {
            let ds = []

            result.data.forEach(dr => {
                ds.push(new UserSchema(
                    util.getCUID([dr.ID, dr.HRiID]),
                    dr.ID,
                    dr.roleName,
                    dr.roleDescription,
                    dr.roleCancelStatus,
                    dr.HRiID,
                    dr.username,
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
    */
});

module.exports = router;