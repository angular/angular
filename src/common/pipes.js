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
/**
 * A collection of Angular core pipes that are likely to be used in each and every
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in pipes in the `pipes`
 * property of the `@Component` or `@View` decorators.
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFDSCwyQkFBd0Isb0JBQW9CLENBQUMsQ0FBQTtBQUM3QywrQkFBNEIsd0JBQXdCLENBQUMsQ0FBQTtBQUNyRCwrQkFBNEIsd0JBQXdCLENBQUMsQ0FBQTtBQUNyRCwwQkFBdUIsbUJBQW1CLENBQUMsQ0FBQTtBQUMzQywyQkFBd0Isb0JBQW9CLENBQUMsQ0FBQTtBQUM3QywwQkFBdUIsbUJBQW1CLENBQUMsQ0FBQTtBQUMzQyw0QkFBcUQscUJBQXFCLENBQUMsQ0FBQTtBQUMzRSxxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUVwRCwyQkFBd0Isb0JBQW9CLENBQUM7QUFBckMsMkNBQXFDO0FBQzdDLDBCQUF1QixtQkFBbUIsQ0FBQztBQUFuQyx3Q0FBbUM7QUFDM0MsMEJBQXVCLG1CQUFtQixDQUFDO0FBQW5DLHdDQUFtQztBQUMzQywyQkFBd0Isb0JBQW9CLENBQUM7QUFBckMsMkNBQXFDO0FBQzdDLCtCQUE0Qix3QkFBd0IsQ0FBQztBQUE3Qyx1REFBNkM7QUFDckQsNEJBQWlFLHFCQUFxQixDQUFDO0FBQS9FLDhDQUFVO0FBQUUsZ0RBQVc7QUFBRSxnREFBVztBQUFFLGtEQUF5QztBQUN2RiwrQkFBNEIsd0JBQXdCLENBQUM7QUFBN0MsdURBQTZDO0FBRXJEOzs7Ozs7R0FNRztBQUNVLG9CQUFZLEdBQUcsaUJBQVUsQ0FBQztJQUNyQyxzQkFBUztJQUNULDhCQUFhO0lBQ2IsOEJBQWE7SUFDYixvQkFBUTtJQUNSLHNCQUFTO0lBQ1QseUJBQVc7SUFDWCx5QkFBVztJQUNYLDBCQUFZO0lBQ1osb0JBQVE7Q0FDVCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBtb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICogVGhpcyBtb2R1bGUgcHJvdmlkZXMgYSBzZXQgb2YgY29tbW9uIFBpcGVzLlxuICovXG5pbXBvcnQge0FzeW5jUGlwZX0gZnJvbSAnLi9waXBlcy9hc3luY19waXBlJztcbmltcG9ydCB7VXBwZXJDYXNlUGlwZX0gZnJvbSAnLi9waXBlcy91cHBlcmNhc2VfcGlwZSc7XG5pbXBvcnQge0xvd2VyQ2FzZVBpcGV9IGZyb20gJy4vcGlwZXMvbG93ZXJjYXNlX3BpcGUnO1xuaW1wb3J0IHtKc29uUGlwZX0gZnJvbSAnLi9waXBlcy9qc29uX3BpcGUnO1xuaW1wb3J0IHtTbGljZVBpcGV9IGZyb20gJy4vcGlwZXMvc2xpY2VfcGlwZSc7XG5pbXBvcnQge0RhdGVQaXBlfSBmcm9tICcuL3BpcGVzL2RhdGVfcGlwZSc7XG5pbXBvcnQge0RlY2ltYWxQaXBlLCBQZXJjZW50UGlwZSwgQ3VycmVuY3lQaXBlfSBmcm9tICcuL3BpcGVzL251bWJlcl9waXBlJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuZXhwb3J0IHtBc3luY1BpcGV9IGZyb20gJy4vcGlwZXMvYXN5bmNfcGlwZSc7XG5leHBvcnQge0RhdGVQaXBlfSBmcm9tICcuL3BpcGVzL2RhdGVfcGlwZSc7XG5leHBvcnQge0pzb25QaXBlfSBmcm9tICcuL3BpcGVzL2pzb25fcGlwZSc7XG5leHBvcnQge1NsaWNlUGlwZX0gZnJvbSAnLi9waXBlcy9zbGljZV9waXBlJztcbmV4cG9ydCB7TG93ZXJDYXNlUGlwZX0gZnJvbSAnLi9waXBlcy9sb3dlcmNhc2VfcGlwZSc7XG5leHBvcnQge051bWJlclBpcGUsIERlY2ltYWxQaXBlLCBQZXJjZW50UGlwZSwgQ3VycmVuY3lQaXBlfSBmcm9tICcuL3BpcGVzL251bWJlcl9waXBlJztcbmV4cG9ydCB7VXBwZXJDYXNlUGlwZX0gZnJvbSAnLi9waXBlcy91cHBlcmNhc2VfcGlwZSc7XG5cbi8qKlxuICogQSBjb2xsZWN0aW9uIG9mIEFuZ3VsYXIgY29yZSBwaXBlcyB0aGF0IGFyZSBsaWtlbHkgdG8gYmUgdXNlZCBpbiBlYWNoIGFuZCBldmVyeVxuICogYXBwbGljYXRpb24uXG4gKlxuICogVGhpcyBjb2xsZWN0aW9uIGNhbiBiZSB1c2VkIHRvIHF1aWNrbHkgZW51bWVyYXRlIGFsbCB0aGUgYnVpbHQtaW4gcGlwZXMgaW4gdGhlIGBwaXBlc2BcbiAqIHByb3BlcnR5IG9mIHRoZSBgQENvbXBvbmVudGAgb3IgYEBWaWV3YCBkZWNvcmF0b3JzLlxuICovXG5leHBvcnQgY29uc3QgQ09NTU9OX1BJUEVTID0gQ09OU1RfRVhQUihbXG4gIEFzeW5jUGlwZSxcbiAgVXBwZXJDYXNlUGlwZSxcbiAgTG93ZXJDYXNlUGlwZSxcbiAgSnNvblBpcGUsXG4gIFNsaWNlUGlwZSxcbiAgRGVjaW1hbFBpcGUsXG4gIFBlcmNlbnRQaXBlLFxuICBDdXJyZW5jeVBpcGUsXG4gIERhdGVQaXBlXG5dKTtcbiJdfQ==