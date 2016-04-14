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
import {ComponentFactory} from 'angular2/src/core/linker/component_factory';

export function main() {
  describe('Compiler', () => {
    var someCompFactory;

    beforeEachProviders(() => [provide(Compiler, {useClass: Compiler_})]);

    beforeEach(inject([Compiler], (_compiler) => {
      someCompFactory = new ComponentFactory(null, null, null);
      reflector.registerType(SomeComponent, new ReflectionInfo([someCompFactory]));
    }));

    it('should read the template from an annotation',
       inject([AsyncTestCompleter, Compiler], (async, compiler: Compiler) => {
         compiler.compileComponent(SomeComponent)
             .then((compFactory: ComponentFactory) => {
               expect(compFactory).toBe(someCompFactory);
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
