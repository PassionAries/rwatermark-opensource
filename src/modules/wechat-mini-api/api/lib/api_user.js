'use strict';

const { postJSON } = require('./util');

/**
 * 获取用户基本信息。可以设置lang，其中zh_CN 简体，zh_TW 繁体，en 英语。默认为en
 * 详情请见：<http://mp.weixin.qq.com/wiki/index.php?title=获取用户基本信息>
 * Examples:
 * ```
 * api.getUser(openid);
 * api.getUser({openid: 'openid', lang: 'en'});
 * ```
 *
 * Result:
 * ```
 * {
 *  "subscribe": 1,
 *  "openid": "o6_bmjrPTlm6_2sgVt7hMZOPfL2M",
 *  "nickname": "Band",
 *  "sex": 1,
 *  "language": "zh_CN",
 *  "city": "广州",
 *  "province": "广东",
 *  "country": "中国",
 *  "headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0",
 *  "subscribe_time": 1382694957
 * }
 * ```
 * @param {String|Object} options 用户的openid。或者配置选项，包含openid和lang两个属性。
 */





exports.getUserPhoneNumber = async function (code) {
    // const { accessToken } = await this.ensureAccessToken();
    // if (typeof options !== 'object') {
    //     options = {
    //         openid: options,
    //         lang: 'en'
    //     };
    // }
    // https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID
    const { accessToken } = await this.ensureAccessToken();
    var reqdata = {
        code: code,
    }
    var url = this.wxaPrefix + "business/getuserphonenumber?access_token=" +accessToken
    console.log("url",url,postJSON(reqdata));
    return this.request(url, postJSON(reqdata));
};

