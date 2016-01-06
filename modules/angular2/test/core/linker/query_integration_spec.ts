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
} from 'angular2/testing_internal';

import {isPresent} from 'angular2/src/facade/lang';
import {ObservableWrapper} from 'angular2/src/facade/async';

import {
  Component,
  Directive,
  Injectable,
  Optional,
  TemplateRef,
  Query,
  QueryList,
  ViewQuery,
  ContentChildren,
  ViewChildren,
  ContentChild,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  AfterContentChecked,
  AfterViewChecked
} from 'angular2/core';
import {NgIf, NgFor} from 'angular2/common';
import {asNativeElements, ViewContainerRef} from 'angular2/core';

export function main() {
  describe('Query API', () => {
    describe("querying by directive type", () => {
      it('should contain all direct child directives in the light dom (constructor)',
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

                 expect(asNativeElements(view.debugElement.children)).toHaveText('2|3|');

                 async.done();
               });
         }));

      it('should contain all direct child directives in the content dom',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template =
               '<needs-content-children #q><div text="foo"></div></needs-content-children>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();

                 var q = view.debugElement.children[0].getLocal('q');

                 view.detectChanges();

                 expect(q.textDirChildren.length).toEqual(1);
                 expect(q.numberOfChildrenAfterContentInit).toEqual(1);

                 async.done();
               });
         }));

      it('should contain the first content child',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template =
               '<needs-content-child #q><div *ngIf="shouldShow" text="foo"></div></needs-content-child>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.debugElement.componentInstance.shouldShow = true;
                 view.detectChanges();

                 var q = view.debugElement.children[0].getLocal('q');

                 expect(q.log).toEqual([["setter", "foo"], ["init", "foo"], ["check", "foo"]]);

                 view.debugElement.componentInstance.shouldShow = false;
                 view.detectChanges();

                 expect(q.log).toEqual([
                   ["setter", "foo"],
                   ["init", "foo"],
                   ["check", "foo"],
                   ["setter", null],
                   ["check", null]
                 ]);

                 async.done();
               });
         }));

      it('should contain the first view child',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-child #q></needs-view-child>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();
                 var q = view.debugElement.children[0].getLocal('q');

                 expect(q.log).toEqual([["setter", "foo"], ["init", "foo"], ["check", "foo"]]);

                 q.shouldShow = false;
                 view.detectChanges();

                 expect(q.log).toEqual([
                   ["setter", "foo"],
                   ["init", "foo"],
                   ["check", "foo"],
                   ["setter", null],
                   ["check", null]
                 ]);

                 async.done();
               });
         }));

      it('should contain the first view child accross embedded views',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-child #q></needs-view-child>';
           tcb.overrideTemplate(MyComp, template)
               .overrideTemplate(
                   NeedsViewChild,
                   '<div *ngIf="true"><div *ngIf="shouldShow" text="foo"></div></div><div *ngIf="shouldShow2" text="bar"></div>')
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();
                 var q = view.debugElement.children[0].getLocal('q');

                 expect(q.log).toEqual([["setter", "foo"], ["init", "foo"], ["check", "foo"]]);

                 q.shouldShow = false;
                 q.shouldShow2 = true;
                 q.log = [];
                 view.detectChanges();

                 expect(q.log).toEqual([["setter", "bar"], ["check", "bar"]]);

                 q.shouldShow = false;
                 q.shouldShow2 = false;
                 q.log = [];
                 view.detectChanges();

                 expect(q.log).toEqual([["setter", null], ["check", null]]);

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
                 expect(asNativeElements(view.debugElement.children)).toHaveText('2|3|4|');

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
                 expect(asNativeElements(view.debugElement.children)).toHaveText('2|3|');

                 async.done();
               });
         }));

      it('should reflect dynamically inserted directives',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template =
               '<div text="1"></div>' +
               '<needs-query text="2"><div *ngIf="shouldShow" [text]="\'3\'"></div></needs-query>' +
               '<div text="4"></div>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {

                 view.detectChanges();
                 expect(asNativeElements(view.debugElement.children)).toHaveText('2|');

                 view.debugElement.componentInstance.shouldShow = true;
                 view.detectChanges();
                 expect(asNativeElements(view.debugElement.children)).toHaveText('2|3|');

                 async.done();
               });
         }));

      it('should be cleanly destroyed when a query crosses view boundaries',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template =
               '<div text="1"></div>' +
               '<needs-query text="2"><div *ngIf="shouldShow" [text]="\'3\'"></div></needs-query>' +
               '<div text="4"></div>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((fixture) => {
                 fixture.debugElement.componentInstance.shouldShow = true;
                 fixture.detectChanges();
                 fixture.destroy();

                 async.done();
               });
         }));

      it('should reflect moved directives',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template =
               '<div text="1"></div>' +
               '<needs-query text="2"><div *ngFor="var i of list" [text]="i"></div></needs-query>' +
               '<div text="4"></div>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();

                 expect(asNativeElements(view.debugElement.children)).toHaveText('2|1d|2d|3d|');

                 view.debugElement.componentInstance.list = ['3d', '2d'];
                 view.detectChanges();
                 expect(asNativeElements(view.debugElement.children)).toHaveText('2|3d|2d|');

                 async.done();
               });
         }));
    });

    describe('query for TemplateRef', () => {
      it('should find TemplateRefs in the light and shadow dom',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-tpl><template var-x="light"></template></needs-tpl>';
           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();
                 var needsTpl: NeedsTpl = view.debugElement.children[0].inject(NeedsTpl);

                 expect(needsTpl.vc.createEmbeddedView(needsTpl.query.first).hasLocal('light'))
                     .toBe(true);
                 expect(needsTpl.vc.createEmbeddedView(needsTpl.viewQuery.first).hasLocal('shadow'))
                     .toBe(true);

                 async.done();
               });
         }));

    });

    describe("changes", () => {
      it('should notify query on change',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-query #q>' +
                          '<div text="1"></div>' +
                          '<div *ngIf="shouldShow" text="2"></div>' +
                          '</needs-query>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q = view.debugElement.children[0].getLocal("q");
                 view.detectChanges();

                 ObservableWrapper.subscribe(q.query.changes, (_) => {
                   expect(q.query.first.text).toEqual("1");
                   expect(q.query.last.text).toEqual("2");
                   async.done();
                 });

                 view.debugElement.componentInstance.shouldShow = true;
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
                 var q1 = view.debugElement.children[0].getLocal("q1");
                 var q2 = view.debugElement.children[0].getLocal("q2");

                 var firedQ2 = false;

                 ObservableWrapper.subscribe(q2.query.changes, (_) => { firedQ2 = true; });
                 ObservableWrapper.subscribe(q1.query.changes, (_) => {
                   expect(firedQ2).toBe(true);
                   async.done();
                 });

                 view.detectChanges();
               });
         }));

      it('should correctly clean-up when destroyed together with the directives it is querying',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-query #q *ngIf="shouldShow"><div text="foo"></div></needs-query>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.debugElement.componentInstance.shouldShow = true;
                 view.detectChanges();

                 var q: NeedsQuery = view.debugElement.children[0].getLocal('q');

                 expect(q.query.length).toEqual(1);

                 view.debugElement.componentInstance.shouldShow = false;
                 view.detectChanges();

                 view.debugElement.componentInstance.shouldShow = true;
                 view.detectChanges();

                 var q2: NeedsQuery = view.debugElement.children[0].getLocal('q');

                 expect(q2.query.length).toEqual(1);

                 async.done();
               });
         }));
    });

    describe("querying by var binding", () => {
      it('should contain all the child directives in the light dom with the given var binding',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-query-by-var-binding #q>' +
                          '<div *ngFor="#item of list" [text]="item" #textLabel="textDir"></div>' +
                          '</needs-query-by-var-binding>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q = view.debugElement.children[0].getLocal("q");

                 view.debugElement.componentInstance.list = ['1d', '2d'];

                 view.detectChanges();

                 expect(q.query.first.text).toEqual("1d");
                 expect(q.query.last.text).toEqual("2d");

                 async.done();
               });
         }));

      it('should support querying by multiple var bindings',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-query-by-var-bindings #q>' +
                          '<div text="one" #textLabel1="textDir"></div>' +
                          '<div text="two" #textLabel2="textDir"></div>' +
                          '</needs-query-by-var-bindings>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q = view.debugElement.children[0].getLocal("q");
                 view.detectChanges();

                 expect(q.query.first.text).toEqual("one");
                 expect(q.query.last.text).toEqual("two");

                 async.done();
               });
         }));

      it('should support dynamically inserted directives',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-query-by-var-binding #q>' +
                          '<div *ngFor="#item of list" [text]="item" #textLabel="textDir"></div>' +
                          '</needs-query-by-var-binding>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q = view.debugElement.children[0].getLocal("q");

                 view.debugElement.componentInstance.list = ['1d', '2d'];

                 view.detectChanges();

                 view.debugElement.componentInstance.list = ['2d', '1d'];

                 view.detectChanges();

                 expect(q.query.last.text).toEqual("1d");

                 async.done();
               });
         }));

      it('should contain all the elements in the light dom with the given var binding',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-query-by-var-binding #q>' +
                          '<div template="ngFor: #item of list">' +
                          '<div #textLabel>{{item}}</div>' +
                          '</div>' +
                          '</needs-query-by-var-binding>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q = view.debugElement.children[0].getLocal("q");

                 view.debugElement.componentInstance.list = ['1d', '2d'];

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

                 expect(asNativeElements(view.debugElement.children)).toHaveText('hello|world|');

                 async.done();
               });
         }));

      it('should support querying the view by using a view query',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-query-by-var-binding #q></needs-view-query-by-var-binding>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q: NeedsViewQueryByLabel = view.debugElement.children[0].getLocal("q");
                 view.detectChanges();

                 expect(q.query.first.nativeElement).toHaveText("text");

                 async.done();
               });
         }));

      it('should contain all child directives in the view dom',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-children #q></needs-view-children>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();

                 var q = view.debugElement.children[0].getLocal('q');

                 view.detectChanges();

                 expect(q.textDirChildren.length).toEqual(1);
                 expect(q.numberOfChildrenAfterViewInit).toEqual(1);

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
                 var q: NeedsViewQuery = view.debugElement.children[0].getLocal("q");

                 view.detectChanges();

                 expect(q.query.map((d: TextDirective) => d.text)).toEqual(["1", "2", "3", "4"]);

                 async.done();
               });
         }));

      it('should not include directive present on the host element',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-query #q text="self"></needs-view-query>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q: NeedsViewQuery = view.debugElement.children[0].getLocal("q");

                 view.detectChanges();

                 expect(q.query.map((d: TextDirective) => d.text)).toEqual(["1", "2", "3", "4"]);

                 async.done();
               });
         }));

      it('should reflect changes in the component',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-query-if #q></needs-view-query-if>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q: NeedsViewQueryIf = view.debugElement.children[0].getLocal("q");

                 view.detectChanges();

                 expect(q.query.length).toBe(0);

                 q.show = true;
                 view.detectChanges();
                 expect(q.query.length).toBe(1);

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
                 var q: NeedsViewQueryNestedIf = view.debugElement.children[0].getLocal("q");

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


      it('should maintain directives in pre-order depth-first DOM order after dynamic insertion',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-query-order #q></needs-view-query-order>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q: NeedsViewQueryOrder = view.debugElement.children[0].getLocal("q");

                 view.detectChanges();

                 expect(q.query.map((d: TextDirective) => d.text)).toEqual(["1", "2", "3", "4"]);

                 q.list = ["-3", "2"];
                 view.detectChanges();


                 expect(q.query.map((d: TextDirective) => d.text)).toEqual(["1", "-3", "2", "4"]);

                 async.done();
               });
         }));

      it('should maintain directives in pre-order depth-first DOM order after dynamic insertion',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-query-order-with-p #q></needs-view-query-order-with-p>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q: NeedsViewQueryOrderWithParent = view.debugElement.children[0].getLocal("q");

                 view.detectChanges();

                 expect(q.query.map((d: TextDirective) => d.text)).toEqual(["1", "2", "3", "4"]);

                 q.list = ["-3", "2"];
                 view.detectChanges();


                 expect(q.query.map((d: TextDirective) => d.text)).toEqual(["1", "-3", "2", "4"]);

                 async.done();
               });
         }));

      it('should handle long ngFor cycles',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-view-query-order #q></needs-view-query-order>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 var q: NeedsViewQueryOrder = view.debugElement.children[0].getLocal('q');

                 // no significance to 50, just a reasonably large cycle.
                 for (var i = 0; i < 50; i++) {
                   var newString = i.toString();
                   q.list = [newString];
                   view.detectChanges();

                   expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1', newString, '4']);
                 }

                 async.done();
               });
         }));

      it('should support more than three queries',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<needs-four-queries #q><div text="1"></div></needs-four-queries>';

           tcb.overrideTemplate(MyComp, template)
               .createAsync(MyComp)
               .then((view) => {
                 view.detectChanges();

                 var q = view.debugElement.children[0].getLocal('q');
                 expect(q.query1).toBeDefined();
                 expect(q.query2).toBeDefined();
                 expect(q.query3).toBeDefined();
                 expect(q.query4).toBeDefined();

                 async.done();
               });
         }));
    });
  });
}

