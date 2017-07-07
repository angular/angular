/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Old API surface:
export {JSONPBackend, JSONPConnection} from './src/backends/jsonp_backend';
export {BrowserXhr, CookieXSRFStrategy, XHRBackend, XHRConnection} from './src/backends/xhr_backend';
export {BaseRequestOptions, RequestOptions} from './src/base_request_options';
export {BaseResponseOptions, ResponseOptions} from './src/base_response_options';
export {Headers, QueryEncoder, URLSearchParams} from './src/client';
export {ReadyState, RequestMethod, ResponseContentType, ResponseType} from './src/enums';
export {Http, Jsonp} from './src/http';
export {HttpModule, JsonpModule} from './src/http_module';
export {Connection, ConnectionBackend, RequestOptionsArgs, ResponseOptionsArgs, XSRFStrategy} from './src/interfaces';
export {Request} from './src/static_request';
export {Response} from './src/static_response';
export {VERSION} from './src/version';
