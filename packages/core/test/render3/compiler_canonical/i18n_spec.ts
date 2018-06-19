/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';

/// See: `normative.md`
describe('i18n', () => {
  type $RenderFlags$ = $r3$.ɵRenderFlags;

  it('should support html', () => {
    type $MyApp$ = MyApp;
    const $msg_1$ = `{$p_0}contenu{$c_p}`;
    const $i18n_1$ = $r3$.ɵiM($msg_1$, [{p_0: 1}]);

    @Component({selector: 'my-app', template: `<div i18n><p>content</p></div>`})
    class MyApp {
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: () => new MyApp(),
        template: function(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵE(0, 'div');
            $r3$.ɵE(1, 'p');
            $r3$.ɵe();
            $r3$.ɵe();
            $r3$.ɵiA(1, $i18n_1$[0]);
          }
        }
      });
    }
  });

  it('should support expressions', () => {
    type $MyApp$ = MyApp;
    const $msg_1$ = `contenu: {$exp_1}`;
    const $i18n_1$ = $r3$.ɵiM($msg_1$, null, [{exp_1: 1}]);

    @Component({selector: 'my-app', template: `<div i18n>content: {{exp1}}</div>`})
    class MyApp {
      exp1 = '1';
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: () => new MyApp(),
        template: function(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵE(0, 'div');
            $r3$.ɵT(1);
            $r3$.ɵe();
            $r3$.ɵiA(1, $i18n_1$[0]);
          }
          if (rf & 2) {
            $r3$.ɵt(3, $r3$.ɵb(ctx.exp1));
          }
        }
      });
    }
  });

  it('should support expressions in attributes', () => {
    type $MyApp$ = MyApp;
    const $msg_1$ = `titre: {$exp_1}`;
    const $i18n_1$ = $r3$.ɵiEM($msg_1$, {exp_1: 1});

    @Component({selector: 'my-app', template: `<div i18n><p title="title: {{exp1}}"></p></div>`})
    class MyApp {
      exp1 = '1';
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: () => new MyApp(),
        template: function(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵE(0, 'div');
            $r3$.ɵE(1, 'p');
            $r3$.ɵe();
            $r3$.ɵe();
          }
          if (rf & 2) {
            $r3$.ɵp(0, 'title', $r3$.ɵiI($i18n_1$, 2, ctx.exp1));
          }
        }
      });
    }
  });
});
