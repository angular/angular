/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementSchemaRegistry, UrlResolver, XHR} from '@angular/compiler';
import {createUrlResolverWithoutPackagePrefix} from '@angular/compiler/src/url_resolver';
import {MockSchemaRegistry, MockXHR} from '@angular/compiler/testing';

export var TEST_PROVIDERS: any[] = [
  {provide: ElementSchemaRegistry, useValue: new MockSchemaRegistry({}, {})},
  {provide: XHR, useClass: MockXHR},
  {provide: UrlResolver, useFactory: createUrlResolverWithoutPackagePrefix}
];
