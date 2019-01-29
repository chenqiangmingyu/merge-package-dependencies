/**
 * @file src/index.js
 * @description 合并package.json的dependencies和devDependencies字段，其它字段保持和 source package.json 一致
 * @author chenqiang
 */

var path = require('path');
var _ = require('lodash');
var compare = require('node-version-compare');
var read = require('./utils/read');

var AVAILABLE_PROPERTIES = ['dependencies', 'devDependencies'];

/**
 * typedef {Object} Params
 * @property {Object} src 源package.json的dependencies|devDependencies
 * @property {Object} dst 参与作用package.json的dependencies|devDependencies
 * @property {Array} 源package.json的dependencies|devDependencies key序列
 * @property {Array} 参与作用package.json的dependencies|devDependencies key序列
 */

/**
 * 以默认的方式合并，这种方式不会改变源 package.json 的依赖
 * 只会利用三方 package.json 升级当前 package.josn 的版本
 *
 * @example
 * package.src.json -> {a: '0.1.1', b: '1.1.2'}
 * package.dst.json -> {a: '1.2.1', b: '1.0.0', c: '1.1.1'}
 * merged -> {a: '1.2.1', b: '1.1.2'}
 * @param {Object<Params>} args 合并参数
 * @return {Object} 产出
 */
function mergeByDefault(args) {
    var result = args.src;
    var intersections = _.intersection(args.srcKeys, args.dstKeys);

    return _.reduce(intersections, function (memo, key) {
        if (compare(memo[key], args.dst[key]) < 0) {
            memo[key] = args.dst[key];
        }

        return memo;
    }, args.src);
}

/**
 * 以并集的方式合并
 *
 * @example
 * package.src.json -> {a: '0.1.1', b: '1.1.2'}
 * package.dst.json -> {a: '1.2.1', b: '1.0.0', c: '1.1.1'}
 * merged -> {a: '1.2.1', b: '1.1.2', c: '1.1.1'}
 * @param {Object<Params>} args 合并参数
 * @return {Object} 产出
 */
function mergeByUnion(args) {
    var result = args.src;
    var unions = _.union(args.srcKeys, args.dstKeys);

    var result = {};
    _.each(unions, function (key) {
        var srcVersion = args.src[key] || args.dst[key];
        var dstVersion = args.dst[key] || args.src[key];

        result[key] = compare(srcVersion, dstVersion) > 0 ? srcVersion : dstVersion;
    });

    return result;
}


/**
 * 以交集的方式合并
 *
 * @example
 * package.src.json -> {a: '0.1.1', b: '1.1.2'}
 * package.dst.json -> {a: '1.2.1', c: '1.1.1'}
 * merged -> {a: '1.2.1'}
 * @param {Object<Params>} args 合并参数
 * @return {Object} 产出
 */
function mergeByIntersection(args) {
    var result = args.src;
    var intersections = _.intersection(args.srcKeys, args.dstKeys);

    return _.reduce(intersections, function (memo, key) {
        if (compare(memo[key], args.dst[key]) < 0) {
            memo[key] = args.dst[key];
        }

        return memo;
    }, _.pick(args.src, intersections));
}

function merge(src, dst, properties, type) {
    properties = _.intersection(properties, AVAILABLE_PROPERTIES);
    properties = _.isEmpty([]) ? AVAILABLE_PROPERTIES : properties;

    return Promise.all([
        read(src),
        read(dst)
    ]).then(function (contents) {
        return _.reduce(properties, function (memo, property) {
            var srcDependencies = contents[0][property];
            var dstDependencies = contents[1][property];

            var srcDependenciesKeys = _.keys(srcDependencies);
            var dstDependenciesKeys = _.keys(dstDependencies);

            var args = {
                src: srcDependencies || {},
                dst: dstDependencies || {},
                srcKeys: srcDependenciesKeys || [],
                dstKeys: dstDependenciesKeys || []
            };

            switch (type) {
                case 'union':
                    memo[property] = mergeByUnion(args);
                    break;
                case 'intersection':
                    memo[property] = mergeByIntersection(args);
                    break;
                default:
                    memo[property] = mergeByDefault(args);
            }

            return memo;

        }, contents[0]);
    }).then(function (output) {
        _.each(properties, function (property) {
            if (_.isEmpty(output[property])) {
                delete output[property];
            }
        });

        return output;
    });
}

module.exports = merge;
