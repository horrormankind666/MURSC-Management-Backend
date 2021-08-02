/*
=============================================
Author      : <ยุทธภูมิ ตวันนา>
Create date : <๐๒/๐๘/๒๕๖๔>
Modify date : <๐๒/๐๘/๒๕๖๔>
Description : <>
=============================================
*/

const cors = require('cors');
const express = require('express');
const app = express();
const router = express.Router();
const port = process.env.PORT || 5000;

const userRoute = require('./routes/authorizedUser')

app.use(cors());
app.use('/API', router);

app.get('/', (request, response) => {
    response.sendStatus(400);
});

router.use('/User', userRoute);

app.listen(port, () => {
    console.log('MURSC Management API is running at port %s', port);
});