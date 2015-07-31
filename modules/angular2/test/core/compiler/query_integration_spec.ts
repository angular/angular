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
  TestComponentBuilder,
  asNativeElements
} from 'angular2/test_lib';


import {Injectable, Optional} from 'angular2/di';
import {QueryList} from 'angular2/core';
import {Query, ViewQuery, Component, Directive, View} from 'angular2/annotations';

import {NgIf, NgFor} from 'angular2/angular2';

import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

export function main() {
  BrowserDomAdapter.makeCurrent();
  describe('Query API', () => {

    describe("querying by directive type", () => {
      it('should contain all direct child directives in the light dom',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div text="1"></div>' +
                          '<needs-query text="2"><div text="3">' +
                          '<div text="too-deep"></div>' +
                          '</div></needs-query>' +
                          '<div text="4"></div>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();

                 expect(asNativeElements(view.componentViewChildren)).toHaveText('2|3|');

                 async.done();
               });
         }));

      it('should contain all directives in the light dom when descendants flag is used',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div text="1"></div>' +
                          '<needs-query-desc text="2"><div text="3">' +
                          '<div text="4"></div>' +
                          '</div></needs-query-desc>' +
                          '<div text="5"></div>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();
                 expect(asNativeElements(view.componentViewChildren)).toHaveText('2|3|4|');

                 async.done();
               });
         }));

      it('should contain all directives in the light dom',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div text="1"></div>' +
                          '<needs-query text="2"><div text="3"></div></needs-query>' +
                          '<div text="4"></div>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();
                 expect(asNativeElements(view.componentViewChildren)).toHaveText('2|3|');

                 async.done();
               });
         }));

      it('should reflect dynamically inserted directives',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template =
               '<div text="1"></div>' +
               '<needs-query text="2"><div *ng-if="shouldShow" [text]="\'3\'"></div></needs-query>' +
               '<div text="4"></div>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {

                 view.detectChanges();
                 expect(asNativeElements(view.componentViewChildren)).toHaveText('2|');

                 view.componentInstance.shouldShow = true;
                 view.detectChanges();
                 expect(asNativeElements(view.componentViewChildren)).toHaveText('2|3|');

                 async.done();
               });
         }));

      it('should reflect moved directives',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template =
               '<div text="1"></div>' +
               '<needs-query text="2"><div *ng-for="var i of list" [text]="i"></div></needs-query>' +
               '<div text="4"></div>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();

                 expect(asNativeElements(view.componentViewChildren)).toHaveText('2|1d|2d|3d|');

                 view.componentInstance.list = ['3d', '2d'];
                 view.detectChanges();
                 view.detectChanges();
                 expect(asNativeElements(view.componentViewChildren)).toHaveText('2|3d|2d|');

                 async.done();
               });
         }));
    });

    describe("onChange", () => {
      it('should notify query on change',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-query #q>' +
                          '<div text="1"></div>' +
                          '<div *ng-if="shouldShow" text="2"></div>' +
                          '</needs-query>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q = view.componentViewChildren[0].getLocal("q");
                 view.detectChanges();

                 q.query.onChange(() => {
                   expect(q.query.first.text).toEqual("1");
                   expect(q.query.last.text).toEqual("2");
                   async.done();
                 });

                 view.componentInstance.shouldShow = true;
                 view.detectChanges();
               });
         }));

      it("should notify child's query before notifying parent's query",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-query-desc #q1>' +
                          '<needs-query-desc #q2>' +
                          '<div text="1"></div>' +
                          '</needs-query-desc>' +
                          '</needs-query-desc>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q1 = view.componentViewChildren[0].getLocal("q1");
                 var q2 = view.componentViewChildren[0].getLocal("q2");

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

    describe("querying by var binding", () => {
      it('should contain all the child directives in the light dom with the given var binding',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template =
               '<needs-query-by-var-binding #q>' +
               '<div *ng-for="#item of list" [text]="item" #text-label="textDir"></div>' +
               '</needs-query-by-var-binding>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q = view.componentViewChildren[0].getLocal("q");

                 view.componentInstance.list = ['1d', '2d'];

                 view.detectChanges();

                 expect(q.query.first.text).toEqual("1d");
                 expect(q.query.last.text).toEqual("2d");

                 async.done();
               });
         }));

      it('should support querying by multiple var bindings',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-query-by-var-bindings #q>' +
                          '<div text="one" #text-label1="textDir"></div>' +
                          '<div text="two" #text-label2="textDir"></div>' +
                          '</needs-query-by-var-bindings>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q = view.componentViewChildren[0].getLocal("q");
                 view.detectChanges();

                 expect(q.query.first.text).toEqual("one");
                 expect(q.query.last.text).toEqual("two");

                 async.done();
               });
         }));

      it('should reflect dynamically inserted directives',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template =
               '<needs-query-by-var-binding #q>' +
               '<div *ng-for="#item of list" [text]="item" #text-label="textDir"></div>' +
               '</needs-query-by-var-binding>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q = view.componentViewChildren[0].getLocal("q");

                 view.componentInstance.list = ['1d', '2d'];

                 view.detectChanges();

                 view.componentInstance.list = ['2d', '1d'];

                 view.detectChanges();

                 expect(q.query.last.text).toEqual("1d");

                 async.done();
               });
         }));

      it('should contain all the elements in the light dom with the given var binding',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-query-by-var-binding #q>' +
                          '<div template="ng-for: #item of list">' +
                          '<div #text-label>{{item}}</div>' +
                          '</div>' +
                          '</needs-query-by-var-binding>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q = view.componentViewChildren[0].getLocal("q");

                 view.componentInstance.list = ['1d', '2d'];

                 view.detectChanges();

                 expect(q.query.first.nativeElement).toHaveText("1d");
                 expect(q.query.last.nativeElement).toHaveText("2d");

                 async.done();
               });
         }));

      it('should contain all the elements in the light dom even if they get projected',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-query-and-project #q>' +
                          '<div text="hello"></div><div text="world"></div>' +
                          '</needs-query-and-project>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();

                 expect(asNativeElements(view.componentViewChildren)).toHaveText('hello|world|');

                 async.done();
               });
         }));
    });

    describe("querying in the view", () => {
      it('should contain all the elements in the view with that have the given directive',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-query #q><div text="ignoreme"></div></needs-view-query>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q: NeedsViewQuery = view.componentViewChildren[0].getLocal("q");

                 view.detectChanges();

                 expect(q.query.map((d: TextDirective) => d.text)).toEqual(["1", "2", "3"]);

                 async.done();
               });
         }));

      it('should query descendants in the view when the flag is used',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-query-desc #q></needs-view-query-desc>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q: NeedsViewQueryDesc = view.componentViewChildren[0].getLocal("q");

                 view.detectChanges();

                 expect(q.query.map((d: TextDirective) => d.text)).toEqual(["1", "2", "3", "4"]);

                 async.done();
               });
         }));

      it('should include directive present on the host element',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-query #q text="self"></needs-view-query>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q: NeedsViewQuery = view.componentViewChildren[0].getLocal("q");

                 view.detectChanges();

                 expect(q.query.map((d: TextDirective) => d.text)).toEqual(["self", "1", "2", "3"]);

                 async.done();
               });
         }));

      it('should reflect changes in the component',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-query-if #q></needs-view-query-if>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q: NeedsViewQueryIf = view.componentViewChildren[0].getLocal("q");

                 view.detectChanges();

                 expect(q.query.length).toBe(0);

                 q.show = true;
                 view.detectChanges();

                 expect(q.query.first.text).toEqual("1");

                 async.done();
               });
         }));

      it('should not be affected by other changes in the component',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-query-nested-if #q></needs-view-query-nested-if>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q: NeedsViewQueryNestedIf = view.componentViewChildren[0].getLocal("q");

                 view.detectChanges();

                 expect(q.query.length).toEqual(1);
                 expect(q.query.first.text).toEqual("1");

                 q.show = false;
                 view.detectChanges();

                 expect(q.query.length).toEqual(1);
                 expect(q.query.first.text).toEqual("1");

                 async.done();
               });
         }));

      /* TODO(rado): fix and reenable.

      it('should maintain directives in pre-order depth-first DOM order after dynamic insertion',
        inject([TestComponentBuilder, AsyncTestCompleter], (tcb:TestComponentBuilder, async) => {
          var template = '<needs-view-query-order #q text="self"></needs-view-query-order>';

          tcb.overrideTemplate(MyComp, template)
            .createAsync(MyComp)
            .then((view) => {
              var q:NeedsViewQueryOrder = view.componentViewChildren[0].getLocal("q");

              view.detectChanges();

              expect(q.query.length).toBe(4);
              expect(q.query.first.text).toEqual("1");
              expect(q.query.first.text).toEqual("4");

              async.done();
            });
        }));*/
    });
  });
}

