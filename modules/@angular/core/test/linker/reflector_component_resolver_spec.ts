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
} from '@angular/testing/testing_internal';

import {provide} from '@angular/core';
import {
  ComponentResolver,
  ReflectorComponentResolver
} from '@angular/core/src/linker/component_resolver';
import {reflector, ReflectionInfo} from '@angular/core/src/reflection/reflection';
import {ComponentFactory} from '@angular/core/src/linker/component_factory';

export function main() {
  describe('Compiler', () => {
    var someCompFactory;

    beforeEachProviders(() => [provide(ComponentResolver, {useClass: ReflectorComponentResolver})]);

    beforeEach(inject([ComponentResolver], (_compiler) => {
      someCompFactory = new ComponentFactory(null, null, null);
      reflector.registerType(SomeComponent, new ReflectionInfo([someCompFactory]));
    }));

    it('should read the template from an annotation',
       inject([AsyncTestCompleter, ComponentResolver], (async, compiler: ComponentResolver) => {
         compiler.resolveComponent(SomeComponent)
             .then((compFactory: ComponentFactory) => {
               expect(compFactory).toBe(someCompFactory);
               async.done();
               return null;
             });
       }));
  });
}

class SomeComponent {}
