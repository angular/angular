/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, QueryList, TemplateRef, ViewContainerRef} from '@angular/core';
import {QueryFlags} from '@angular/core/src/render3/interfaces/query';
import {HEADER_OFFSET} from '@angular/core/src/render3/interfaces/view';

import {AttributeMarker, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵProvidersFeature} from '../../src/render3/index';
import {ɵɵdirectiveInject, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵtemplate} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {ɵɵcontentQuery, ɵɵloadQuery, ɵɵqueryRefresh, ɵɵviewQuery} from '../../src/render3/query';
import {getLView} from '../../src/render3/state';
import {load} from '../../src/render3/util/view_utils';

import {ComponentFixture, createComponent} from './render_util';


describe('query', () => {
  describe('predicate', () => {
    describe('providers', () => {
      class Service {}
      class Alias {}

      let directive: MyDirective|null = null;

      class MyDirective {
        constructor(public service: Service) {}

        static ɵfac = function MyDirective_Factory() {
          return directive = new MyDirective(ɵɵdirectiveInject(Service));
        };
        static ɵdir = ɵɵdefineDirective({
          type: MyDirective,
          selectors: [['', 'myDir', '']],
          features: [ɵɵProvidersFeature([Service, {provide: Alias, useExisting: Service}])],
        });
      }

      beforeEach(() => directive = null);

      // https://stackblitz.com/edit/ng-viewengine-viewchild-providers?file=src%2Fapp%2Fapp.component.ts
      it('should query for providers that are present on a directive', () => {
        /**
         * <div myDir></div>
         * class App {
         *  @ViewChild(MyDirective) directive: MyDirective;
         *  @ViewChild(Service) service: Service;
         *  @ViewChild(Alias) alias: Alias;
         * }
         */
        class App {
          directive?: MyDirective;
          service?: Service;
          alias?: Alias;

          static ɵfac = function App_Factory() {
            return new App();
          };
          static ɵcmp = ɵɵdefineComponent({
            type: App,
            selectors: [['app']],
            decls: 1,
            vars: 0,
            consts: [['myDir']],
            template:
                function App_Template(rf: RenderFlags, ctx: App) {
                  if (rf & RenderFlags.Create) {
                    ɵɵelement(0, 'div', 0);
                  }
                },
            viewQuery:
                function(rf: RenderFlags, ctx: App) {
                  if (rf & RenderFlags.Create) {
                    ɵɵviewQuery(MyDirective, QueryFlags.none);
                    ɵɵviewQuery(Service, QueryFlags.none);
                    ɵɵviewQuery(Alias, QueryFlags.none);
                  }
                  if (rf & RenderFlags.Update) {
                    let tmp: any;
                    ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                        (ctx.directive = tmp.first);
                    ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                        (ctx.service = tmp.first);
                    ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) && (ctx.alias = tmp.first);
                  }
                },
            dependencies: [MyDirective]
          });
        }

        const componentFixture = new ComponentFixture(App);
        expect(componentFixture.component.directive).toBe(directive!);
        expect(componentFixture.component.service).toBe(directive!.service);
        expect(componentFixture.component.alias).toBe(directive!.service);
      });

      it('should resolve a provider if given as read token', () => {
        /**
         * <div myDir></div>
         * class App {
         *  @ViewChild(MyDirective, {read: Alias}}) service: Service;
         * }
         */
        class App {
          service?: Service;

          static ɵfac = function App_Factory() {
            return new App();
          };
          static ɵcmp = ɵɵdefineComponent({
            type: App,
            selectors: [['app']],
            decls: 1,
            vars: 0,
            consts: [['myDir']],
            template:
                function App_Template(rf: RenderFlags, ctx: App) {
                  if (rf & RenderFlags.Create) {
                    ɵɵelement(0, 'div', 0);
                  }
                },
            viewQuery:
                function(rf: RenderFlags, ctx: App) {
                  let tmp: any;
                  if (rf & RenderFlags.Create) {
                    ɵɵviewQuery(MyDirective, QueryFlags.none, Alias);
                  }
                  if (rf & RenderFlags.Update) {
                    ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                        (ctx.service = tmp.first);
                  }
                },
            dependencies: [MyDirective]
          });
        }

        const componentFixture = new ComponentFixture(App);
        expect(componentFixture.component.service).toBe(directive!.service);
      });
    });
  });

  it('should restore queries if view changes', () => {
    class SomeDir {
      constructor(public vcr: ViewContainerRef, public temp: TemplateRef<any>) {
        this.vcr.createEmbeddedView(this.temp);
      }

      static ɵfac = () => new SomeDir(
          ɵɵdirectiveInject(ViewContainerRef as any), ɵɵdirectiveInject(TemplateRef as any))

          static ɵdir = ɵɵdefineDirective({
            type: SomeDir,
            selectors: [['', 'someDir', '']],
          });
    }

    function AppComponent_Template_1(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'div');
      }
    }

    /**
     * <div *someDir></div>
     * <div #foo></div>
     */
    const AppComponent = createComponent(
        'app',
        function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵtemplate(0, AppComponent_Template_1, 1, 0, 'div', 0);
            ɵɵelement(1, 'div', null, 1);
          }
        },
        3, 0, [SomeDir], [],
        function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵviewQuery(['foo'], QueryFlags.descendants);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                (ctx.query = tmp as QueryList<any>);
          }
        },
        [], [], undefined, [[AttributeMarker.Template, 'someDir'], ['foo', '']]);

    const fixture = new ComponentFixture(AppComponent);
    expect(fixture.component.query.length).toBe(1);
  });

  describe('content', () => {
    let withContentInstance: WithContentDirective|null;

    beforeEach(() => {
      withContentInstance = null;
    });

    class WithContentDirective {
      // @ContentChildren('foo')
      foos!: QueryList<ElementRef>;
      contentInitQuerySnapshot = 0;
      contentCheckedQuerySnapshot = 0;

      ngAfterContentInit() {
        this.contentInitQuerySnapshot = this.foos ? this.foos.length : 0;
      }

      ngAfterContentChecked() {
        this.contentCheckedQuerySnapshot = this.foos ? this.foos.length : 0;
      }

      static ɵfac = () => withContentInstance = new WithContentDirective();
      static ɵdir = ɵɵdefineDirective({
        type: WithContentDirective,
        selectors: [['', 'with-content', '']],
        contentQueries:
            (rf: RenderFlags, ctx: any, dirIndex: number) => {
              if (rf & RenderFlags.Create) {
                ɵɵcontentQuery(dirIndex, ['foo'], QueryFlags.descendants);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.foos = tmp);
              }
            }
      });
    }

    it('should support content queries for directives', () => {
      /**
       * <div with-content>
       *   <span #foo></span>
       * </div>
       */
      const AppComponent = createComponent(
          'app-component',
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0);
              { ɵɵelement(1, 'span', null, 1); }
              ɵɵelementEnd();
            }
          },
          3, 0, [WithContentDirective], [], null, [], [], undefined,
          [[AttributeMarker.Bindings, 'with-content'], ['foo', '']]);

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance!.foos.length)
          .toBe(1, `Expected content query to match <span #foo>.`);

      expect(withContentInstance!.contentInitQuerySnapshot)
          .toBe(
              1,
              `Expected content query results to be available when ngAfterContentInit was called.`);

      expect(withContentInstance!.contentCheckedQuerySnapshot)
          .toBe(
              1,
              `Expected content query results to be available when ngAfterContentChecked was called.`);
    });

    it('should not match directive host with content queries', () => {
      /**
       * <div with-content #foo>
       * </div>
       */
      const AppComponent = createComponent(
          'app-component',
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', 0, 1);
            }
          },
          2, 0, [WithContentDirective], [], null, [], [], undefined,
          [['with-content', ''], ['foo', '']]);

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance!.foos.length)
          .toBe(0, `Expected content query not to match <div with-content #foo>.`);
    });

    // https://stackblitz.com/edit/angular-wlenwd?file=src%2Fapp%2Fapp.component.ts
    it('should support view and content queries matching the same element', () => {
      /**
       * <div with-content>
       *   <div #foo></div>
       * </div>
       * <div id="after" #bar></div>
       * class Cmpt {
       *  @ViewChildren('foo, bar') foos;
       * }
       */
      const AppComponent = createComponent(
          'app-component',
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0);
              { ɵɵelement(1, 'div', null, 2); }
              ɵɵelementEnd();
              ɵɵelement(3, 'div', 1, 3);
            }
          },
          5, 0, [WithContentDirective], [],
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵviewQuery(['foo', 'bar'], QueryFlags.descendants);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                  (ctx.foos = tmp as QueryList<any>);
            }
          },
          [], [], undefined, [['with-content', ''], ['id', 'after'], ['foo', ''], ['bar', '']]);

      const fixture = new ComponentFixture(AppComponent);
      const viewQList = fixture.component.foos;

      expect(viewQList.length).toBe(2);
      expect(withContentInstance!.foos.length).toBe(1);
      expect(viewQList.first.nativeElement).toBe(withContentInstance!.foos.first.nativeElement);
      expect(viewQList.last.nativeElement.id).toBe('after');
    });

    it('should not report deep content query matches found above content children', () => {
      /**
       * <div with-content>
       *   <div #foo id="yes"></div>    <-- should match content query
       * </div>
       * <div #foo></div>              <-- should not match content query
       * class AppComponent {
       *  @ViewChildren('bar') bars: QueryList<ElementRef>;
       * }
       */
      const AppComponent = createComponent(
          'app-component',
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0);
              { ɵɵelement(1, 'div', 1, 2); }
              ɵɵelementEnd();
              ɵɵelement(3, 'div', null, 2);
            }
          },
          5, 0, [WithContentDirective], [],
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵviewQuery(['bar'], QueryFlags.descendants);
            }
            if (rf & RenderFlags.Update) {
              let tmp: any;
              ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                  (ctx.bars = tmp as QueryList<any>);
            }
          },
          [], [], undefined, [['with-content', ''], ['id', 'yes'], ['foo', '']]);

      const fixture = new ComponentFixture(AppComponent);
      expect(withContentInstance!.foos.length).toBe(1);
      expect(withContentInstance!.foos.first.nativeElement.id).toEqual('yes');
    });

    it('should report results to appropriate queries where deep content queries are nested', () => {
      class QueryDirective {
        fooBars: any;
        static ɵfac = () => new QueryDirective();
        static ɵdir = ɵɵdefineDirective({
          type: QueryDirective,
          selectors: [['', 'query', '']],
          exportAs: ['query'],
          contentQueries:
              (rf: RenderFlags, ctx: any, dirIndex: number) => {
                // @ContentChildren('foo, bar, baz', {descendants: true})
                // fooBars: QueryList<ElementRef>;
                if (rf & RenderFlags.Create) {
                  ɵɵcontentQuery(dirIndex, ['foo', 'bar', 'baz'], QueryFlags.descendants);
                }
                if (rf & RenderFlags.Update) {
                  let tmp: any;
                  ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.fooBars = tmp);
                }
              }
        });
      }

      let outInstance: QueryDirective;
      let inInstance: QueryDirective;

      const AppComponent = createComponent(
          'app-component',
          /**
           * <div query #out="query">
           *   <span #foo></span>
           *   <div query #in="query">
           *     <span #bar></span>
           *   </div>
           *   <span #baz></span>
           * </div>
           */
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0, 4);
              {
                ɵɵelement(2, 'span', 1, 5);
                ɵɵelementStart(4, 'div', 0, 6);
                { ɵɵelement(6, 'span', 2, 7); }
                ɵɵelementEnd();
                ɵɵelement(8, 'span', 3, 8);
              }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              const lView = getLView();
              outInstance = load<QueryDirective>(lView, HEADER_OFFSET + 1);
              inInstance = load<QueryDirective>(lView, HEADER_OFFSET + 5);
            }
          },
          10, 0, [QueryDirective], [], null, [], [], undefined, [
            [AttributeMarker.Bindings, 'query'], ['id', 'foo'], ['id', 'bar'], ['id', 'baz'],
            ['out', 'query'], ['foo', ''], ['in', 'query'], ['bar', ''], ['baz', '']
          ]);

      const fixture = new ComponentFixture(AppComponent);
      expect(outInstance!.fooBars.length).toBe(3);
      expect(inInstance!.fooBars.length).toBe(1);
    });


    it('should support nested shallow content queries ', () => {
      let outInstance: QueryDirective;
      let inInstance: QueryDirective;

      class QueryDirective {
        fooBars: any;
        static ɵfac = () => new QueryDirective();
        static ɵdir = ɵɵdefineDirective({
          type: QueryDirective,
          selectors: [['', 'query', '']],
          exportAs: ['query'],
          contentQueries:
              (rf: RenderFlags, ctx: any, dirIndex: number) => {
                // @ContentChildren('foo', {descendants: true})
                // fooBars: QueryList<ElementRef>;
                if (rf & RenderFlags.Create) {
                  ɵɵcontentQuery(dirIndex, ['foo'], QueryFlags.none);
                }
                if (rf & RenderFlags.Update) {
                  let tmp: any;
                  ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.fooBars = tmp);
                }
              }
        });
      }

      const AppComponent = createComponent(
          'app-component',
          /**
           * <div query #out="query">
           *   <div query #in="query" #foo>
           *     <span #foo></span>
           *   </div>
           * </div>
           */
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0, 2);
              {
                ɵɵelementStart(2, 'div', 0, 3);
                { ɵɵelement(5, 'span', 1, 4); }
                ɵɵelementEnd();
              }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              const lView = getLView();
              outInstance = load<QueryDirective>(lView, HEADER_OFFSET + 1);
              inInstance = load<QueryDirective>(lView, HEADER_OFFSET + 3);
            }
          },
          7, 0, [QueryDirective], [], null, [], [], undefined, [
            ['query', ''], ['id', 'bar'], ['out', 'query'], ['in', 'query', 'foo', ''], ['foo', '']
          ]);

      const fixture = new ComponentFixture(AppComponent);
      expect(outInstance!.fooBars.length).toBe(1);
      expect(inInstance!.fooBars.length).toBe(1);
    });

    it('should support nested shallow content queries across multiple component instances', () => {
      let outInstance: QueryDirective;
      let inInstance: QueryDirective;

      class QueryDirective {
        fooBars: any;
        static ɵfac = () => new QueryDirective();
        static ɵdir = ɵɵdefineDirective({
          type: QueryDirective,
          selectors: [['', 'query', '']],
          exportAs: ['query'],
          contentQueries:
              (rf: RenderFlags, ctx: any, dirIndex: number) => {
                // @ContentChildren('foo', {descendants: true})
                // fooBars: QueryList<ElementRef>;
                if (rf & RenderFlags.Create) {
                  ɵɵcontentQuery(dirIndex, ['foo'], QueryFlags.none);
                }
                if (rf & RenderFlags.Update) {
                  let tmp: any;
                  ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.fooBars = tmp);
                }
              }
        });
      }

      const AppComponent = createComponent(
          'app-component',
          /**
           * <div query #out="query">
           *   <div query #in="query" #foo>
           *     <span #foo></span>
           *   </div>
           * </div>
           */
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0, 2);
              {
                ɵɵelementStart(2, 'div', 0, 3);
                { ɵɵelement(5, 'span', 1, 4); }
                ɵɵelementEnd();
              }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              const lView = getLView();
              outInstance = load<QueryDirective>(lView, HEADER_OFFSET + 1);
              inInstance = load<QueryDirective>(lView, HEADER_OFFSET + 3);
            }
          },
          7, 0, [QueryDirective], [], null, [], [], undefined, [
            ['query', ''], ['id', 'bar'], ['out', 'query'], ['in', 'query', 'foo', ''], ['foo', '']
          ]);

      const fixture1 = new ComponentFixture(AppComponent);
      expect(outInstance!.fooBars.length).toBe(1);
      expect(inInstance!.fooBars.length).toBe(1);

      outInstance = inInstance = null!;

      const fixture2 = new ComponentFixture(AppComponent);
      expect(outInstance!.fooBars.length).toBe(1);
      expect(inInstance!.fooBars.length).toBe(1);
    });

    it('should respect shallow flag on content queries when mixing deep and shallow queries',
       () => {
         class ShallowQueryDirective {
           foos: any;
           static ɵfac = () => new ShallowQueryDirective();
           static ɵdir = ɵɵdefineDirective({
             type: ShallowQueryDirective,
             selectors: [['', 'shallow-query', '']],
             exportAs: ['shallow-query'],
             contentQueries:
                 (rf: RenderFlags, ctx: any, dirIndex: number) => {
                   // @ContentChildren('foo', {descendants: false})
                   // foos: QueryList<ElementRef>;
                   if (rf & RenderFlags.Create) {
                     ɵɵcontentQuery(dirIndex, ['foo'], QueryFlags.none);
                   }
                   if (rf & RenderFlags.Update) {
                     let tmp: any;
                     ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.foos = tmp);
                   }
                 }
           });
         }

         class DeepQueryDirective {
           foos: any;
           static ɵfac = () => new DeepQueryDirective();
           static ɵdir = ɵɵdefineDirective({
             type: DeepQueryDirective,
             selectors: [['', 'deep-query', '']],
             exportAs: ['deep-query'],
             contentQueries:
                 (rf: RenderFlags, ctx: any, dirIndex: number) => {
                   // @ContentChildren('foo', {descendants: true})
                   // foos: QueryList<ElementRef>;
                   if (rf & RenderFlags.Create) {
                     ɵɵcontentQuery(dirIndex, ['foo'], QueryFlags.descendants);
                   }
                   if (rf & RenderFlags.Update) {
                     let tmp: any;
                     ɵɵqueryRefresh(tmp = ɵɵloadQuery<ElementRef>()) && (ctx.foos = tmp);
                   }
                 }
           });
         }

         let shallowInstance: ShallowQueryDirective;
         let deepInstance: DeepQueryDirective;

         const AppComponent = createComponent(
             'app-component',
             /**
              * <div shallow-query #shallow="shallow-query" deep-query #deep="deep-query">
              *   <span #foo></span>
              *    <div>
              *        <span #foo></span>
              *    </div>
              * </div>
              */
             function(rf: RenderFlags, ctx: any) {
               if (rf & RenderFlags.Create) {
                 ɵɵelementStart(0, 'div', 0, 1);
                 {
                   ɵɵelement(3, 'span', null, 2);
                   ɵɵelementStart(5, 'div');
                   { ɵɵelement(6, 'span', null, 2); }
                   ɵɵelementEnd();
                 }
                 ɵɵelementEnd();
               }
               if (rf & RenderFlags.Update) {
                 const lView = getLView();
                 shallowInstance = load<ShallowQueryDirective>(lView, HEADER_OFFSET + 1);
                 deepInstance = load<DeepQueryDirective>(lView, HEADER_OFFSET + 2);
               }
             },
             8, 0, [ShallowQueryDirective, DeepQueryDirective], [], null, [], [], undefined, [
               [AttributeMarker.Bindings, 'shallow-query', 'deep-query'],
               ['shallow', 'shallow-query', 'deep', 'deep-query'], ['foo', '']
             ]);

         const fixture = new ComponentFixture(AppComponent);
         expect(shallowInstance!.foos.length).toBe(1);
         expect(deepInstance!.foos.length).toBe(2);
       });
  });

  describe('order', () => {
    class TextDirective {
      value!: string;

      static ɵfac = () => new TextDirective();
      static ɵdir = ɵɵdefineDirective(
          {type: TextDirective, selectors: [['', 'text', '']], inputs: {value: 'text'}});
    }

    it('should register content matches from top to bottom', () => {
      let contentQueryDirective: ContentQueryDirective;

      class ContentQueryDirective {
        // @ContentChildren(TextDirective)
        texts!: QueryList<TextDirective>;

        static ɵfac = () => contentQueryDirective = new ContentQueryDirective();
        static ɵcmp = ɵɵdefineDirective({
          type: ContentQueryDirective,
          selectors: [['', 'content-query', '']],
          contentQueries:
              (rf: RenderFlags, ctx: any, dirIndex: number) => {
                // @ContentChildren(TextDirective, {descendants: true})
                // texts: QueryList<TextDirective>;
                if (rf & RenderFlags.Create) {
                  ɵɵcontentQuery(dirIndex, TextDirective, QueryFlags.descendants);
                }
                if (rf & RenderFlags.Update) {
                  let tmp: any;
                  ɵɵqueryRefresh(tmp = ɵɵloadQuery<TextDirective>()) && (ctx.texts = tmp);
                }
              }
        });
      }

      const AppComponent = createComponent(
          'app-component',
          /**
           * <div content-query>
           *    <span text="A"></span>
           *    <div text="B">
           *       <span text="C">
           *         <span text="D"></span>
           *       </span>
           *    </div>
           *    <span text="E"></span>
           * </div>
           */
          function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div', 0);
              {
                ɵɵelement(1, 'span', 1);
                ɵɵelementStart(2, 'div', 2);
                ɵɵelementStart(3, 'span', 3);
                { ɵɵelement(4, 'span', 4); }
                ɵɵelementEnd();
                ɵɵelementEnd();
                ɵɵelement(5, 'span', 5);
              }
              ɵɵelementEnd();
            }
          },
          6, 0, [TextDirective, ContentQueryDirective], [], null, [], [], undefined, [
            ['content-query'], ['text', 'A'], ['text', 'B'], ['text', 'C'], ['text', 'D'],
            ['text', 'E']
          ]);

      new ComponentFixture(AppComponent);
      expect(contentQueryDirective!.texts.map(item => item.value)).toEqual([
        'A', 'B', 'C', 'D', 'E'
      ]);
    });

    it('should register view matches from top to bottom', () => {
      /**
       *    <span text="A"></span>
       *    <div text="B">
       *       <span text="C">
       *         <span text="D"></span>
       *       </span>
       *    </div>
       *    <span text="E"></span>
       */
      class ViewQueryComponent {
        // @ViewChildren(TextDirective)
        texts!: QueryList<TextDirective>;

        static ɵfac = () => new ViewQueryComponent();
        static ɵcmp = ɵɵdefineComponent({
          type: ViewQueryComponent,
          selectors: [['view-query']],
          consts: [['text', 'A'], ['text', 'B'], ['text', 'C'], ['text', 'D'], ['text', 'E']],
          template:
              function(rf: RenderFlags, ctx: ViewQueryComponent) {
                if (rf & RenderFlags.Create) {
                  ɵɵelement(0, 'span', 0);
                  ɵɵelementStart(1, 'div', 1);
                  ɵɵelementStart(2, 'span', 2);
                  { ɵɵelement(3, 'span', 3); }
                  ɵɵelementEnd();
                  ɵɵelementEnd();
                  ɵɵelement(4, 'span', 4);
                }
              },
          decls: 5,
          vars: 0,
          viewQuery:
              function(rf: RenderFlags, ctx: ViewQueryComponent) {
                let tmp: any;
                if (rf & RenderFlags.Create) {
                  ɵɵviewQuery(TextDirective, QueryFlags.descendants);
                }
                if (rf & RenderFlags.Update) {
                  ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<TextDirective>>()) &&
                      (ctx.texts = tmp as QueryList<TextDirective>);
                }
              },
          dependencies: [TextDirective]
        });
      }

      const fixture = new ComponentFixture(ViewQueryComponent);
      expect(fixture.component.texts.map(item => item.value)).toEqual(['A', 'B', 'C', 'D', 'E']);
    });
  });
});
