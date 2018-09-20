/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOfContext} from '@angular/common';
import {Component} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {NgForOf} from '../common_with_def';

/// See: `normative.md`
describe('i18n', () => {
  type $RenderFlags$ = $r3$.ɵRenderFlags;

  it('should support html', () => {
    type $MyApp$ = MyApp;
    const $msg_1$ = `{$START_P}contenu{$END_P}`;
    const $i18n_1$ = $r3$.ɵi18nMapping($msg_1$, [{START_P: 1}]);

    @Component({selector: 'my-app', template: `<div i18n><p>content</p></div>`})
    class MyApp {
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: () => new MyApp(),
        consts: 2,
        vars: 0,
        template: function(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'div');
            $r3$.ɵelementStart(1, 'p');
            $r3$.ɵelementEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵi18nApply(1, $i18n_1$[0]);
          }
        }
      });
    }
  });

  it('should support expressions', () => {
    type $MyApp$ = MyApp;
    const $msg_1$ = `contenu: {$EXP_1}`;
    const $i18n_1$ = $r3$.ɵi18nMapping($msg_1$, null, [{EXP_1: 1}]);

    @Component({selector: 'my-app', template: `<div i18n>content: {{exp1}}</div>`})
    class MyApp {
      exp1 = '1';
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: () => new MyApp(),
        consts: 2,
        vars: 1,
        template: function(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'div');
            $r3$.ɵtext(1);
            $r3$.ɵelementEnd();
            $r3$.ɵi18nApply(1, $i18n_1$[0]);
          }
          if (rf & 2) {
            $r3$.ɵtextBinding(3, $r3$.ɵbind(ctx.exp1));
          }
        }
      });
    }
  });

  it('should support expressions in attributes', () => {
    type $MyApp$ = MyApp;
    const $msg_1$ = `titre: {$EXP_1}`;
    const $i18n_1$ = $r3$.ɵi18nExpMapping($msg_1$, {EXP_1: 1});

    @Component({selector: 'my-app', template: `<div i18n><p title="title: {{exp1}}"></p></div>`})
    class MyApp {
      exp1 = '1';
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: () => new MyApp(),
        consts: 2,
        vars: 1,
        template: function(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'div');
            $r3$.ɵelementStart(1, 'p');
            $r3$.ɵelementEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(0, 'title', $r3$.ɵi18nInterpolation1($i18n_1$, ctx.exp1));
          }
        }
      });
    }
  });

  it('should support embedded templates', () => {
    type $MyApp$ = MyApp;
    const $msg_1$ = `{$START_LI}valeur: {$EXP_1}!{$END_LI}`;
    const $i18n_1$ = $r3$.ɵi18nMapping(
        $msg_1$, [{START_LI: 1}, {START_LI: 0}], [null, {EXP_1: 1}], ['START_LI']);

    function liTemplate(rf1: $RenderFlags$, row: NgForOfContext<string>) {
      if (rf1 & 1) {
        $r3$.ɵelementStart(0, 'li');
        $r3$.ɵtext(1);
        $r3$.ɵelementEnd();
        $r3$.ɵi18nApply(0, $i18n_1$[1]);
      }
      if (rf1 & 2) {
        $r3$.ɵtextBinding(1, $r3$.ɵbind(row.$implicit));
      }
    }

    @Component({
      selector: 'my-app',
      template: `<ul i18n><li *ngFor="let item of items">value: {{item}}</li></ul>`
    })
    class MyApp {
      items: string[] = ['1', '2'];
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 2,
        vars: 1,
        template: (rf: $RenderFlags$, myApp: $MyApp$) => {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'ul');
            $r3$.ɵtemplate(1, liTemplate, 2, 1, null, ['ngForOf', '']);
            $r3$.ɵelementEnd();
            $r3$.ɵi18nApply(1, $i18n_1$[0]);
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(1, 'ngForOf', $r3$.ɵbind(myApp.items));
          }
        },
        directives: () => [NgForOf]
      });
    }
  });
});
