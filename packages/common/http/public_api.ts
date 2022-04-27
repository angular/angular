/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {XhrFactory as XhrFactory_fromAngularCommon} from '@angular/common';

/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 * @see `XhrFactory`
 * @deprecated
 * `XhrFactory` has moved, please import `XhrFactory` from `@angular/common` instead.
 */
export type XhrFactory = XhrFactory_fromAngularCommon;
/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 * @see `XhrFactory`
 * @deprecated
 * `XhrFactory` has moved, please import `XhrFactory` from `@angular/common` instead.
 */
export const XhrFactory = XhrFactory_fromAngularCommon;

export {HttpBackend, HttpHandler} from './src/backend.js';
export {HttpClient} from './src/client.js';
export {HttpContext, HttpContextToken} from './src/context.js';
export {HttpHeaders} from './src/headers.js';
export {HTTP_INTERCEPTORS, HttpInterceptor} from './src/interceptor.js';
export {JsonpClientBackend, JsonpInterceptor} from './src/jsonp.js';
export {HttpClientJsonpModule, HttpClientModule, HttpClientXsrfModule, HttpInterceptingHandler as ɵHttpInterceptingHandler} from './src/module.js';
export {HttpParameterCodec, HttpParams, HttpParamsOptions, HttpUrlEncodingCodec} from './src/params.js';
export {HttpRequest} from './src/request.js';
export {HttpDownloadProgressEvent, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpResponseBase, HttpSentEvent, HttpStatusCode, HttpUploadProgressEvent, HttpUserEvent} from './src/response.js';
export {HttpXhrBackend} from './src/xhr.js';
export {HttpXsrfTokenExtractor} from './src/xsrf.js';
