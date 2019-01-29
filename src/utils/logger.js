/**
 * @file 日志文件输出
 * @author chenqiang
 */

var util  = require('util');
var chalk = require('chalk');

var categories = [
    {name: 'trace', color: chalk.grey},
    {name: 'debug', color: chalk.grey},
    {name: 'info', color: chalk.green},
    {name: 'warn', color: chalk.yellow},
    {name: 'error', color: chalk.red},
    {name: 'fatal', color: chalk.red}
];

/**
 * 日志模块
 *
 * @return {Object} 包含 trace/debug/info/warn/error/fatal 等方法的 log 对象
 */
module.exports = function () {
    var log = {};

    categories.forEach(function (item) {

        log[item.name] = function () {
            var msg = util.format.apply(null, arguments);

            if (msg) {
                console.log(item.color(item.name.toUpperCase()) + ' ' + msg);
            }
            else {
                console.log();
            }
        }

    });

    return log;
};
