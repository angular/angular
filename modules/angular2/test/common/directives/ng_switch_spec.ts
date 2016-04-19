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

import {NgSwitch, NgSwitchCase, NgSwitchDefault} from 'angular2/src/common/directives/ng_switch';

export function main() {
  describe('switch', () => {
    describe('switch value changes', () => {
      it('should switch amongst case values',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div>' +
                          '<ul [ngSwitch]="switchValue">' +
                          '<template ngSwitchCase="a"><li>case a</li></template>' +
                          '<template ngSwitchCase="b"><li>case b</li></template>' +
                          '</ul></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('');

                 fixture.debugElement.componentInstance.switchValue = 'a';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case a');

                 fixture.debugElement.componentInstance.switchValue = 'b';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case b');

                 async.done();
               });
         }));

      it('should switch amongst case values with fallback to default',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div>' +
                          '<ul [ngSwitch]="switchValue">' +
                          '<li template="ngSwitchCase \'a\'">case a</li>' +
                          '<li template="ngSwitchDefault">case default</li>' +
                          '</ul></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case default');

                 fixture.debugElement.componentInstance.switchValue = 'a';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case a');

                 fixture.debugElement.componentInstance.switchValue = 'b';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case default');

                 async.done();
               });
         }));

      it('should support multiple cases with the same value',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div>' +
                          '<ul [ngSwitch]="switchValue">' +
                          '<template ngSwitchCase="a"><li>case a1;</li></template>' +
                          '<template ngSwitchCase="b"><li>case b1;</li></template>' +
                          '<template ngSwitchCase="a"><li>case a2;</li></template>' +
                          '<template ngSwitchCase="b"><li>case b2;</li></template>' +
                          '<template ngSwitchDefault><li>case default1;</li></template>' +
                          '<template ngSwitchDefault><li>case default2;</li></template>' +
                          '</ul></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement)
                     .toHaveText('case default1;case default2;');

                 fixture.debugElement.componentInstance.switchValue = 'a';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case a1;case a2;');

                 fixture.debugElement.componentInstance.switchValue = 'b';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case b1;case b2;');

                 async.done();
               });
         }));
    });

    describe('case values changes', () => {
      it('should switch amongst case values',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div>' +
                          '<ul [ngSwitch]="switchValue">' +
                          '<template [ngSwitchCase]="case1"><li>case 1;</li></template>' +
                          '<template [ngSwitchCase]="case2"><li>case 2;</li></template>' +
                          '<template ngSwitchDefault><li>case default;</li></template>' +
                          '</ul></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 fixture.debugElement.componentInstance.case1 = 'a';
                 fixture.debugElement.componentInstance.case2 = 'b';
                 fixture.debugElement.componentInstance.switchValue = 'a';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case 1;');

                 fixture.debugElement.componentInstance.switchValue = 'b';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case 2;');

                 fixture.debugElement.componentInstance.switchValue = 'c';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case default;');

                 fixture.debugElement.componentInstance.case1 = 'c';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case 1;');

                 fixture.debugElement.componentInstance.case1 = 'd';
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement).toHaveText('case default;');

                 async.done();
               });
         }));
    });
  });
}

@Component(
    {selector: 'test-cmp', directives: [NgSwitch, NgSwitchCase, NgSwitchDefault], template: ''})
class TestComponent {
  switchValue: any;
  case1: any;
  case2: any;

  constructor() {
    this.switchValue = null;
    this.case1 = null;
    this.case2 = null;
  }
}
