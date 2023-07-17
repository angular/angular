/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, InjectionToken, NgModule} from '@angular/core';

export const AOT_TOKEN = new InjectionToken<string>('TOKEN');

@Injectable()
export class AotService {
}

@NgModule({
  providers: [AotService],
})
export class AotServiceModule {
}

@NgModule({
  providers: [{provide: AOT_TOKEN, useValue: 'imports'}],
})
export class AotImportedModule {
}

@NgModule({
  providers: [{provide: AOT_TOKEN, useValue: 'exports'}],
})
export class AotExportedModule {
}

@NgModule({
  imports: [AotServiceModule, AotImportedModule],
  exports: [AotExportedModule],
})
export class AotModule {
}
