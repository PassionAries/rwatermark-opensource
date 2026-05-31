'use strict';

const { postJSON } = require('./util');
const querystring = require("querystring");


exports.createQRCode = async function (path, width = 430) {
    const { accessToken } = await this.ensureAccessToken();
    // if (typeof options !== 'object') {
    //     options = {
    //         openid: options,
    //         lang: 'en'
    //     };
    // }
    var url = this.mpPrefix + "wxaapp/createwxaqrcode?access_token=" + accessToken
    console.log("url", url);
    let reqdata = {
        path,
        width
    }
    return this.request(url, postJSON(reqdata));
};