@Directive({selector: '[text]', inputs: ['text'], exportAs: 'textDir'})
@Injectable()
class TextDirective {
  text: string;
  constructor() {}
}

@Component({selector: 'needs-content-children', template: ''})
class NeedsContentChildren implements AfterContentInit {
  @ContentChildren(TextDirective) textDirChildren: QueryList<TextDirective>;
  numberOfChildrenAfterContentInit: number;

  ngAfterContentInit() { this.numberOfChildrenAfterContentInit = this.textDirChildren.length; }
}

@Component(
    {selector: 'needs-view-children', template: '<div text></div>', directives: [TextDirective]})
class NeedsViewChildren implements AfterViewInit {
  @ViewChildren(TextDirective) textDirChildren: QueryList<TextDirective>;
  numberOfChildrenAfterViewInit: number;

  ngAfterViewInit() { this.numberOfChildrenAfterViewInit = this.textDirChildren.length; }
}

@Component({selector: 'needs-content-child', template: ''})
class NeedsContentChild implements AfterContentInit, AfterContentChecked {
  _child: TextDirective;

  @ContentChild(TextDirective)
  set child(value) {
    this._child = value;
    this.log.push(['setter', isPresent(value) ? value.text : null]);
  }

  get child() { return this._child; }
  log = [];

