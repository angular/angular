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

import {Injectable} from 'angular2/di';
import {QueryList} from 'angular2/core';
import {Query, Component, Directive, View} from 'angular2/annotations';

import {NgIf, NgFor} from 'angular2/angular2';

import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

export function main() {
  BrowserDomAdapter.makeCurrent();
  describe('Query API', () => {

    it('should contain all directives in the light dom',
       inject([TestBed, AsyncTestCompleter], (tb, async) => {
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

    it('should reflect dynamically inserted directives',
       inject([TestBed, AsyncTestCompleter], (tb, async) => {
         var template =
             '<div text="1"></div>' +
             '<needs-query text="2"><div *ng-if="shouldShow" [text]="\'3\'"></div></needs-query>' +
             '<div text="4"></div>';

         tb.createView(MyComp, {html: template})
             .then((view) => {

               view.detectChanges();
               expect(view.rootNodes).toHaveText('2|');

               view.context.shouldShow = true;
               view.detectChanges();
               // TODO(rado): figure out why the second tick is necessary.
               view.detectChanges();
               expect(view.rootNodes).toHaveText('2|3|');

               async.done();
             });
       }));

    it('should reflect moved directives', inject([TestBed, AsyncTestCompleter], (tb, async) => {
         var template =
             '<div text="1"></div>' +
             '<needs-query text="2"><div *ng-for="var i of list" [text]="i"></div></needs-query>' +
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
  });
}

@Directive({selector: '[text]', properties: {'text': 'text'}})
@Injectable()
class TextDirective {
  text: string;
  constructor() {}
}

@Component({selector: 'needs-query'})
@View({directives: [NgFor], template: '<div *ng-for="var dir of query">{{dir.text}}|</div>'})
@Injectable()
class NeedsQuery {
  query: QueryList;
  constructor(@Query(TextDirective) query: QueryList) { this.query = query; }
}

var _constructiontext = 0;

@Component({selector: 'my-comp'})
@View({directives: [NeedsQuery, TextDirective, NgIf, NgFor]})
@Injectable()
class MyComp {
  shouldShow: boolean;
  list;
  constructor() {
    this.shouldShow = false;
    this.list = ['1d', '2d', '3d'];
  }
}
