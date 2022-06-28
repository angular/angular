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
import {getNativeByIndex, load} from '../../src/render3/util/view_utils';

import {ComponentFixture, createComponent, renderComponent} from './render_util';



/**
 * Helper function to check if a given candidate object resembles ElementRef
 * @param candidate
 * @returns true if `ElementRef`.
 */
function isElementRef(candidate: any): boolean {
  return candidate.nativeElement != null;
}

/**
 * Helper function to check if a given candidate object resembles TemplateRef
 * @param candidate
 * @returns true if `TemplateRef`.
 */
function isTemplateRef(candidate: any): boolean {
  return candidate.createEmbeddedView != null && candidate.createComponent == null;
}

/**
 * Helper function to check if a given candidate object resembles ViewContainerRef
 * @param candidate
 * @returns true if `ViewContainerRef`.
 */
function isViewContainerRef(candidate: any): boolean {
  return candidate.createEmbeddedView != null && candidate.createComponent != null;
}

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

    describe('local names', () => {
      it('should query multiple locals on the same element', () => {
        let elToQuery;

        /**
         * <div #foo #bar></div>
         * <div></div>
         * class Cmpt {
         *  @ViewChildren('foo') fooQuery;
         *  @ViewChildren('bar') barQuery;
         * }
         */
        const Cmpt = createComponent(
            'cmpt',
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'div', null, 0);
                elToQuery = getNativeByIndex(HEADER_OFFSET, getLView());
                ɵɵelement(3, 'div');
              }
            },
            4, 0, [], [],
            function(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                ɵɵviewQuery(['foo'], QueryFlags.none);
                ɵɵviewQuery(['bar'], QueryFlags.none);
              }
              if (rf & RenderFlags.Update) {
                let tmp: any;
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.fooQuery = tmp as QueryList<any>);
                ɵɵqueryRefresh(tmp = ɵɵloadQuery<QueryList<any>>()) &&
                    (ctx.barQuery = tmp as QueryList<any>);
              }
            },
            [], [], undefined, [['foo', '', 'bar', '']]);

        const cmptInstance = renderComponent(Cmpt);

        const fooList = (cmptInstance.fooQuery as QueryList<any>);
        expect(fooList.length).toBe(1);
        expect(fooList.first.nativeElement).toEqual(elToQuery);

        const barList = (cmptInstance.barQuery as QueryList<any>);
        expect(barList.length).toBe(1);
        expect(barList.first.nativeElement).toEqual(elToQuery);
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
});
