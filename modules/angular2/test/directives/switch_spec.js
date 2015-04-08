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

import {Component} from 'angular2/src/core/annotations/annotations';
import {Template} from 'angular2/src/core/annotations/template';

import {Switch, SwitchWhen, SwitchDefault} from 'angular2/src/directives/switch';

import {TestBed} from 'angular2/src/test_lib/test_bed';

export function main() {
  describe('switch', () => {
    describe('switch value changes', () => {
      it('should switch amongst when values', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        var template = '<div>' +
          '<ul [switch]="switchValue">' +
            '<template [switch-when]="\'a\'"><li>when a</li></template>' +
            '<template [switch-when]="\'b\'"><li>when b</li></template>' +
          '</ul></div>';

        tb.createView(TestComponent, {html: template}).then((view) => {
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('');

          view.context.switchValue = 'a';
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when a');

          view.context.switchValue = 'b';
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when b');

          async.done();
        });
      }));

      it('should switch amongst when values with fallback to default',
        inject([TestBed, AsyncTestCompleter], (tb, async) => {
        var template = '<div>' +
          '<ul [switch]="switchValue">' +
            '<li template="switch-when \'a\'">when a</li>' +
            '<li template="switch-default">when default</li>' +
          '</ul></div>';

        tb.createView(TestComponent, {html: template}).then((view) => {
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when default');

          view.context.switchValue = 'a';
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when a');

          view.context.switchValue = 'b';
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when default');

          async.done();
        });
      }));

      it('should support multiple whens with the same value',
        inject([TestBed, AsyncTestCompleter], (tb, async) => {
        var template = '<div>' +
          '<ul [switch]="switchValue">' +
            '<template [switch-when]="\'a\'"><li>when a1;</li></template>' +
            '<template [switch-when]="\'b\'"><li>when b1;</li></template>' +
            '<template [switch-when]="\'a\'"><li>when a2;</li></template>' +
            '<template [switch-when]="\'b\'"><li>when b2;</li></template>' +
            '<template [switch-default]><li>when default1;</li></template>' +
            '<template [switch-default]><li>when default2;</li></template>' +
          '</ul></div>';

        tb.createView(TestComponent, {html: template}).then((view) => {
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when default1;when default2;');

          view.context.switchValue = 'a';
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when a1;when a2;');

          view.context.switchValue = 'b';
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when b1;when b2;');

          async.done();
        });
      }));
    });

    describe('when values changes', () => {
      it('should switch amongst when values',
        inject([TestBed, AsyncTestCompleter], (tb, async) => {
        var template = '<div>' +
          '<ul [switch]="switchValue">' +
            '<template [switch-when]="when1"><li>when 1;</li></template>' +
            '<template [switch-when]="when2"><li>when 2;</li></template>' +
            '<template [switch-default]><li>when default;</li></template>' +
          '</ul></div>';

        tb.createView(TestComponent, {html: template}).then((view) => {
          view.context.when1 = 'a';
          view.context.when2 = 'b';
          view.context.switchValue = 'a';
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when 1;');

          view.context.switchValue = 'b';
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when 2;');

          view.context.switchValue = 'c';
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when default;');

          view.context.when1 = 'c';
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when 1;');

          view.context.when1 = 'd';
          view.detectChanges();
          expect(DOM.getText(view.rootNodes[0])).toEqual('when default;');

          async.done();
        });
      }));
    });
  });
}

@Component({selector: 'test-cmp'})
@Template({directives: [Switch, SwitchWhen, SwitchDefault]})
class TestComponent {
  switchValue: any;
  when1: any;
  when2: any;

  constructor() {
    this.switchValue = null;
    this.when1 = null;
    this.when2 = null;
  }
}
