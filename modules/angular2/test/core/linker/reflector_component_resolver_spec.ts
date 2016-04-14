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
import {
  ComponentResolver,
  ReflectorComponentResolver
} from 'angular2/src/core/linker/component_resolver';
import {reflector, ReflectionInfo} from 'angular2/src/core/reflection/reflection';
import {ComponentFactory} from 'angular2/src/core/linker/component_factory';

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
