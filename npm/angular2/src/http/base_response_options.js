'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var headers_1 = require('./headers');
var enums_1 = require('./enums');
/**
 * Creates a response options object to be optionally provided when instantiating a
 * {@link Response}.
 *
 * This class is based on the `ResponseInit` description in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#responseinit).
 *
 * All values are null by default. Typical defaults can be found in the
 * {@link BaseResponseOptions} class, which sub-classes `ResponseOptions`.
 *
 * This class may be used in tests to build {@link Response Responses} for
 * mock responses (see {@link MockBackend}).
 *
 * ### Example ([live demo](http://plnkr.co/edit/P9Jkk8e8cz6NVzbcxEsD?p=preview))
 *
 * ```typescript
 * import {ResponseOptions, Response} from 'angular2/http';
 *
 * var options = new ResponseOptions({
 *   body: '{"name":"Jeff"}'
 * });
 * var res = new Response(options);
 *
 * console.log('res.json():', res.json()); // Object {name: "Jeff"}
 * ```
 */
var ResponseOptions = (function () {
    function ResponseOptions(_a) {
        var _b = _a === void 0 ? {} : _a, body = _b.body, status = _b.status, headers = _b.headers, statusText = _b.statusText, type = _b.type, url = _b.url;
        this.body = lang_1.isPresent(body) ? body : null;
        this.status = lang_1.isPresent(status) ? status : null;
        this.headers = lang_1.isPresent(headers) ? headers : null;
        this.statusText = lang_1.isPresent(statusText) ? statusText : null;
        this.type = lang_1.isPresent(type) ? type : null;
        this.url = lang_1.isPresent(url) ? url : null;
    }
    /**
     * Creates a copy of the `ResponseOptions` instance, using the optional input as values to
     * override
     * existing values. This method will not change the values of the instance on which it is being
     * called.
     *
     * This may be useful when sharing a base `ResponseOptions` object inside tests,
     * where certain properties may change from test to test.
     *
     * ### Example ([live demo](http://plnkr.co/edit/1lXquqFfgduTFBWjNoRE?p=preview))
     *
     * ```typescript
     * import {ResponseOptions, Response} from 'angular2/http';
     *
     * var options = new ResponseOptions({
     *   body: {name: 'Jeff'}
     * });
     * var res = new Response(options.merge({
     *   url: 'https://google.com'
     * }));
     * console.log('options.url:', options.url); // null
     * console.log('res.json():', res.json()); // Object {name: "Jeff"}
     * console.log('res.url:', res.url); // https://google.com
     * ```
     */
    ResponseOptions.prototype.merge = function (options) {
        return new ResponseOptions({
            body: lang_1.isPresent(options) && lang_1.isPresent(options.body) ? options.body : this.body,
            status: lang_1.isPresent(options) && lang_1.isPresent(options.status) ? options.status : this.status,
            headers: lang_1.isPresent(options) && lang_1.isPresent(options.headers) ? options.headers : this.headers,
            statusText: lang_1.isPresent(options) && lang_1.isPresent(options.statusText) ? options.statusText :
                this.statusText,
            type: lang_1.isPresent(options) && lang_1.isPresent(options.type) ? options.type : this.type,
            url: lang_1.isPresent(options) && lang_1.isPresent(options.url) ? options.url : this.url,
        });
    };
    return ResponseOptions;
}());
exports.ResponseOptions = ResponseOptions;
/**
 * Subclass of {@link ResponseOptions}, with default values.
 *
 * Default values:
 *  * status: 200
 *  * headers: empty {@link Headers} object
 *
 * This class could be extended and bound to the {@link ResponseOptions} class
 * when configuring an {@link Injector}, in order to override the default options
 * used by {@link Http} to create {@link Response Responses}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/qv8DLT?p=preview))
 *
 * ```typescript
 * import {provide} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {HTTP_PROVIDERS, Headers, Http, BaseResponseOptions, ResponseOptions} from
 * 'angular2/http';
 * import {App} from './myapp';
 *
 * class MyOptions extends BaseResponseOptions {
 *   headers:Headers = new Headers({network: 'github'});
 * }
 *
 * bootstrap(App, [HTTP_PROVIDERS, provide(ResponseOptions, {useClass: MyOptions})]);
 * ```
 *
 * The options could also be extended when manually creating a {@link Response}
 * object.
 *
 * ### Example ([live demo](http://plnkr.co/edit/VngosOWiaExEtbstDoix?p=preview))
 *
 * ```
 * import {BaseResponseOptions, Response} from 'angular2/http';
 *
 * var options = new BaseResponseOptions();
 * var res = new Response(options.merge({
 *   body: 'Angular2',
 *   headers: new Headers({framework: 'angular'})
 * }));
 * console.log('res.headers.get("framework"):', res.headers.get('framework')); // angular
 * console.log('res.text():', res.text()); // Angular2;
 * ```
 */