@Directive({selector: '[text]', properties: ['text'], exportAs: 'textDir'})
@Injectable()
class TextDirective {
  text: string;
  constructor() {}
}

@Directive({selector: '[dir]'})
@Injectable()
class InertDirective {
  constructor() {}
}

@Component({selector: 'needs-query'})
@View({
  directives: [NgFor, TextDirective],
  template: '<div text="ignoreme"></div><div *ng-for="var dir of query">{{dir.text}}|</div>'
})
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

@Component({selector: 'needs-query-by-var-binding'})
@View({directives: [], template: '<ng-content>'})
@Injectable()
class NeedsQueryByLabel {
  query: QueryList<any>;
  constructor(@Query("textLabel", {descendants: true}) query: QueryList<any>) {
    this.query = query;
  }
}

@Component({selector: 'needs-query-by-var-bindings'})
@View({directives: [], template: '<ng-content>'})
@Injectable()
class NeedsQueryByTwoLabels {
  query: QueryList<any>;
  constructor(@Query("textLabel1,textLabel2", {descendants: true}) query: QueryList<any>) {
    this.query = query;
  }
}

@Component({selector: 'needs-query-and-project'})
@View({
  directives: [NgFor],
  template: '<div *ng-for="var dir of query">{{dir.text}}|</div><ng-content></ng-content>'
})
@Injectable()
class NeedsQueryAndProject {
  query: QueryList<TextDirective>;
  constructor(@Query(TextDirective) query: QueryList<TextDirective>) { this.query = query; }
}

