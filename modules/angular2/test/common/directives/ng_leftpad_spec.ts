import {
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEachProviders,
  describe,
  expect,
  inject,
  it,
} from 'angular2/testing_internal';
import {XHR} from 'angular2/src/compiler/xhr';
import {MockXHR} from 'angular2/src/compiler/xhr_mock';

import {DOM} from 'angular2/src/platform/dom/dom_adapter';

import {Component} from 'angular2/core';
import {NgLeftPad} from '../../../src/common/directives/ng_leftpad';
import {TEST_PROVIDERS} from '../../compiler/test_bindings';

export function main() {
  beforeEachProviders(() => TEST_PROVIDERS);

  describe('ngLeftPad directive', () => {
    it('should work',
      inject([TestComponentBuilder, AsyncTestCompleter, XHR],
        (tcb: TestComponentBuilder, async, xhr: MockXHR) => {
        var html = '<div><copy-me template="ngLeftPad">hello</copy-me></div>';
        xhr.expect('https://api.left-pad.io/?str=hello&len=30&ch=@', '12345');

        tcb.overrideTemplate(TestComponent, html)
          .createAsync(TestComponent)
          .then((fixture) => {
            fixture.detectChanges();
            xhr.flush();

            expect(DOM.querySelector(fixture.debugElement.nativeElement, 'copy-me'))
              .toHaveText('12345');
            async.done();
          });
      }));
  });
}


@Component({selector: 'test-cmp', directives: [NgLeftPad], template: ''})
class TestComponent {
  length = 30;
  padChar = '@';
}
