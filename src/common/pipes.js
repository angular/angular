'use strict';/**
 * @module
 * @description
 * This module provides a set of common Pipes.
 */
var async_pipe_1 = require('./pipes/async_pipe');
var uppercase_pipe_1 = require('./pipes/uppercase_pipe');
var lowercase_pipe_1 = require('./pipes/lowercase_pipe');
var json_pipe_1 = require('./pipes/json_pipe');
var slice_pipe_1 = require('./pipes/slice_pipe');
var date_pipe_1 = require('./pipes/date_pipe');
var number_pipe_1 = require('./pipes/number_pipe');
var lang_1 = require('angular2/src/facade/lang');
var async_pipe_2 = require('./pipes/async_pipe');
exports.AsyncPipe = async_pipe_2.AsyncPipe;
var date_pipe_2 = require('./pipes/date_pipe');
exports.DatePipe = date_pipe_2.DatePipe;
var json_pipe_2 = require('./pipes/json_pipe');
exports.JsonPipe = json_pipe_2.JsonPipe;
var slice_pipe_2 = require('./pipes/slice_pipe');
exports.SlicePipe = slice_pipe_2.SlicePipe;
var lowercase_pipe_2 = require('./pipes/lowercase_pipe');
exports.LowerCasePipe = lowercase_pipe_2.LowerCasePipe;
var number_pipe_2 = require('./pipes/number_pipe');
exports.NumberPipe = number_pipe_2.NumberPipe;
exports.DecimalPipe = number_pipe_2.DecimalPipe;
exports.PercentPipe = number_pipe_2.PercentPipe;
exports.CurrencyPipe = number_pipe_2.CurrencyPipe;
var uppercase_pipe_2 = require('./pipes/uppercase_pipe');
exports.UpperCasePipe = uppercase_pipe_2.UpperCasePipe;
exports.COMMON_PIPES = lang_1.CONST_EXPR([
    async_pipe_1.AsyncPipe,
    uppercase_pipe_1.UpperCasePipe,
    lowercase_pipe_1.LowerCasePipe,
    json_pipe_1.JsonPipe,
    slice_pipe_1.SlicePipe,
    number_pipe_1.DecimalPipe,
    number_pipe_1.PercentPipe,
    number_pipe_1.CurrencyPipe,
    date_pipe_1.DatePipe
]);
//# sourceMappingURL=pipes.js.map