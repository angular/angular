import {
  ddescribe,
  describe,
  xdescribe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  AsyncTestCompleter,
  inject,
  beforeEachProviders
} from 'angular2/testing_internal';

import {provide} from 'angular2/core';
import {Compiler} from 'angular2/src/core/linker/compiler';
import {reflector, ReflectionInfo} from 'angular2/src/core/reflection/reflection';
import {Compiler_} from "angular2/src/core/linker/compiler";
import {HostViewFactory} from 'angular2/src/core/linker/view';
import {HostViewFactoryRef_} from 'angular2/src/core/linker/view_ref';

export function main() {
  describe('Compiler', () => {
    var someHostViewFactory;

    beforeEachProviders(() => [provide(Compiler, {useClass: Compiler_})]);

    beforeEach(inject([Compiler], (_compiler) => {
      someHostViewFactory = new HostViewFactory(null, null);
      reflector.registerType(SomeComponent, new ReflectionInfo([someHostViewFactory]));
    }));

    it('should read the template from an annotation',
       inject([AsyncTestCompleter, Compiler], (async, compiler: Compiler) => {
         compiler.compileInHost(SomeComponent)
             .then((hostViewFactoryRef: HostViewFactoryRef_) => {
               expect(hostViewFactoryRef.internalHostViewFactory).toBe(someHostViewFactory);
               async.done();
               return null;
             });
       }));

    it('should clear the cache', inject([Compiler], (compiler) => {
         // Nothing to assert for now...
         compiler.clearCache();
       }));
  });
}

class SomeComponent {}
