/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO(alan-agius4): remove this export once migration has been done in Google3. (Should happen
// prior to V12 RC).
export {XhrFactory} from '@angular/common';

export {HttpBackend, HttpHandler} from './src/backend';
export {HttpClient} from './src/client';
export {HttpContext, HttpContextToken} from './src/context';
export {HttpHeaders} from './src/headers';
export {HTTP_INTERCEPTORS, HttpInterceptor} from './src/interceptor';
export {JsonpClientBackend, JsonpInterceptor} from './src/jsonp';
export {HttpClientJsonpModule, HttpClientModule, HttpClientXsrfModule, HttpInterceptingHandler as ɵHttpInterceptingHandler} from './src/module';
export {HttpParameterCodec, HttpParams, HttpParamsOptions, HttpUrlEncodingCodec} from './src/params';
export {HttpRequest} from './src/request';
export {HttpDownloadProgressEvent, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpResponseBase, HttpSentEvent, HttpStatusCode, HttpUploadProgressEvent, HttpUserEvent} from './src/response';
export {HttpXhrBackend} from './src/xhr';
export {HttpXsrfTokenExtractor} from './src/xsrf';
