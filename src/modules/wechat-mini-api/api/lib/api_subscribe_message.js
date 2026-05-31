'use strict';

const { postJSON } = require('./util');
const querystring = require("querystring");

/**
 * touserr : openid
 * miniprogram_state :跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
 */
exports.sendSubscribeTemplateMsg = async function (touser, template_id, page, data, miniprogram_state ="formal", lang ="zh_CN") {
    const { accessToken } = await this.ensureAccessToken();
    // if (typeof options !== 'object') {
    //     options = {
    //         openid: options,
    //         lang: 'en'
    //     };
    // }
    console.log('api_subscribe_message.js --18--->>',data);
    var url = this.mpPrefix + "message/subscribe/send?access_token=" + accessToken
    console.log("url", url);
    let reqdata = {
        touser: touser,
        template_id,
        page,
        data,
        miniprogram_state
    }
    return this.request(url, postJSON(reqdata));
};
