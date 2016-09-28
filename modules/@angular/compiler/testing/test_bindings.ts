/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementSchemaRegistry, ResourceLoader, UrlResolver} from '@angular/compiler';
import {Provider} from '@angular/core';
import {MockResourceLoader} from './resource_loader_mock';
import {MockSchemaRegistry} from './schema_registry_mock';

export function createUrlResolverWithoutPackagePrefix(): UrlResolver {
  return new UrlResolver();
}

// This provider is put here just so that we can access it from multiple
// internal test packages.
// TODO: get rid of it or move to a separate @angular/internal_testing package
export var TEST_COMPILER_PROVIDERS: Provider[] = [
  {provide: ElementSchemaRegistry, useValue: new MockSchemaRegistry({}, {}, {}, [], [])},
  {provide: ResourceLoader, useClass: MockResourceLoader},
  {provide: UrlResolver, useFactory: createUrlResolverWithoutPackagePrefix}
];
