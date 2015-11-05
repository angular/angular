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

import {Component, View} from 'angular2/angular2';

import {NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/src/common/directives/ng_switch';

export function main() {
  describe('switch', () => {
    describe('switch value changes', () => {
      it('should switch amongst when values',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div>' +
                          '<ul [ng-switch]="switchValue">' +
                          '<template ng-switch-when="a"><li>when a</li></template>' +
                          '<template ng-switch-when="b"><li>when b</li></template>' +
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
                          '<ul [ng-switch]="switchValue">' +
                          '<li template="ng-switch-when \'a\'">when a</li>' +
                          '<li template="ng-switch-default">when default</li>' +
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
                          '<ul [ng-switch]="switchValue">' +
                          '<template ng-switch-when="a"><li>when a1;</li></template>' +
                          '<template ng-switch-when="b"><li>when b1;</li></template>' +
                          '<template ng-switch-when="a"><li>when a2;</li></template>' +
                          '<template ng-switch-when="b"><li>when b2;</li></template>' +
                          '<template ng-switch-default><li>when default1;</li></template>' +
                          '<template ng-switch-default><li>when default2;</li></template>' +
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
                          '<ul [ng-switch]="switchValue">' +
                          '<template [ng-switch-when]="when1"><li>when 1;</li></template>' +
                          '<template [ng-switch-when]="when2"><li>when 2;</li></template>' +
                          '<template ng-switch-default><li>when default;</li></template>' +
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

@Component({selector: 'test-cmp'})
@View({directives: [NgSwitch, NgSwitchWhen, NgSwitchDefault]})
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
