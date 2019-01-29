/**
 * @file 根据路径特征读取文件内容
 * @author chenqiang
 */

var fs = require('fs');
var path = require('path');
var valid = require('valid-url');
// https://github.com/bitinn/node-fetch/issues/450
var fetch = require('node-fetch').default;
var logger = require('./logger')();

function read(uri, callback) {
    if (typeof uri !== 'string') {
        return callback(uri);
    }

    if (valid.isUri(uri)) {
        fetch(uri)
            .then(function (res) {
                var extname = path.extname(uri);

                if (extname.indexOf('json') > -1) {
                    return res.json();
                }

                return res.text();
            })
            .then(callback)
            .catch(function (err) {
                logger.error('%s read error: %j', uri, err);
            });
    }
    else {
        var content = '';

        try {
            content = JSON.parse(fs.readFileSync(uri, 'utf8'));
        }
        catch (ex) {
            logger.error('%s read error: %j', uri, ex);
        }

        callback(content);
    }
}

module.exports = function (uri) {
    return new Promise(function (resolve) {
        read(uri, resolve);
    });
};
