/**
 * @file webpack config
 * @author chenqiang
 */

var path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    target: 'node',
    entry: {
        index: './src/index.js'
    },
    mode: 'production',
    output: {
        path: path.join(__dirname, 'lib'),
        libraryTarget: 'commonjs'
    },
    plugins: [
        new CleanWebpackPlugin(['lib'])
    ]
};
