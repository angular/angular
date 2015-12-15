'use strict';/**
 * @module
 * @description
 * This module provides a set of common Pipes.
 */
var async_pipe_1 = require('./async_pipe');
var uppercase_pipe_1 = require('./uppercase_pipe');
var lowercase_pipe_1 = require('./lowercase_pipe');
var json_pipe_1 = require('./json_pipe');
var slice_pipe_1 = require('./slice_pipe');
var date_pipe_1 = require('./date_pipe');
var number_pipe_1 = require('./number_pipe');
var lang_1 = require('angular2/src/facade/lang');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX3BpcGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9jb21tb25fcGlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUNILDJCQUF3QixjQUFjLENBQUMsQ0FBQTtBQUN2QywrQkFBNEIsa0JBQWtCLENBQUMsQ0FBQTtBQUMvQywrQkFBNEIsa0JBQWtCLENBQUMsQ0FBQTtBQUMvQywwQkFBdUIsYUFBYSxDQUFDLENBQUE7QUFDckMsMkJBQXdCLGNBQWMsQ0FBQyxDQUFBO0FBQ3ZDLDBCQUF1QixhQUFhLENBQUMsQ0FBQTtBQUNyQyw0QkFBcUQsZUFBZSxDQUFDLENBQUE7QUFDckUscUJBQXlCLDBCQUEwQixDQUFDLENBQUE7QUFFcEQ7Ozs7OztHQU1HO0FBQ1Usb0JBQVksR0FBRyxpQkFBVSxDQUFDO0lBQ3JDLHNCQUFTO0lBQ1QsOEJBQWE7SUFDYiw4QkFBYTtJQUNiLG9CQUFRO0lBQ1Isc0JBQVM7SUFDVCx5QkFBVztJQUNYLHlCQUFXO0lBQ1gsMEJBQVk7SUFDWixvQkFBUTtDQUNULENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQG1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGlzIG1vZHVsZSBwcm92aWRlcyBhIHNldCBvZiBjb21tb24gUGlwZXMuXG4gKi9cbmltcG9ydCB7QXN5bmNQaXBlfSBmcm9tICcuL2FzeW5jX3BpcGUnO1xuaW1wb3J0IHtVcHBlckNhc2VQaXBlfSBmcm9tICcuL3VwcGVyY2FzZV9waXBlJztcbmltcG9ydCB7TG93ZXJDYXNlUGlwZX0gZnJvbSAnLi9sb3dlcmNhc2VfcGlwZSc7XG5pbXBvcnQge0pzb25QaXBlfSBmcm9tICcuL2pzb25fcGlwZSc7XG5pbXBvcnQge1NsaWNlUGlwZX0gZnJvbSAnLi9zbGljZV9waXBlJztcbmltcG9ydCB7RGF0ZVBpcGV9IGZyb20gJy4vZGF0ZV9waXBlJztcbmltcG9ydCB7RGVjaW1hbFBpcGUsIFBlcmNlbnRQaXBlLCBDdXJyZW5jeVBpcGV9IGZyb20gJy4vbnVtYmVyX3BpcGUnO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIEEgY29sbGVjdGlvbiBvZiBBbmd1bGFyIGNvcmUgcGlwZXMgdGhhdCBhcmUgbGlrZWx5IHRvIGJlIHVzZWQgaW4gZWFjaCBhbmQgZXZlcnlcbiAqIGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoaXMgY29sbGVjdGlvbiBjYW4gYmUgdXNlZCB0byBxdWlja2x5IGVudW1lcmF0ZSBhbGwgdGhlIGJ1aWx0LWluIHBpcGVzIGluIHRoZSBgcGlwZXNgXG4gKiBwcm9wZXJ0eSBvZiB0aGUgYEBDb21wb25lbnRgIG9yIGBAVmlld2AgZGVjb3JhdG9ycy5cbiAqL1xuZXhwb3J0IGNvbnN0IENPTU1PTl9QSVBFUyA9IENPTlNUX0VYUFIoW1xuICBBc3luY1BpcGUsXG4gIFVwcGVyQ2FzZVBpcGUsXG4gIExvd2VyQ2FzZVBpcGUsXG4gIEpzb25QaXBlLFxuICBTbGljZVBpcGUsXG4gIERlY2ltYWxQaXBlLFxuICBQZXJjZW50UGlwZSxcbiAgQ3VycmVuY3lQaXBlLFxuICBEYXRlUGlwZVxuXSk7XG4iXX0=