/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementSchemaRegistry, UrlResolver, ResourceLoader} from '@angular/compiler';
import {createUrlResolverWithoutPackagePrefix} from '@angular/compiler/src/url_resolver';
import {MockSchemaRegistry} from '@angular/compiler/testing';
import {MockResourceLoader} from '@angular/compiler/testing/resource_loader_mock';

export var TEST_COMPILER_PROVIDERS: any[] = [
  {provide: ElementSchemaRegistry, useValue: new MockSchemaRegistry({}, {})},
  {provide: ResourceLoader, useClass: MockResourceLoader},
  {provide: UrlResolver, useFactory: createUrlResolverWithoutPackagePrefix}
];
