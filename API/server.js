/*
=============================================
Author      : <ยุทธภูมิ ตวันนา>
Create date : <๐๒/๐๘/๒๕๖๔>
Modify date : <๑๘/๐๘/๒๕๖๔>
Description : <>
=============================================
*/

const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const fs = require('fs');
const util = require('./util')
const authorizationUsersRoute = require('./routes/authorizationUsers')

const app = express();
const router = express.Router();
const port = process.env.PORT || 5000;

app.use(cors());
app.use((request, response, next) => {
    let authorization = new util.Authorization();
    let authen = authorization.ADFS.get(request);

    if (authen.isAuthenticated) {
        request.payload = authen.payload;
        next();
    }
    else
        response.send(util.getAPIMessage(authen.statusCode, [], authen.message));
});
app.use('/API', router);

app.get('/', (request, response) => {
    response.status(400).json(util.getAPIMessage(response.statusCode, [], 'Bad Request'));
});

router.use('/AuthorizationUsers', authorizationUsersRoute);

app.listen(port, () => {
    console.log('MURSC Management API is running at port %s', port);
});