/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './testing/schema_registry_mock';
export * from './testing/view_resolver_mock';
export * from './testing/test_component_builder';
export * from './testing/directive_resolver_mock';
export * from './testing/ng_module_resolver_mock';

import {createPlatformFactory, CompilerOptions, PlatformRef} from '@angular/core';
import {platformCoreDynamic, DirectiveResolver, ViewResolver, NgModuleResolver} from './index';
import {MockViewResolver} from './testing/view_resolver_mock';
import {MockDirectiveResolver} from './testing/directive_resolver_mock';
import {MockNgModuleResolver} from './testing/ng_module_resolver_mock';


/**
 * Platform for dynamic tests
 *
 * @experimental
 */
export const platformCoreDynamicTesting =
    createPlatformFactory(platformCoreDynamic, 'coreDynamicTesting', [{
                            provide: CompilerOptions,
                            useValue: {
                              providers: [
                                {provide: DirectiveResolver, useClass: MockDirectiveResolver},
                                {provide: ViewResolver, useClass: MockViewResolver},
                                {provide: NgModuleResolver, useClass: MockNgModuleResolver}
                              ]
                            },
                            multi: true
                          }]);
