/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  HttpClient,
  HttpInterceptorFn,
  httpResource,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {Component, inject, signal} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.info(req.url);
  return next(req);
};

@Component({
  selector: 'app-root',
  template: '{{data.value()}} {{status()}}',
})
class HttpExample {
  readonly data = httpResource<string>(() => '/api/data');
  readonly status = signal('');

  constructor() {
    inject(HttpClient)
      .get('/api/status', {responseType: 'text'})
      .subscribe((status) => this.status.set(status));
  }
}

bootstrapApplication(HttpExample, {
  providers: [provideHttpClient(withInterceptors([loggingInterceptor]))],
});
