'use strict';
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        game: './src/index.ts',
        index: './src/settings.ts'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.ts', '.js', '.tsx', '.css']
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            chunks : ['index'],
            template: './wwwroot/index.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'fiveFieldKono.html',
            chunks : ['game'],
            template: './wwwroot/fiveFieldKono.html'
        })
    ],
    module: {
        rules: [
            {
                loader: 'ts-loader',
                test: /\.tsx?$/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    devServer: {
        port: 8090,
        compress: true,
        contentBase: path.join(__dirname, 'dist')
    }
};
