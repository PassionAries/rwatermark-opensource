'use strict';

const { postJSON } = require('./util');
const querystring = require("querystring");


exports.sendTemplateMsg = async function (touser, weapp_template_msg, mp_template_msg) {
    const { accessToken } = await this.ensureAccessToken();
    // if (typeof options !== 'object') {
    //     options = {
    //         openid: options,
    //         lang: 'en'
    //     };
    // }
    var url = this.mpPrefix + "message/wxopen/template/uniform_send?access_token=" + accessToken
    console.log("url", url);
    let data={
        touser: touser,
        // weapp_template_msg: weapp_template_msg,
        // mp_template_msg: mp_template_msg,
    }
    if (weapp_template_msg){
        data.weapp_template_msg = weapp_template_msg;
    }
    if (mp_template_msg) {
        data.mp_template_msg = mp_template_msg;
    }

    return this.request(url, postJSON(data));
};
