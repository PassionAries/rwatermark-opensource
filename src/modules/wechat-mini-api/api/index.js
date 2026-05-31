
const API = require('./lib/api_common');
API.mixin(require('./lib/api_user'));
API.mixin(require('./lib/api_auth'));
API.mixin(require('./lib/api_uniform_message'));
API.mixin(require('./lib/api_subscribe_message'));
API.mixin(require('./lib/api_wxacode'));

module.exports = API;
