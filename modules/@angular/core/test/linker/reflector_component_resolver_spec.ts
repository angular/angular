/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, provide} from '@angular/core';
import {ComponentFactory} from '@angular/core/src/linker/component_factory';
import {ComponentResolver, ReflectorComponentResolver} from '@angular/core/src/linker/component_resolver';
import {ReflectionInfo, reflector} from '@angular/core/src/reflection/reflection';
import {afterEach, beforeEach, beforeEachProviders, ddescribe, describe, expect, iit, inject, it, xdescribe, xit} from '@angular/core/testing/testing_internal';
import {AsyncTestCompleter} from '@angular/core/testing/testing_internal';
import {Console} from '../../src/console';

class DummyConsole implements Console {
  log(message: string) {}
  warn(message: string) {}
}

export function main() {
  describe('Compiler', () => {
    var someCompFactory: any /** TODO #9100 */;
    var compiler: ComponentResolver;

    beforeEach(() => {
      someCompFactory = new ComponentFactory(null, null, null);
      reflector.registerType(SomeComponent, new ReflectionInfo([someCompFactory]));
      compiler = new ReflectorComponentResolver(new DummyConsole());
    });

    it('should read the template from an annotation',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         compiler.resolveComponent(SomeComponent).then((compFactory: ComponentFactory<any>) => {
           expect(compFactory).toBe(someCompFactory);
           async.done();
           return null;
         });
       }));

    it('should throw when given a string',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         compiler.resolveComponent('someString').catch((e) => {
           expect(e.message).toContain('Cannot resolve component using \'someString\'.')
               async.done();
         });
       }));
  });
}

class SomeComponent {}