@Component({selector: 'needs-view-query'})
@View({
  directives: [TextDirective],
  template: '<div text="1"><div text="need descendants"></div></div>' +
                '<div text="2"></div><div text="3"></div>'
})
@Injectable()
class NeedsViewQuery {
  query: QueryList<TextDirective>;
  constructor(@ViewQuery(TextDirective) query: QueryList<TextDirective>) { this.query = query; }
}

@Component({selector: 'needs-view-query-desc'})
@View({
  directives: [TextDirective],
  template: '<div text="1"><div text="2"></div></div>' +
                '<div text="3"></div><div text="4"></div>'
})
@Injectable()
class NeedsViewQueryDesc {
  query: QueryList<TextDirective>;
  constructor(@ViewQuery(TextDirective, {descendants: true}) query: QueryList<TextDirective>) {
    this.query = query;
  }
}

@Component({selector: 'needs-view-query-if'})
@View({directives: [NgIf, TextDirective], template: '<div *ng-if="show" text="1"></div>'})
@Injectable()
class NeedsViewQueryIf {
  show: boolean;
  query: QueryList<TextDirective>;
  constructor(@ViewQuery(TextDirective) query: QueryList<TextDirective>) {
    this.query = query;
    this.show = false;
  }
}


@Component({selector: 'needs-view-query-nested-if'})
@View({
  directives: [NgIf, InertDirective, TextDirective],
  template: '<div text="1"><div *ng-if="show"><div dir></div></div></div>'
})
@Injectable()
class NeedsViewQueryNestedIf {
  show: boolean;
  query: QueryList<TextDirective>;
  constructor(@ViewQuery(TextDirective) query: QueryList<TextDirective>) {
    this.query = query;
    this.show = true;
  }
}


@Component({selector: 'needs-view-query-order'})
@View({
  directives: [NgFor, TextDirective],
  template: '<div text="1">' +
                '<div *ng-for="var i of [\'2\', \'3\']" [text]="i"></div>' +
                '<div text="4">'
})
@Injectable()
class NeedsViewQueryOrder {
  query: QueryList<TextDirective>;
  constructor(@ViewQuery(TextDirective) query: QueryList<TextDirective>) { this.query = query; }
}

@Component({selector: 'my-comp'})
@View({
  directives: [
    NeedsQuery,
    NeedsQueryDesc,
    NeedsQueryByLabel,
    NeedsQueryByTwoLabels,
    NeedsQueryAndProject,
    NeedsViewQuery,
    NeedsViewQueryDesc,
    NeedsViewQueryIf,
    NeedsViewQueryNestedIf,
    NeedsViewQueryOrder,
    TextDirective,
    InertDirective,
    NgIf,
    NgFor
  ]
})
@Injectable()
class MyComp {
  shouldShow: boolean;
  list;
  constructor() {
    this.shouldShow = false;
    this.list = ['1d', '2d', '3d'];
  }
}