  ngAfterContentInit() { this.log.push(["init", isPresent(this.child) ? this.child.text : null]); }

  ngAfterContentChecked() {
    this.log.push(["check", isPresent(this.child) ? this.child.text : null]);
  }
}

@Component({
  selector: 'needs-view-child',
  template: `
    <div *ngIf="shouldShow" text="foo"></div>
  `,
  directives: [NgIf, TextDirective]
})
class NeedsViewChild implements AfterViewInit,
    AfterViewChecked {
  shouldShow: boolean = true;
  shouldShow2: boolean = false;
  _child: TextDirective;

  @ViewChild(TextDirective)
  set child(value) {
    this._child = value;
    this.log.push(['setter', isPresent(value) ? value.text : null]);
  }

  get child() { return this._child; }
  log = [];

  ngAfterViewInit() { this.log.push(["init", isPresent(this.child) ? this.child.text : null]); }

  ngAfterViewChecked() { this.log.push(["check", isPresent(this.child) ? this.child.text : null]); }
}

@Directive({selector: '[dir]'})
@Injectable()
class InertDirective {
  constructor() {}
}

@Component({
  selector: 'needs-query',
  directives: [NgFor, TextDirective],
  template: '<div text="ignoreme"></div><b *ngFor="var dir of query">{{dir.text}}|</b>'
})
@Injectable()
class NeedsQuery {
  query: QueryList<TextDirective>;
  constructor(@Query(TextDirective) query: QueryList<TextDirective>) { this.query = query; }
}

