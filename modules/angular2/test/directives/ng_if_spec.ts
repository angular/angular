import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  IS_DARTIUM,
  it,
  xit,
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {TestBed} from 'angular2/src/test_lib/test_bed';

import {Component, View} from 'angular2/angular2';

import {NgIf} from 'angular2/src/directives/ng_if';

export function main() {
  describe('if directive', () => {
    it('should work in a template attribute',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var html = '<div><copy-me template="ng-if booleanCondition">hello</copy-me></div>';

         tb.createView(TestComponent, {html: html})
             .then((view) => {
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(1);
               expect(DOM.getText(view.rootNodes[0])).toEqual('hello');
               async.done();
             });
       }));

    it('should work in a template element',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var html =
             '<div><template [ng-if]="booleanCondition"><copy-me>hello2</copy-me></template></div>';

         tb.createView(TestComponent, {html: html})
             .then((view) => {
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(1);
               expect(DOM.getText(view.rootNodes[0])).toEqual('hello2');
               async.done();
             });
       }));

    it('should toggle node when condition changes',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var html = '<div><copy-me template="ng-if booleanCondition">hello</copy-me></div>';

         tb.createView(TestComponent, {html: html})
             .then((view) => {
               view.context.booleanCondition = false;
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(0);
               expect(DOM.getText(view.rootNodes[0])).toEqual('');

               view.context.booleanCondition = true;
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(1);
               expect(DOM.getText(view.rootNodes[0])).toEqual('hello');

               view.context.booleanCondition = false;
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(0);
               expect(DOM.getText(view.rootNodes[0])).toEqual('');

               async.done();
             });
       }));

    it('should handle nested if correctly',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var html =
             '<div><template [ng-if]="booleanCondition"><copy-me *ng-if="nestedBooleanCondition">hello</copy-me></template></div>';

         tb.createView(TestComponent, {html: html})
             .then((view) => {
               view.context.booleanCondition = false;
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(0);
               expect(DOM.getText(view.rootNodes[0])).toEqual('');

               view.context.booleanCondition = true;
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(1);
               expect(DOM.getText(view.rootNodes[0])).toEqual('hello');

               view.context.nestedBooleanCondition = false;
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(0);
               expect(DOM.getText(view.rootNodes[0])).toEqual('');

               view.context.nestedBooleanCondition = true;
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(1);
               expect(DOM.getText(view.rootNodes[0])).toEqual('hello');

               view.context.booleanCondition = false;
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(0);
               expect(DOM.getText(view.rootNodes[0])).toEqual('');

               async.done();
             });
       }));

    it('should update several nodes with if',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var html =
             '<div>' +
             '<copy-me template="ng-if numberCondition + 1 >= 2">helloNumber</copy-me>' +
             '<copy-me template="ng-if stringCondition == \'foo\'">helloString</copy-me>' +
             '<copy-me template="ng-if functionCondition(stringCondition, numberCondition)">helloFunction</copy-me>' +
             '</div>';

         tb.createView(TestComponent, {html: html})
             .then((view) => {
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(3);
               expect(DOM.getText(view.rootNodes[0]))
                   .toEqual('helloNumberhelloStringhelloFunction');

               view.context.numberCondition = 0;
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(1);
               expect(DOM.getText(view.rootNodes[0])).toEqual('helloString');

               view.context.numberCondition = 1;
               view.context.stringCondition = "bar";
               view.detectChanges();
               expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(1);
               expect(DOM.getText(view.rootNodes[0])).toEqual('helloNumber');
               async.done();
             });
       }));


    if (!IS_DARTIUM) {
      it('should not add the element twice if the condition goes from true to true (JS)',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var html = '<div><copy-me template="ng-if numberCondition">hello</copy-me></div>';

           tb.createView(TestComponent, {html: html})
               .then((view) => {
                 view.detectChanges();
                 expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(1);
                 expect(DOM.getText(view.rootNodes[0])).toEqual('hello');

                 view.context.numberCondition = 2;
                 view.detectChanges();
                 expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(1);
                 expect(DOM.getText(view.rootNodes[0])).toEqual('hello');

                 async.done();
               });
         }));

      it('should not recreate the element if the condition goes from true to true (JS)',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var html = '<div><copy-me template="ng-if numberCondition">hello</copy-me></div>';

           tb.createView(TestComponent, {html: html})
               .then((view) => {
                 view.detectChanges();
                 DOM.addClass(view.rootNodes[0].childNodes[1], "foo");

                 view.context.numberCondition = 2;
                 view.detectChanges();
                 expect(DOM.hasClass(view.rootNodes[0].childNodes[1], "foo")).toBe(true);

                 async.done();
               });
         }));
    }

    if (IS_DARTIUM) {
      it('should not create the element if the condition is not a boolean (DART)',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var html = '<div><copy-me template="ng-if numberCondition">hello</copy-me></div>';

           tb.createView(TestComponent, {html: html})
               .then((view) => {
                 expect(() => view.detectChanges()).toThrowError();
                 expect(DOM.querySelectorAll(view.rootNodes[0], 'copy-me').length).toEqual(0);
                 expect(DOM.getText(view.rootNodes[0])).toEqual('');
                 async.done();
               });
         }));
    }

  });
}

@Component({selector: 'test-cmp'})
@View({directives: [NgIf]})
class TestComponent {
  booleanCondition: boolean;
  nestedBooleanCondition: boolean;
  numberCondition: number;
  stringCondition: string;
  functionCondition: Function;
  constructor() {
    this.booleanCondition = true;
    this.nestedBooleanCondition = true;
    this.numberCondition = 1;
    this.stringCondition = "foo";
    this.functionCondition = function(s, n) { return s == "foo" && n == 1; };
  }
}
