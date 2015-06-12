import {
  AsyncTestCompleter,
  beforeEach,
  beforeEachBindings,
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
import {ListWrapper} from 'angular2/src/facade/collection';

import {Component, View} from 'angular2/angular2';

import {NgFor} from 'angular2/src/directives/ng_for';

import {TestBed} from 'angular2/src/test_lib/test_bed';


export function main() {
  describe('ng-for', () => {
    var TEMPLATE =
        '<div><copy-me template="ng-for #item of items">{{item.toString()}};</copy-me></div>';

    it('should reflect initial elements',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         tb.createView(TestComponent, {html: TEMPLATE})
             .then((view) => {
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('1;2;');
               async.done();
             });
       }));

    it('should reflect added elements',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         tb.createView(TestComponent, {html: TEMPLATE})
             .then((view) => {
               view.detectChanges();

               ListWrapper.push(view.context.items, 3);
               view.detectChanges();

               expect(DOM.getText(view.rootNodes[0])).toEqual('1;2;3;');
               async.done();
             });
       }));

    it('should reflect removed elements',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         tb.createView(TestComponent, {html: TEMPLATE})
             .then((view) => {
               view.detectChanges();

               ListWrapper.removeAt(view.context.items, 1);
               view.detectChanges();

               expect(DOM.getText(view.rootNodes[0])).toEqual('1;');
               async.done();
             });
       }));

    it('should reflect moved elements',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         tb.createView(TestComponent, {html: TEMPLATE})
             .then((view) => {
               view.detectChanges();

               ListWrapper.removeAt(view.context.items, 0);
               ListWrapper.push(view.context.items, 1);
               view.detectChanges();

               expect(DOM.getText(view.rootNodes[0])).toEqual('2;1;');
               async.done();
             });
       }));

    it('should reflect a mix of all changes (additions/removals/moves)',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         tb.createView(TestComponent, {html: TEMPLATE})
             .then((view) => {
               view.context.items = [0, 1, 2, 3, 4, 5];
               view.detectChanges();

               view.context.items = [6, 2, 7, 0, 4, 8];
               view.detectChanges();

               expect(DOM.getText(view.rootNodes[0])).toEqual('6;2;7;0;4;8;');
               async.done();
             });
       }));

    it('should iterate over an array of objects',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<ul><li template="ng-for #item of items">{{item["name"]}};</li></ul>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {

               // INIT
               view.context.items = [{'name': 'misko'}, {'name': 'shyam'}];
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('misko;shyam;');

               // GROW
               ListWrapper.push(view.context.items, {'name': 'adam'});
               view.detectChanges();

               expect(DOM.getText(view.rootNodes[0])).toEqual('misko;shyam;adam;');

               // SHRINK
               ListWrapper.removeAt(view.context.items, 2);
               ListWrapper.removeAt(view.context.items, 0);
               view.detectChanges();

               expect(DOM.getText(view.rootNodes[0])).toEqual('shyam;');
               async.done();
             });
       }));

    it('should gracefully handle nulls',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<ul><li template="ng-for #item of null">{{item}};</li></ul>';
         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('');
               async.done();
             });
       }));

    it('should gracefully handle ref changing to null and back',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         tb.createView(TestComponent, {html: TEMPLATE})
             .then((view) => {
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('1;2;');

               view.context.items = null;
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('');

               view.context.items = [1, 2, 3];
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('1;2;3;');
               async.done();
             });
       }));

    it('should throw on ref changing to string',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         tb.createView(TestComponent, {html: TEMPLATE})
             .then((view) => {
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('1;2;');

               view.context.items = 'whaaa';
               expect(() => view.detectChanges()).toThrowError();
               async.done();
             });
       }));

    it('should works with duplicates',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         tb.createView(TestComponent, {html: TEMPLATE})
             .then((view) => {
               var a = new Foo();
               view.context.items = [a, a];
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('foo;foo;');
               async.done();
             });
       }));

    it('should repeat over nested arrays',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div>' +
                        '<div template="ng-for #item of items">' +
                        '<div template="ng-for #subitem of item">' +
                        '{{subitem}}-{{item.length}};' +
                        '</div>|' +
                        '</div>' +
                        '</div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.context.items = [['a', 'b'], ['c']];
               view.detectChanges();
               view.detectChanges();
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('a-2;b-2;|c-1;|');

               view.context.items = [['e'], ['f', 'g']];
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('e-1;|f-2;g-2;|');

               async.done();
             });
       }));

    it('should repeat over nested arrays with no intermediate element',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div><template [ng-for] #item [ng-for-of]="items">' +
                        '<div template="ng-for #subitem of item">' +
                        '{{subitem}}-{{item.length}};' +
                        '</div></template></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.context.items = [['a', 'b'], ['c']];
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('a-2;b-2;c-1;');

               view.context.items = [['e'], ['f', 'g']];
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('e-1;f-2;g-2;');
               async.done();
             });
       }));

    it('should display indices correctly',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template =
             '<div><copy-me template="ng-for: var item of items; var i=index">{{i.toString()}}</copy-me></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.context.items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('0123456789');

               view.context.items = [1, 2, 6, 7, 4, 3, 5, 8, 9, 0];
               view.detectChanges();
               expect(DOM.getText(view.rootNodes[0])).toEqual('0123456789');
               async.done();
             });
       }));

  });
}

class Foo {
  toString() { return 'foo'; }
}

@Component({selector: 'test-cmp'})
@View({directives: [NgFor]})
class TestComponent {
  items: any;
  constructor() { this.items = [1, 2]; }
}
