/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {httpResource, provideHttpClient} from '@angular/common/http';
import {Component, resource} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: '{{data.value()}} {{httpData.value()}}',
})
class App {
  readonly data = resource({loader: async () => 42});
  readonly httpData = httpResource(() => '/data');
}

bootstrapApplication(App, {providers: [provideHttpClient()]});
