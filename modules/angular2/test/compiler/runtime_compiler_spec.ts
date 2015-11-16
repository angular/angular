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
  beforeEachBindings
} from 'angular2/testing_internal';

import {Component, View, provide} from 'angular2/core';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {SpyProtoViewFactory} from '../core/spies';
import {
  CompiledHostTemplate,
  CompiledComponentTemplate,
  BeginComponentCmd
} from 'angular2/src/core/linker/template_commands';
import {RuntimeCompiler} from 'angular2/src/compiler/runtime_compiler';
import {ProtoViewFactory} from 'angular2/src/core/linker/proto_view_factory';
import {AppProtoView} from 'angular2/src/core/linker/view';

export function main() {
  describe('RuntimeCompiler', () => {
    var compiler: RuntimeCompiler;

    beforeEach(inject([RuntimeCompiler], (_compiler) => { compiler = _compiler; }));

    describe('compileInHost', () => {
      var protoViewFactorySpy;
      var someProtoView;

      beforeEachBindings(() => {
        protoViewFactorySpy = new SpyProtoViewFactory();
        someProtoView = new AppProtoView(null, null, null, null, null, null, null);
        protoViewFactorySpy.spy('createHost').andReturn(someProtoView);
        return [provide(ProtoViewFactory, {useValue: protoViewFactorySpy})];
      });

      it('should compile the template via TemplateCompiler',
         inject([AsyncTestCompleter], (async) => {
           var cht: CompiledHostTemplate;
           protoViewFactorySpy.spy('createHost')
               .andCallFake((_cht) => {
                 cht = _cht;
                 return someProtoView;
               });
           compiler.compileInHost(SomeComponent)
               .then((_) => {
                 var beginComponentCmd = <BeginComponentCmd>cht.template.commands[0];
                 expect(beginComponentCmd.name).toEqual('some-comp');
                 async.done();
               });
         }));

    });


    it('should cache the result', inject([AsyncTestCompleter], (async) => {
         PromiseWrapper
             .all([compiler.compileInHost(SomeComponent), compiler.compileInHost(SomeComponent)])
             .then((protoViewRefs) => {
               expect(protoViewRefs[0]).toBe(protoViewRefs[1]);
               async.done();
             });
       }));

    it('should clear the cache',
       inject([AsyncTestCompleter], (async) => {compiler.compileInHost(SomeComponent)
                                                    .then((protoViewRef1) => {
                                                      compiler.clearCache();
                                                      compiler.compileInHost(SomeComponent)
                                                          .then((protoViewRef2) => {
                                                            expect(protoViewRef1)
                                                                .not.toBe(protoViewRef2);
                                                            async.done();
                                                          });
                                                    })}));

  });
}

@Component({selector: 'some-comp'})
@View({template: ''})
class SomeComponent {
}
