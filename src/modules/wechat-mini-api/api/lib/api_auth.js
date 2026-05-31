'use strict';

const { postJSON } = require('./util');
const querystring = require("querystring");


exports.code2Session = async function (code) {
    // const { accessToken } = await this.ensureAccessToken();
    // if (typeof options !== 'object') {
    //     options = {
    //         openid: options,
    //         lang: 'en'
    //     };
    // }
    // https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID
    var querystr = querystring.stringify({
        appid:this.appid,
        secret: this.appsecret,
        js_code: code,
        grant_type:"authorization_code"
    })
    var url = this.prefix + "jscode2session?" + querystr
    return this.request(url, { dataType: 'json' });
};
