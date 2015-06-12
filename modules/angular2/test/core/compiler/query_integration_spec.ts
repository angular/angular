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

import {TestBed} from 'angular2/src/test_lib/test_bed';

import {Injectable, Optional} from 'angular2/di';
import {QueryList} from 'angular2/core';
import {Query, Component, Directive, View} from 'angular2/annotations';

import {NgIf, NgFor} from 'angular2/angular2';
import {ListWrapper} from 'angular2/src/facade/collection';

import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

export function main() {
  BrowserDomAdapter.makeCurrent();
  describe('Query API', () => {

    it('should contain all direct child directives in the light dom',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div text="1"></div>' +
                        '<needs-query text="2"><div text="3">' +
                        '<div text="too-deep"></div>' +
                        '</div></needs-query>' +
                        '<div text="4"></div>';

         tb.createView(MyComp, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('2|3|');

               async.done();
             });
       }));

    it('should contain all directives in the light dom when descendants flag is used',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div text="1"></div>' +
                        '<needs-query-desc text="2"><div text="3">' +
                        '<div text="4"></div>' +
                        '</div></needs-query-desc>' +
                        '<div text="5"></div>';

         tb.createView(MyComp, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('2|3|4|');

               async.done();
             });
       }));

    it('should contain all directives in the light dom',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div text="1"></div>' +
                        '<needs-query text="2"><div text="3"></div></needs-query>' +
                        '<div text="4"></div>';

         tb.createView(MyComp, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('2|3|');

               async.done();
             });
       }));

    // TODO(rado): The test below should be using descendants: false,
    // but due to a bug with how injectors are hooked up query considers the
    // directives to be distances 2 instead of direct children.
    it('should reflect dynamically inserted directives',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template =
             '<div text="1"></div>' +
             '<needs-query-desc text="2"><div *ng-if="shouldShow" [text]="\'3\'"></div></needs-query-desc>' +
             '<div text="4"></div>';

         tb.createView(MyComp, {html: template})
             .then((view) => {

               view.detectChanges();
               expect(view.rootNodes).toHaveText('2|');

               view.context.shouldShow = true;
               view.detectChanges();
               expect(view.rootNodes).toHaveText('2|3|');

               async.done();
             });
       }));

    it('should reflect moved directives',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template =
             '<div text="1"></div>' +
             '<needs-query-desc text="2"><div *ng-for="var i of list" [text]="i"></div></needs-query-desc>' +
             '<div text="4"></div>';

         tb.createView(MyComp, {html: template})
             .then((view) => {
               view.detectChanges();
               view.detectChanges();

               expect(view.rootNodes).toHaveText('2|1d|2d|3d|');

               view.context.list = ['3d', '2d'];
               view.detectChanges();
               view.detectChanges();
               expect(view.rootNodes).toHaveText('2|3d|2d|');

               async.done();
             });
       }));


    it('should notify query on change',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<needs-query-desc #q>' +
                        '<div text="1"></div>' +
                        '<div *ng-if="shouldShow" text="2"></div>' +
                        '</needs-query-desc>';

         tb.createView(MyComp, {html: template})
             .then((view) => {
               var q = view.rawView.locals.get("q");
               view.detectChanges();

               q.query.onChange(() => {
                 expect(q.query.first.text).toEqual("1");
                 expect(q.query.last.text).toEqual("2");
                 async.done();
               });

               view.context.shouldShow = true;
               view.detectChanges();
             });
       }));

    it("should notify child's query before notifying parent's query",
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<needs-query-desc #q1>' +
                        '<needs-query-desc #q2>' +
                        '<div text="1"></div>' +
                        '</needs-query-desc>' +
                        '</needs-query-desc>';

         tb.createView(MyComp, {html: template})
             .then((view) => {
               var q1 = view.rawView.locals.get("q1");
               var q2 = view.rawView.locals.get("q2");

               var firedQ2 = false;

               q2.query.onChange(() => { firedQ2 = true; });
               q1.query.onChange(() => {
                 expect(firedQ2).toBe(true);
                 async.done();
               });

               view.detectChanges();
             });
       }));
  });
}

@Directive({selector: '[text]', properties: ['text']})
@Injectable()
class TextDirective {
  text: string;
  constructor() {}
}

@Component({selector: 'needs-query'})
@View({directives: [NgFor], template: '<div *ng-for="var dir of query">{{dir.text}}|</div>'})
@Injectable()
class NeedsQuery {
  query: QueryList<TextDirective>;
  constructor(@Query(TextDirective) query: QueryList<TextDirective>) { this.query = query; }
}

@Component({selector: 'needs-query-desc'})
@View({directives: [NgFor], template: '<div *ng-for="var dir of query">{{dir.text}}|</div>'})
@Injectable()
class NeedsQueryDesc {
  query: QueryList<TextDirective>;
  constructor(@Query(TextDirective, {descendants: true}) query: QueryList<TextDirective>) {
    this.query = query;
  }
}

@Component({selector: 'my-comp'})
@View({directives: [NeedsQuery, NeedsQueryDesc, TextDirective, NgIf, NgFor]})
@Injectable()
class MyComp {
  shouldShow: boolean;
  list;
  constructor() {
    this.shouldShow = false;
    this.list = ['1d', '2d', '3d'];
  }
}
