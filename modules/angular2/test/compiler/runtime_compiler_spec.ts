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

import {Component, View, provide} from 'angular2/core';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {SpyTemplateCompiler} from './spies';
import {TemplateCompiler} from 'angular2/src/compiler/compiler';
import {RuntimeCompiler, RuntimeCompiler_} from 'angular2/src/compiler/runtime_compiler';
import {HostViewFactory} from 'angular2/src/core/linker/view';

export function main() {
  describe('RuntimeCompiler', () => {
    var compiler: RuntimeCompiler_;
    var templateCompilerSpy;
    var someHostViewFactory;

    beforeEachProviders(() => {
      templateCompilerSpy = new SpyTemplateCompiler();
      someHostViewFactory = new HostViewFactory(null, null);
      templateCompilerSpy.spy('compileHostComponentRuntime')
          .andReturn(PromiseWrapper.resolve(someHostViewFactory));
      return [provide(TemplateCompiler, {useValue: templateCompilerSpy})];
    });

    beforeEach(inject([RuntimeCompiler], (_compiler) => { compiler = _compiler; }));

    it('compileInHost should compile the template via TemplateCompiler',
       inject([AsyncTestCompleter], (async) => {
         compiler.compileInHost(SomeComponent)
             .then((hostViewFactoryRef) => {
               expect(hostViewFactoryRef.internalHostViewFactory).toBe(someHostViewFactory);
               async.done();
             });
       }));

    it('should clear the cache', () => {
      compiler.clearCache();
      expect(templateCompilerSpy.spy('clearCache')).toHaveBeenCalled();
    });
  });
}

@Component({selector: 'some-comp'})
@View({template: ''})
class SomeComponent {
}
