/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectorType, Provider, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵProvidersFeature, ɵɵtext} from '@angular/core';
import {createInjector} from '@angular/core/src/di/r3_injector';
import {RenderFlags} from '@angular/core/src/render3';
import {ComponentFixture} from '@angular/core/test/render3/render_util';

export interface ComponentTest {
  providers?: Provider[];
  viewProviders?: Provider[];
  directiveProviders?: Provider[];
  directive2Providers?: Provider[];
  directiveAssertion?: () => void;
  componentAssertion?: () => void;
}

export function expectProvidersScenario(defs: {
  app?: ComponentTest,
  parent?: ComponentTest,
  viewChild?: ComponentTest,
  contentChild?: ComponentTest,
  ngModule?: InjectorType<any>,
}): void {
  function testComponentInjection<T>(def: ComponentTest|undefined, instance: T): T {
    if (def) {
      def.componentAssertion && def.componentAssertion();
    }
    return instance;
  }

  function testDirectiveInjection<T>(def: ComponentTest|undefined, instance: T): T {
    if (def) {
      def.directiveAssertion && def.directiveAssertion();
    }
    return instance;
  }

  class ViewChildComponent {
    static ɵfac = () => testComponentInjection(defs.viewChild, new ViewChildComponent());
    static ɵcmp = ɵɵdefineComponent({
      type: ViewChildComponent,
      selectors: [['view-child']],
      decls: 1,
      vars: 0,
      template:
          function(fs: RenderFlags, ctx: ViewChildComponent) {
            if (fs & RenderFlags.Create) {
              ɵɵtext(0, 'view-child');
            }
          },
      features: defs.viewChild &&
          [ɵɵProvidersFeature(defs.viewChild.providers || [], defs.viewChild.viewProviders || [])]
    });
  }

  class ViewChildDirective {
    static ɵfac = () => testDirectiveInjection(defs.viewChild, new ViewChildDirective());
    static ɵdir = ɵɵdefineDirective({
      type: ViewChildDirective,
      selectors: [['view-child']],
      features: defs.viewChild && [ɵɵProvidersFeature(defs.viewChild.directiveProviders || [])],
    });
  }

  class ContentChildComponent {
    static ɵfac =
        () => {
          return testComponentInjection(defs.contentChild, new ContentChildComponent());
        }

    static ɵcmp = ɵɵdefineComponent({
      type: ContentChildComponent,
      selectors: [['content-child']],
      decls: 1,
      vars: 0,
      template:
          function(fs: RenderFlags, ctx: ParentComponent) {
            if (fs & RenderFlags.Create) {
              ɵɵtext(0, 'content-child');
            }
          },
      features: defs.contentChild &&
          [ɵɵProvidersFeature(
              defs.contentChild.providers || [], defs.contentChild.viewProviders || [])],
    });
  }

  class ContentChildDirective {
    static ɵfac =
        () => {
          return testDirectiveInjection(defs.contentChild, new ContentChildDirective());
        }

    static ɵdir = ɵɵdefineDirective({
      type: ContentChildDirective,
      selectors: [['content-child']],
      features: defs.contentChild &&
          [ɵɵProvidersFeature(defs.contentChild.directiveProviders || [])],
    });
  }


  class ParentComponent {
    static ɵfac = () => testComponentInjection(defs.parent, new ParentComponent());
    static ɵcmp = ɵɵdefineComponent({
      type: ParentComponent,
      selectors: [['parent']],
      decls: 1,
      vars: 0,
      template:
          function(fs: RenderFlags, ctx: ParentComponent) {
            if (fs & RenderFlags.Create) {
              ɵɵelement(0, 'view-child');
            }
          },
      features: defs.parent &&
          [ɵɵProvidersFeature(defs.parent.providers || [], defs.parent.viewProviders || [])],
      dependencies: [ViewChildComponent, ViewChildDirective]
    });
  }

  class ParentDirective {
    static ɵfac = () => testDirectiveInjection(defs.parent, new ParentDirective());
    static ɵdir = ɵɵdefineDirective({
      type: ParentDirective,
      selectors: [['parent']],
      features: defs.parent && [ɵɵProvidersFeature(defs.parent.directiveProviders || [])],
    });
  }

  class ParentDirective2 {
    static ɵfac = () => testDirectiveInjection(defs.parent, new ParentDirective2());
    static ɵdir = ɵɵdefineDirective({
      type: ParentDirective2,
      selectors: [['parent']],
      features: defs.parent && [ɵɵProvidersFeature(defs.parent.directive2Providers || [])],
    });
  }


  class App {
    static ɵfac = () => testComponentInjection(defs.app, new App());
    static ɵcmp = ɵɵdefineComponent({
      type: App,
      selectors: [['app']],
      decls: 2,
      vars: 0,
      template:
          function(fs: RenderFlags, ctx: App) {
            if (fs & RenderFlags.Create) {
              ɵɵelementStart(0, 'parent');
              ɵɵelement(1, 'content-child');
              ɵɵelementEnd();
            }
          },
      features: defs.app &&
          [ɵɵProvidersFeature(defs.app.providers || [], defs.app.viewProviders || [])],
      dependencies:
          [
            ParentComponent, ParentDirective2, ParentDirective, ContentChildComponent,
            ContentChildDirective
          ]
    });
  }


  const fixture = new ComponentFixture(
      App, {injector: defs.ngModule ? createInjector(defs.ngModule) : undefined});
  expect(fixture.html).toEqual('<parent><view-child>view-child</view-child></parent>');

  fixture.destroy();
}
