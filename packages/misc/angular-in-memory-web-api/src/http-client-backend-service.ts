/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {XhrFactory} from '@angular/common';
import {HttpBackend, HttpEvent, HttpHeaders, HttpParams, HttpRequest, HttpResponse, HttpXhrBackend} from '@angular/common/http';
import {Inject, Injectable, Optional} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {BackendService} from './backend-service';
import {STATUS} from './http-status-codes';
import {InMemoryBackendConfig, InMemoryBackendConfigArgs, InMemoryDbService, ResponseOptions} from './interfaces';

/**
 * For Angular `HttpClient` simulate the behavior of a RESTy web api
 * backed by the simple in-memory data store provided by the injected `InMemoryDbService`.
 * Conforms mostly to behavior described here:
 * https://www.restapitutorial.com/lessons/httpmethods.html
 *
 * ### Usage
 *
 * Create an in-memory data store class that implements `InMemoryDbService`.
 * Call `config` static method with this service class and optional configuration object:
 * ```
 * // other imports
 * import { HttpClientModule } from '@angular/common/http';
 * import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
 *
 * import { InMemHeroService, inMemConfig } from '../api/in-memory-hero.service';
 * @NgModule({
 *  imports: [
 *    HttpModule,
 *    HttpClientInMemoryWebApiModule.forRoot(InMemHeroService, inMemConfig),
 *    ...
 *  ],
 *  ...
 * })
 * export class AppModule { ... }
 * ```
 */
@Injectable()
export class HttpClientBackendService extends BackendService implements HttpBackend {
  constructor(
      inMemDbService: InMemoryDbService,
      @Inject(InMemoryBackendConfig) @Optional() config: InMemoryBackendConfigArgs,
      private xhrFactory: XhrFactory) {
    super(inMemDbService, config);
  }

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    try {
      return this.handleRequest(req);

    } catch (error) {
      const err = error.message || error;
      const resOptions =
          this.createErrorResponseOptions(req.url, STATUS.INTERNAL_SERVER_ERROR, `${err}`);
      return this.createResponse$(() => resOptions);
    }
  }

  protected override getJsonBody(req: HttpRequest<any>): any {
    return req.body;
  }

  protected override getRequestMethod(req: HttpRequest<any>): string {
    return (req.method || 'get').toLowerCase();
  }

  protected override createHeaders(headers: {[index: string]: string;}): HttpHeaders {
    return new HttpHeaders(headers);
  }

  protected override createQueryMap(search: string): Map<string, string[]> {
    const map = new Map<string, string[]>();
    if (search) {
      const params = new HttpParams({fromString: search});
      params.keys().forEach(p => map.set(p, params.getAll(p) || []));
    }
    return map;
  }

  protected override createResponse$fromResponseOptions$(resOptions$: Observable<ResponseOptions>):
      Observable<HttpResponse<any>> {
    return resOptions$.pipe(map(opts => new HttpResponse<any>(opts)));
  }

  protected override createPassThruBackend() {
    try {
      return new HttpXhrBackend(this.xhrFactory);
    } catch (ex) {
      ex.message = 'Cannot create passThru404 backend; ' + (ex.message || '');
      throw ex;
    }
  }
}