@Component({selector: 'needs-four-queries', template: ''})
class NeedsFourQueries {
  @ContentChild(TextDirective) query1: TextDirective;
  @ContentChild(TextDirective) query2: TextDirective;
  @ContentChild(TextDirective) query3: TextDirective;
  @ContentChild(TextDirective) query4: TextDirective;
}

@Component({
  selector: 'needs-query-desc',
  directives: [NgFor],
  template: '<div *ngFor="var dir of query">{{dir.text}}|</div>'
})
@Injectable()
class NeedsQueryDesc {
  query: QueryList<TextDirective>;
  constructor(@Query(TextDirective, {descendants: true}) query: QueryList<TextDirective>) {
    this.query = query;
  }
}

@Component({selector: 'needs-query-by-var-binding', directives: [], template: '<ng-content>'})
@Injectable()
class NeedsQueryByLabel {
  query: QueryList<any>;
  constructor(@Query("textLabel", {descendants: true}) query: QueryList<any>) {
    this.query = query;
  }
}

@Component({
  selector: 'needs-view-query-by-var-binding',
  directives: [],
  template: '<div #textLabel>text</div>'
})
@Injectable()
class NeedsViewQueryByLabel {
  query: QueryList<any>;
  constructor(@ViewQuery("textLabel") query: QueryList<any>) { this.query = query; }
}

