require('babel-runtime/core-js/promise').default = require('bluebird');
global.Promise = require('bluebird');

require('../common/css/normalize.min.css');
require('../common/css/base.css');
require('./popup.css');
require('./popup');