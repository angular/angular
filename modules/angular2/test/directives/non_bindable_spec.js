import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/test_lib';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {Decorator, Component} from 'angular2/src/core/annotations/annotations';
import {Template} from 'angular2/src/core/annotations/template';

import {NgElement} from 'angular2/src/core/compiler/ng_element';

import {NonBindable} from 'angular2/src/directives/non_bindable';

import {TestBed} from 'angular2/src/test_lib/test_bed';

export function main() {
  describe('non-bindable', () => {
    it('should not interpolate children', inject([TestBed, AsyncTestCompleter], (tb, async) => {
      var template = '<div>{{text}}<span non-bindable>{{text}}</span></div>';
      tb.createView(TestComponent, {html: template}).then((view) => {
        view.detectChanges();
        expect(DOM.getText(view.rootNodes[0])).toEqual('foo{{text}}');
        async.done();
      });
    }));

    it('should ignore directives on child nodes', inject([TestBed, AsyncTestCompleter], (tb, async) => {
      var template = '<div non-bindable><span id=child test-dec>{{text}}</span></div>';
      tb.createView(TestComponent, {html: template}).then((view) => {
        view.detectChanges();
        var span = DOM.querySelector(view.rootNodes[0], '#child');
        expect(DOM.hasClass(span, 'compiled')).toBeFalsy();
        async.done();
      });
    }));

    it('should trigger directives on the same node', inject([TestBed, AsyncTestCompleter], (tb, async) => {
      var template = '<div><span id=child non-bindable test-dec>{{text}}</span></div>';
      tb.createView(TestComponent, {html: template}).then((view) => {
        view.detectChanges();
        var span = DOM.querySelector(view.rootNodes[0], '#child');
        expect(DOM.hasClass(span, 'compiled')).toBeTruthy();
        async.done();
      });
    }));
  })
}

@Component({selector: 'test-cmp'})
@Template({directives: [NonBindable, TestDecorator]})
class TestComponent {
  text: string;
  constructor() {
    this.text = 'foo';
  }
}

@Decorator({
  selector: '[test-dec]'
})
class TestDecorator {
  constructor(el: NgElement) {
    DOM.addClass(el.domElement, 'compiled');
  }
}
