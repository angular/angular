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
  inject,
  beforeEachProviders
} from '@angular/core/testing/testing_internal';
import {AsyncTestCompleter} from '@angular/core/testing/testing_internal';

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
             .then((compFactory: ComponentFactory<any>) => {
               expect(compFactory).toBe(someCompFactory);
               async.done();
               return null;
             });
       }));

    it('should throw when given a string',
       inject([AsyncTestCompleter, ComponentResolver], (async, compiler: ComponentResolver) => {
         compiler.resolveComponent("someString")
             .catch((e) => {
               expect(e.message).toContain("Cannot resolve component using 'someString'.")
               async.done();
             });
       }));
  });
}

class SomeComponent {}
