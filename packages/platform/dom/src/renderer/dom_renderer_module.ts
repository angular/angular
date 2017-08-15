/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NgModule, ɵConsole as Console, ErrorHandler, ApplicationInitStatus, ApplicationModule, RendererFactory2,
  Sanitizer, SecurityContext } from '@angular/core';
import { DomPluginRendererFactory } from './plugin_renderer';

export class NoopSanitizer implements Sanitizer {
  sanitize(context: SecurityContext, value: {} | string | any): string | any {
    return value;
  }
}

export function errorHandlerFactory() { return new ErrorHandler(); }

@NgModule({
  providers: [
    Console,
    { provide: ErrorHandler, useFactory: errorHandlerFactory },
    ApplicationInitStatus,
    { provide: RendererFactory2, useClass: DomPluginRendererFactory },
    { provide: Sanitizer, useClass: NoopSanitizer}
  ],
  exports: [
    ApplicationModule,
  ]
})
export class DomRendererModule {}
