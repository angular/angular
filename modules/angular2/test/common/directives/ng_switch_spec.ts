import {
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/testing_internal';

import {Component} from 'angular2/core';

import {NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/src/common/directives/ng_switch';

export function main() {
  describe('switch', () => {
    describe('switch value changes', () => {
      it('should switch amongst when values',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div>' +
                          '<ul [ngSwitch]="switchValue">' +
                          '<template ngSwitchWhen="a"><li>when a</li></template>' +
                          '<template ngSwitchWhen="b"><li>when b</li></template>' +
                          '</ul></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('');

                 fixture.debugElement.componentInstance.switchValue = 'a';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when a');

                 fixture.debugElement.componentInstance.switchValue = 'b';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when b');

                 async.done();
               });
         }));

      it('should switch amongst when values with fallback to default',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div>' +
                          '<ul [ngSwitch]="switchValue">' +
                          '<li template="ngSwitchWhen \'a\'">when a</li>' +
                          '<li template="ngSwitchDefault">when default</li>' +
                          '</ul></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when default');

                 fixture.debugElement.componentInstance.switchValue = 'a';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when a');

                 fixture.debugElement.componentInstance.switchValue = 'b';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when default');

                 async.done();
               });
         }));

      it('should support multiple whens with the same value',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div>' +
                          '<ul [ngSwitch]="switchValue">' +
                          '<template ngSwitchWhen="a"><li>when a1;</li></template>' +
                          '<template ngSwitchWhen="b"><li>when b1;</li></template>' +
                          '<template ngSwitchWhen="a"><li>when a2;</li></template>' +
                          '<template ngSwitchWhen="b"><li>when b2;</li></template>' +
                          '<template ngSwitchDefault><li>when default1;</li></template>' +
                          '<template ngSwitchDefault><li>when default2;</li></template>' +
                          '</ul></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement)
                     .toHaveText('when default1;when default2;');

                 fixture.debugElement.componentInstance.switchValue = 'a';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when a1;when a2;');

                 fixture.debugElement.componentInstance.switchValue = 'b';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when b1;when b2;');

                 async.done();
               });
         }));
    });

    describe('when values changes', () => {
      it('should switch amongst when values',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div>' +
                          '<ul [ngSwitch]="switchValue">' +
                          '<template [ngSwitchWhen]="when1"><li>when 1;</li></template>' +
                          '<template [ngSwitchWhen]="when2"><li>when 2;</li></template>' +
                          '<template ngSwitchDefault><li>when default;</li></template>' +
                          '</ul></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 fixture.debugElement.componentInstance.when1 = 'a';
                 fixture.debugElement.componentInstance.when2 = 'b';
                 fixture.debugElement.componentInstance.switchValue = 'a';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when 1;');

                 fixture.debugElement.componentInstance.switchValue = 'b';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when 2;');

                 fixture.debugElement.componentInstance.switchValue = 'c';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when default;');

                 fixture.debugElement.componentInstance.when1 = 'c';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when 1;');

                 fixture.debugElement.componentInstance.when1 = 'd';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('when default;');

                 async.done();
               });
         }));
    });
  });
}

@Component(
    {selector: 'test-cmp', directives: [NgSwitch, NgSwitchWhen, NgSwitchDefault], template: ''})
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