var BaseResponseOptions = (function (_super) {
    __extends(BaseResponseOptions, _super);
    function BaseResponseOptions() {
        _super.call(this, { status: 200, statusText: 'Ok', type: enums_1.ResponseType.Default, headers: new headers_1.Headers() });
    }
    BaseResponseOptions = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], BaseResponseOptions);
    return BaseResponseOptions;
}(ResponseOptions));
exports.BaseResponseOptions = BaseResponseOptions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZV9yZXNwb25zZV9vcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2h0dHAvYmFzZV9yZXNwb25zZV9vcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6QyxxQkFBb0MsMEJBQTBCLENBQUMsQ0FBQTtBQUMvRCx3QkFBc0IsV0FBVyxDQUFDLENBQUE7QUFDbEMsc0JBQTJCLFNBQVMsQ0FBQyxDQUFBO0FBR3JDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUJHO0FBQ0g7SUF3QkUseUJBQVksRUFBd0U7WUFBeEUsNEJBQXdFLEVBQXZFLGNBQUksRUFBRSxrQkFBTSxFQUFFLG9CQUFPLEVBQUUsMEJBQVUsRUFBRSxjQUFJLEVBQUUsWUFBRztRQUN2RCxJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztRQUMxQyxJQUFJLENBQUMsTUFBTSxHQUFHLGdCQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNoRCxJQUFJLENBQUMsT0FBTyxHQUFHLGdCQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNuRCxJQUFJLENBQUMsVUFBVSxHQUFHLGdCQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQztRQUM1RCxJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztRQUMxQyxJQUFJLENBQUMsR0FBRyxHQUFHLGdCQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQztJQUN6QyxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXdCRztJQUNILCtCQUFLLEdBQUwsVUFBTSxPQUE2QjtRQUNqQyxNQUFNLENBQUMsSUFBSSxlQUFlLENBQUM7WUFDekIsSUFBSSxFQUFFLGdCQUFTLENBQUMsT0FBTyxDQUFDLElBQUksZ0JBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtZQUM5RSxNQUFNLEVBQUUsZ0JBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxnQkFBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNO1lBQ3RGLE9BQU8sRUFBRSxnQkFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGdCQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU87WUFDMUYsVUFBVSxFQUFFLGdCQUFTLENBQUMsT0FBTyxDQUFDLElBQUksZ0JBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTyxDQUFDLFVBQVU7Z0JBQ2xCLElBQUksQ0FBQyxVQUFVO1lBQ2pGLElBQUksRUFBRSxnQkFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGdCQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUk7WUFDOUUsR0FBRyxFQUFFLGdCQUFTLENBQUMsT0FBTyxDQUFDLElBQUksZ0JBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRztTQUMzRSxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBckVELElBcUVDO0FBckVZLHVCQUFlLGtCQXFFM0IsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkNHO0FBRUg7SUFBeUMsdUNBQWU7SUFDdEQ7UUFDRSxrQkFBTSxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsb0JBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksaUJBQU8sRUFBRSxFQUFDLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBSkg7UUFBQyxpQkFBVSxFQUFFOzsyQkFBQTtJQUtiLDBCQUFDO0FBQUQsQ0FBQyxBQUpELENBQXlDLGVBQWUsR0FJdkQ7QUFKWSwyQkFBbUIsc0JBSS9CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzSnNPYmplY3R9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0hlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge1Jlc3BvbnNlVHlwZX0gZnJvbSAnLi9lbnVtcyc7XG5pbXBvcnQge1Jlc3BvbnNlT3B0aW9uc0FyZ3N9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHJlc3BvbnNlIG9wdGlvbnMgb2JqZWN0IHRvIGJlIG9wdGlvbmFsbHkgcHJvdmlkZWQgd2hlbiBpbnN0YW50aWF0aW5nIGFcbiAqIHtAbGluayBSZXNwb25zZX0uXG4gKlxuICogVGhpcyBjbGFzcyBpcyBiYXNlZCBvbiB0aGUgYFJlc3BvbnNlSW5pdGAgZGVzY3JpcHRpb24gaW4gdGhlIFtGZXRjaFxuICogU3BlY10oaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI3Jlc3BvbnNlaW5pdCkuXG4gKlxuICogQWxsIHZhbHVlcyBhcmUgbnVsbCBieSBkZWZhdWx0LiBUeXBpY2FsIGRlZmF1bHRzIGNhbiBiZSBmb3VuZCBpbiB0aGVcbiAqIHtAbGluayBCYXNlUmVzcG9uc2VPcHRpb25zfSBjbGFzcywgd2hpY2ggc3ViLWNsYXNzZXMgYFJlc3BvbnNlT3B0aW9uc2AuXG4gKlxuICogVGhpcyBjbGFzcyBtYXkgYmUgdXNlZCBpbiB0ZXN0cyB0byBidWlsZCB7QGxpbmsgUmVzcG9uc2UgUmVzcG9uc2VzfSBmb3JcbiAqIG1vY2sgcmVzcG9uc2VzIChzZWUge0BsaW5rIE1vY2tCYWNrZW5kfSkuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1A5SmtrOGU4Y3o2TlZ6YmN4RXNEP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtSZXNwb25zZU9wdGlvbnMsIFJlc3BvbnNlfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiB2YXIgb3B0aW9ucyA9IG5ldyBSZXNwb25zZU9wdGlvbnMoe1xuICogICBib2R5OiAne1wibmFtZVwiOlwiSmVmZlwifSdcbiAqIH0pO1xuICogdmFyIHJlcyA9IG5ldyBSZXNwb25zZShvcHRpb25zKTtcbiAqXG4gKiBjb25zb2xlLmxvZygncmVzLmpzb24oKTonLCByZXMuanNvbigpKTsgLy8gT2JqZWN0IHtuYW1lOiBcIkplZmZcIn1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgUmVzcG9uc2VPcHRpb25zIHtcbiAgLy8gVE9ETzogQXJyYXlCdWZmZXIgfCBGb3JtRGF0YSB8IEJsb2JcbiAgLyoqXG4gICAqIFN0cmluZyBvciBPYmplY3QgcmVwcmVzZW50aW5nIHRoZSBib2R5IG9mIHRoZSB7QGxpbmsgUmVzcG9uc2V9LlxuICAgKi9cbiAgYm9keTogc3RyaW5nIHwgT2JqZWN0O1xuICAvKipcbiAgICogSHR0cCB7QGxpbmsgaHR0cDovL3d3dy53My5vcmcvUHJvdG9jb2xzL3JmYzI2MTYvcmZjMjYxNi1zZWMxMC5odG1sIHN0YXR1cyBjb2RlfVxuICAgKiBhc3NvY2lhdGVkIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgKi9cbiAgc3RhdHVzOiBudW1iZXI7XG4gIC8qKlxuICAgKiBSZXNwb25zZSB7QGxpbmsgSGVhZGVycyBoZWFkZXJzfVxuICAgKi9cbiAgaGVhZGVyczogSGVhZGVycztcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgc3RhdHVzVGV4dDogc3RyaW5nO1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICB0eXBlOiBSZXNwb25zZVR5cGU7XG4gIHVybDogc3RyaW5nO1xuICBjb25zdHJ1Y3Rvcih7Ym9keSwgc3RhdHVzLCBoZWFkZXJzLCBzdGF0dXNUZXh0LCB0eXBlLCB1cmx9OiBSZXNwb25zZU9wdGlvbnNBcmdzID0ge30pIHtcbiAgICB0aGlzLmJvZHkgPSBpc1ByZXNlbnQoYm9keSkgPyBib2R5IDogbnVsbDtcbiAgICB0aGlzLnN0YXR1cyA9IGlzUHJlc2VudChzdGF0dXMpID8gc3RhdHVzIDogbnVsbDtcbiAgICB0aGlzLmhlYWRlcnMgPSBpc1ByZXNlbnQoaGVhZGVycykgPyBoZWFkZXJzIDogbnVsbDtcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBpc1ByZXNlbnQoc3RhdHVzVGV4dCkgPyBzdGF0dXNUZXh0IDogbnVsbDtcbiAgICB0aGlzLnR5cGUgPSBpc1ByZXNlbnQodHlwZSkgPyB0eXBlIDogbnVsbDtcbiAgICB0aGlzLnVybCA9IGlzUHJlc2VudCh1cmwpID8gdXJsIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGUgYFJlc3BvbnNlT3B0aW9uc2AgaW5zdGFuY2UsIHVzaW5nIHRoZSBvcHRpb25hbCBpbnB1dCBhcyB2YWx1ZXMgdG9cbiAgICogb3ZlcnJpZGVcbiAgICogZXhpc3RpbmcgdmFsdWVzLiBUaGlzIG1ldGhvZCB3aWxsIG5vdCBjaGFuZ2UgdGhlIHZhbHVlcyBvZiB0aGUgaW5zdGFuY2Ugb24gd2hpY2ggaXQgaXMgYmVpbmdcbiAgICogY2FsbGVkLlxuICAgKlxuICAgKiBUaGlzIG1heSBiZSB1c2VmdWwgd2hlbiBzaGFyaW5nIGEgYmFzZSBgUmVzcG9uc2VPcHRpb25zYCBvYmplY3QgaW5zaWRlIHRlc3RzLFxuICAgKiB3aGVyZSBjZXJ0YWluIHByb3BlcnRpZXMgbWF5IGNoYW5nZSBmcm9tIHRlc3QgdG8gdGVzdC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzFsWHF1cUZmZ2R1VEZCV2pOb1JFP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogaW1wb3J0IHtSZXNwb25zZU9wdGlvbnMsIFJlc3BvbnNlfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAgICpcbiAgICogdmFyIG9wdGlvbnMgPSBuZXcgUmVzcG9uc2VPcHRpb25zKHtcbiAgICogICBib2R5OiB7bmFtZTogJ0plZmYnfVxuICAgKiB9KTtcbiAgICogdmFyIHJlcyA9IG5ldyBSZXNwb25zZShvcHRpb25zLm1lcmdlKHtcbiAgICogICB1cmw6ICdodHRwczovL2dvb2dsZS5jb20nXG4gICAqIH0pKTtcbiAgICogY29uc29sZS5sb2coJ29wdGlvbnMudXJsOicsIG9wdGlvbnMudXJsKTsgLy8gbnVsbFxuICAgKiBjb25zb2xlLmxvZygncmVzLmpzb24oKTonLCByZXMuanNvbigpKTsgLy8gT2JqZWN0IHtuYW1lOiBcIkplZmZcIn1cbiAgICogY29uc29sZS5sb2coJ3Jlcy51cmw6JywgcmVzLnVybCk7IC8vIGh0dHBzOi8vZ29vZ2xlLmNvbVxuICAgKiBgYGBcbiAgICovXG4gIG1lcmdlKG9wdGlvbnM/OiBSZXNwb25zZU9wdGlvbnNBcmdzKTogUmVzcG9uc2VPcHRpb25zIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlT3B0aW9ucyh7XG4gICAgICBib2R5OiBpc1ByZXNlbnQob3B0aW9ucykgJiYgaXNQcmVzZW50KG9wdGlvbnMuYm9keSkgPyBvcHRpb25zLmJvZHkgOiB0aGlzLmJvZHksXG4gICAgICBzdGF0dXM6IGlzUHJlc2VudChvcHRpb25zKSAmJiBpc1ByZXNlbnQob3B0aW9ucy5zdGF0dXMpID8gb3B0aW9ucy5zdGF0dXMgOiB0aGlzLnN0YXR1cyxcbiAgICAgIGhlYWRlcnM6IGlzUHJlc2VudChvcHRpb25zKSAmJiBpc1ByZXNlbnQob3B0aW9ucy5oZWFkZXJzKSA/IG9wdGlvbnMuaGVhZGVycyA6IHRoaXMuaGVhZGVycyxcbiAgICAgIHN0YXR1c1RleHQ6IGlzUHJlc2VudChvcHRpb25zKSAmJiBpc1ByZXNlbnQob3B0aW9ucy5zdGF0dXNUZXh0KSA/IG9wdGlvbnMuc3RhdHVzVGV4dCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXR1c1RleHQsXG4gICAgICB0eXBlOiBpc1ByZXNlbnQob3B0aW9ucykgJiYgaXNQcmVzZW50KG9wdGlvbnMudHlwZSkgPyBvcHRpb25zLnR5cGUgOiB0aGlzLnR5cGUsXG4gICAgICB1cmw6IGlzUHJlc2VudChvcHRpb25zKSAmJiBpc1ByZXNlbnQob3B0aW9ucy51cmwpID8gb3B0aW9ucy51cmwgOiB0aGlzLnVybCxcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFN1YmNsYXNzIG9mIHtAbGluayBSZXNwb25zZU9wdGlvbnN9LCB3aXRoIGRlZmF1bHQgdmFsdWVzLlxuICpcbiAqIERlZmF1bHQgdmFsdWVzOlxuICogICogc3RhdHVzOiAyMDBcbiAqICAqIGhlYWRlcnM6IGVtcHR5IHtAbGluayBIZWFkZXJzfSBvYmplY3RcbiAqXG4gKiBUaGlzIGNsYXNzIGNvdWxkIGJlIGV4dGVuZGVkIGFuZCBib3VuZCB0byB0aGUge0BsaW5rIFJlc3BvbnNlT3B0aW9uc30gY2xhc3NcbiAqIHdoZW4gY29uZmlndXJpbmcgYW4ge0BsaW5rIEluamVjdG9yfSwgaW4gb3JkZXIgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9uc1xuICogdXNlZCBieSB7QGxpbmsgSHR0cH0gdG8gY3JlYXRlIHtAbGluayBSZXNwb25zZSBSZXNwb25zZXN9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9xdjhETFQ/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge3Byb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtIVFRQX1BST1ZJREVSUywgSGVhZGVycywgSHR0cCwgQmFzZVJlc3BvbnNlT3B0aW9ucywgUmVzcG9uc2VPcHRpb25zfSBmcm9tXG4gKiAnYW5ndWxhcjIvaHR0cCc7XG4gKiBpbXBvcnQge0FwcH0gZnJvbSAnLi9teWFwcCc7XG4gKlxuICogY2xhc3MgTXlPcHRpb25zIGV4dGVuZHMgQmFzZVJlc3BvbnNlT3B0aW9ucyB7XG4gKiAgIGhlYWRlcnM6SGVhZGVycyA9IG5ldyBIZWFkZXJzKHtuZXR3b3JrOiAnZ2l0aHViJ30pO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHAsIFtIVFRQX1BST1ZJREVSUywgcHJvdmlkZShSZXNwb25zZU9wdGlvbnMsIHt1c2VDbGFzczogTXlPcHRpb25zfSldKTtcbiAqIGBgYFxuICpcbiAqIFRoZSBvcHRpb25zIGNvdWxkIGFsc28gYmUgZXh0ZW5kZWQgd2hlbiBtYW51YWxseSBjcmVhdGluZyBhIHtAbGluayBSZXNwb25zZX1cbiAqIG9iamVjdC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvVm5nb3NPV2lhRXhFdGJzdERvaXg/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7QmFzZVJlc3BvbnNlT3B0aW9ucywgUmVzcG9uc2V9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICpcbiAqIHZhciBvcHRpb25zID0gbmV3IEJhc2VSZXNwb25zZU9wdGlvbnMoKTtcbiAqIHZhciByZXMgPSBuZXcgUmVzcG9uc2Uob3B0aW9ucy5tZXJnZSh7XG4gKiAgIGJvZHk6ICdBbmd1bGFyMicsXG4gKiAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHtmcmFtZXdvcms6ICdhbmd1bGFyJ30pXG4gKiB9KSk7XG4gKiBjb25zb2xlLmxvZygncmVzLmhlYWRlcnMuZ2V0KFwiZnJhbWV3b3JrXCIpOicsIHJlcy5oZWFkZXJzLmdldCgnZnJhbWV3b3JrJykpOyAvLyBhbmd1bGFyXG4gKiBjb25zb2xlLmxvZygncmVzLnRleHQoKTonLCByZXMudGV4dCgpKTsgLy8gQW5ndWxhcjI7XG4gKiBgYGBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJhc2VSZXNwb25zZU9wdGlvbnMgZXh0ZW5kcyBSZXNwb25zZU9wdGlvbnMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7c3RhdHVzOiAyMDAsIHN0YXR1c1RleHQ6ICdPaycsIHR5cGU6IFJlc3BvbnNlVHlwZS5EZWZhdWx0LCBoZWFkZXJzOiBuZXcgSGVhZGVycygpfSk7XG4gIH1cbn1cbiJdfQ==