/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';

import {HttpRequest} from './request';
import {HttpEvent} from './response';

export type HttpHandlerFn = (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>;

export type HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) =>
    Observable<HttpEvent<unknown>>;