@Component({selector: 'needs-query-by-var-bindings', directives: [], template: '<ng-content>'})
@Injectable()
class NeedsQueryByTwoLabels {
  query: QueryList<any>;
  constructor(@Query("textLabel1,textLabel2", {descendants: true}) query: QueryList<any>) {
    this.query = query;
  }
}

@Component({
  selector: 'needs-query-and-project',
  directives: [NgFor],
  template: '<div *ngFor="var dir of query">{{dir.text}}|</div><ng-content></ng-content>'
})
@Injectable()
class NeedsQueryAndProject {
  query: QueryList<TextDirective>;
  constructor(@Query(TextDirective) query: QueryList<TextDirective>) { this.query = query; }
}

@Component({
  selector: 'needs-view-query',
  directives: [TextDirective],
  template: '<div text="1"><div text="2"></div></div>' +
                '<div text="3"></div><div text="4"></div>'
})
@Injectable()
class NeedsViewQuery {
  query: QueryList<TextDirective>;
  constructor(@ViewQuery(TextDirective) query: QueryList<TextDirective>) { this.query = query; }
}

@Component({
  selector: 'needs-view-query-if',
  directives: [NgIf, TextDirective],
  template: '<div *ngIf="show" text="1"></div>'
})
@Injectable()
class NeedsViewQueryIf {
  show: boolean;
  query: QueryList<TextDirective>;
  constructor(@ViewQuery(TextDirective) query: QueryList<TextDirective>) {
    this.query = query;
    this.show = false;
  }
}


@Component({
  selector: 'needs-view-query-nested-if',
  directives: [NgIf, InertDirective, TextDirective],
  template: '<div text="1"><div *ngIf="show"><div dir></div></div></div>'
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

@Component({
  selector: 'needs-view-query-order',
  directives: [NgFor, TextDirective, InertDirective],
  template: '<div text="1"></div>' +
                '<div *ngFor="var i of list" [text]="i"></div>' +
                '<div text="4"></div>'
})
@Injectable()
class NeedsViewQueryOrder {
  query: QueryList<TextDirective>;
  list: string[];
  constructor(@ViewQuery(TextDirective) query: QueryList<TextDirective>) {
    this.query = query;
    this.list = ['2', '3'];
  }
}

@Component({
  selector: 'needs-view-query-order-with-p',
  directives: [NgFor, TextDirective, InertDirective],
  template: '<div dir><div text="1"></div>' +
                '<div *ngFor="var i of list" [text]="i"></div>' +
                '<div text="4"></div></div>'
})
@Injectable()
class NeedsViewQueryOrderWithParent {
  query: QueryList<TextDirective>;
  list: string[];
  constructor(@ViewQuery(TextDirective) query: QueryList<TextDirective>) {
    this.query = query;
    this.list = ['2', '3'];
  }
}

@Component({selector: 'needs-tpl', template: '<template var-x="shadow"></template>'})
class NeedsTpl {
  viewQuery: QueryList<TemplateRef>;
  query: QueryList<TemplateRef>;
  constructor(@ViewQuery(TemplateRef) viewQuery: QueryList<TemplateRef>,
              @Query(TemplateRef) query: QueryList<TemplateRef>, public vc: ViewContainerRef) {
    this.viewQuery = viewQuery;
    this.query = query;
  }
}

@Component({
  selector: 'my-comp',
  directives: [
    NeedsQuery,
    NeedsQueryDesc,
    NeedsQueryByLabel,
    NeedsQueryByTwoLabels,
    NeedsQueryAndProject,
    NeedsViewQuery,
    NeedsViewQueryIf,
    NeedsViewQueryNestedIf,
    NeedsViewQueryOrder,
    NeedsViewQueryByLabel,
    NeedsViewQueryOrderWithParent,
    NeedsContentChildren,
    NeedsViewChildren,
    NeedsViewChild,
    NeedsContentChild,
    NeedsTpl,
    TextDirective,
    InertDirective,
    NgIf,
    NgFor,
    NeedsFourQueries
  ],
  template: ''
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