import {
  AsyncTestCompleter,
  describe,
  el,
  expect,
  inject,
  it,
  beforeEachProviders,
  TestComponentBuilder
} from 'angular2/testing_internal';
import {CONST_EXPR} from 'angular2/src/facade/lang';
import {provide, OpaqueToken} from 'angular2/core';
import {ChangeDetectorGenConfig} from 'angular2/src/core/change_detection/change_detection';
import {Compiler, Compiler_} from 'angular2/src/core/linker/compiler';
import {Basic} from './basic';

const ANCHOR_ELEMENT = CONST_EXPR(new OpaqueToken('AnchorElement'));

export function main() {
  describe('integration tests', function() {

    beforeEachProviders(() => [
      provide(ANCHOR_ELEMENT, {useValue: el('<div></div>')}),
      provide(ChangeDetectorGenConfig, {useValue: new ChangeDetectorGenConfig(true, false, false)}),
      // Disable JIT compilation to prevent the test passing without offline compilation
      provide(Compiler, {useClass: Compiler_}),
    ]);

    describe('compile template', function() {
      it('should consume text node changes',
         inject([TestComponentBuilder, AsyncTestCompleter],
                (tcb: TestComponentBuilder, async, resolver) => {
                  tcb.createAsync(Basic).then((fixture) => {
                    fixture.debugElement.componentInstance.ctxProp = 'Hello World!';

                    fixture.detectChanges();
                    expect(fixture.debugElement.nativeElement).toHaveText('Hello World!');
                    async.done();
                  });
                }));
    });
  });
}
