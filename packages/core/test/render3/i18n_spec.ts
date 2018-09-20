/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOfContext} from '@angular/common';
import {Component} from '../../src/core';
import {defineComponent} from '../../src/render3/definition';
import {I18nExpInstruction, I18nInstruction, i18nApply, i18nExpMapping, i18nInterpolation1, i18nInterpolation2, i18nInterpolation3, i18nInterpolation4, i18nInterpolation5, i18nInterpolation6, i18nInterpolation7, i18nInterpolation8, i18nInterpolationV, i18nMapping} from '../../src/render3/i18n';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, nextContext, projection, projectionDef, template, text, textBinding} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {NgForOf} from './common_with_def';
import {ComponentFixture, TemplateFixture} from './render_util';

describe('Runtime i18n', () => {
  it('should support html elements', () => {
    // Html tags are replaced by placeholders.
    // Open tag placeholders are never re-used (closing tag placeholders can be).
    const MSG_DIV_SECTION_1 =
        `{$START_C}trad 1{$END_C}{$START_A}trad 2{$START_B}trad 3{$END_B}{$END_A}`;
    let i18n_1: I18nInstruction[][];
    // Initial template:
    // <div i18n>
    //  <a>
    //    <b></b>
    //    <remove-me></remove-me>
    //  </a>
    //  <c></c>
    // </div>

    // Translated to:
    // <div i18n>
    //  <c>trad 1</c>
    //  <a>
    //    trad 2
    //    <b>trad 3</b>
    //  </a>
    // </div>
    function createTemplate() {
      if (!i18n_1) {
        i18n_1 = i18nMapping(
            MSG_DIV_SECTION_1, [{'START_A': 1, 'START_B': 2, 'START_REMOVE_ME': 3, 'START_C': 4}]);
      }

      elementStart(0, 'div');
      {  // Start of translated section 1
        // - i18n sections do not contain any text() instruction
        elementStart(1, 'a');  // START_A
        {
          element(2, 'b');          // START_B
          element(3, 'remove-me');  // START_REMOVE_ME
        }
        elementEnd();
        element(4, 'c');  // START_C
      }                   // End of translated section 1
      elementEnd();
      i18nApply(1, i18n_1[0]);
    }

    const fixture = new TemplateFixture(createTemplate, () => {}, 5);
    expect(fixture.html).toEqual('<div><c>trad 1</c><a>trad 2<b>trad 3</b></a></div>');
  });

  it('should support expressions', () => {
    const MSG_DIV_SECTION_1 = `start {$EXP_2} middle {$EXP_1} end`;
    let i18n_1: I18nInstruction[][];

    class MyApp {
      exp1 = '1';
      exp2 = '2';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 3,
        vars: 2,
        // Initial template:
        // <div i18n>
        //  {{exp1}} {{exp2}}
        // </div>

        // Translated to:
        // <div i18n>
        //  start {{exp2}} middle {{exp1}} end
        // </div>
        template: (rf: RenderFlags, ctx: MyApp) => {
          if (rf & RenderFlags.Create) {
            if (!i18n_1) {
              i18n_1 = i18nMapping(MSG_DIV_SECTION_1, null, [{'EXP_1': 1, 'EXP_2': 2}]);
            }

            elementStart(0, 'div');
            {
              // Start of translated section 1
              // One text node is added per expression in the interpolation
              text(1);  // EXP_1
              text(2);  // EXP_2
              // End of translated section 1
            }
            elementEnd();
            i18nApply(1, i18n_1[0]);
          }
          if (rf & RenderFlags.Update) {
            textBinding(1, bind(ctx.exp1));
            textBinding(2, bind(ctx.exp2));
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp);
    expect(fixture.html).toEqual('<div>start 2 middle 1 end</div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div>start 2 middle 1 end</div>');

    // Change the expressions
    fixture.component.exp1 = 'expr 1';
    fixture.component.exp2 = 'expr 2';
    fixture.update();
    expect(fixture.html).toEqual('<div>start expr 2 middle expr 1 end</div>');
  });

  it('should support expressions on removed nodes', () => {
    const MSG_DIV_SECTION_1 = `message`;
    let i18n_1: I18nInstruction[][];

    class MyApp {
      exp1 = '1';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        consts: 2,
        vars: 1,
        selectors: [['my-app']],
        // Initial template:
        // <div i18n>
        //  {{exp1}}
        // </div>

        // Translated to:
        // <div i18n>
        //   message
        // </div>
        template: (rf: RenderFlags, ctx: MyApp) => {
          if (rf & RenderFlags.Create) {
            if (!i18n_1) {
              i18n_1 = i18nMapping(MSG_DIV_SECTION_1, null, [{'EXP_1': 1}]);
            }

            elementStart(0, 'div');
            {
              // Start of translated section 1
              text(1);  // EXP_1 will be removed
              // End of translated section 1
            }
            elementEnd();
            i18nApply(1, i18n_1[0]);
          }
          if (rf & RenderFlags.Update) {
            textBinding(1, bind(ctx.exp1));
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp);
    expect(fixture.html).toEqual('<div>message</div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div>message</div>');

    // Change the expressions
    fixture.component.exp1 = 'expr 1';
    fixture.update();
    expect(fixture.html).toEqual('<div>message</div>');
  });

  it('should support expressions in attributes', () => {
    const MSG_DIV_SECTION_1 = `start {$EXP_2} middle {$EXP_1} end`;
    const i18n_1 = i18nExpMapping(MSG_DIV_SECTION_1, {'EXP_1': 0, 'EXP_2': 1});

    class MyApp {
      exp1: any = '1';
      exp2: any = '2';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 1,
        vars: 2,
        // Initial template:
        // <div i18n i18n-title title="{{exp1}}{{exp2}}"></div>

        // Translated to:
        // <div i18n i18n-title title="start {{exp2}} middle {{exp1}} end"></div>
        template: (rf: RenderFlags, ctx: MyApp) => {
          if (rf & RenderFlags.Create) {
            element(0, 'div');  // translated section 1
          }
          if (rf & RenderFlags.Update) {
            elementProperty(0, 'title', i18nInterpolation2(i18n_1, ctx.exp1, ctx.exp2));
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp);
    expect(fixture.html).toEqual('<div title="start 2 middle 1 end"></div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div title="start 2 middle 1 end"></div>');

    // Change the expressions
    fixture.component.exp1 = function test() {};
    fixture.component.exp2 = null;
    fixture.update();
    expect(fixture.html).toEqual('<div title="start  middle test end"></div>');
  });

  it('should support both html elements, expressions and expressions in attributes', () => {
    const MSG_DIV_SECTION_1 = `{$EXP_1} {$START_P}trad {$EXP_2}{$END_P}`;
    const MSG_ATTR_1 = `start {$EXP_2} middle {$EXP_1} end`;
    let i18n_1: I18nInstruction[][];
    let i18n_2: I18nExpInstruction[];

    class MyApp {
      exp1 = '1';
      exp2 = '2';
      exp3 = '3';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 8,
        vars: 4,
        // Initial template:
        // <div i18n i18n-title title="{{exp1}}{{exp2}}">
        //  {{exp1}}
        //  <remove-me-1>
        //    <remove-me-2></remove-me-2>
        //    <remove-me-3></remove-me-3>
        //  </remove-me-1>
        //  <p>
        //    {{exp2}}
        //  </p>
        //  {{exp3}}
        // </div>

        // Translated to:
        // <div i18n i18n-title title="start {{exp2}} middle {{exp1}} end">
        //  {{exp1}}
        //  <p>
        //    trad {{exp2}}
        //  </p>
        // </div>
        template: (rf: RenderFlags, ctx: MyApp) => {
          if (rf & RenderFlags.Create) {
            if (!i18n_1) {
              i18n_1 = i18nMapping(
                  MSG_DIV_SECTION_1, [{
                    'START_REMOVE_ME_1': 2,
                    'START_REMOVE_ME_2': 3,
                    'START_REMOVE_ME_3': 4,
                    'START_P': 5
                  }],
                  [{'EXP_1': 1, 'EXP_2': 6, 'EXP_3': 7}]);
            }
            if (!i18n_2) {
              i18n_2 = i18nExpMapping(MSG_ATTR_1, {'EXP_1': 0, 'EXP_2': 1});
            }

            elementStart(0, 'div');
            {
              // Start of translated section 1
              text(1);                         // EXP_1
              elementStart(2, 'remove-me-1');  // START_REMOVE_ME_1
              {
                element(3, 'remove-me-2');  // START_REMOVE_ME_2
                element(4, 'remove-me-3');  // START_REMOVE_ME_3
              }
              elementEnd();
              elementStart(5, 'p');  // START_P
              { text(6); }           // EXP_2
              elementEnd();
              text(7);  // EXP_3
              // End of translated section 1
            }
            elementEnd();
            i18nApply(1, i18n_1[0]);
          }
          if (rf & RenderFlags.Update) {
            textBinding(1, bind(ctx.exp1));
            textBinding(6, bind(ctx.exp2));
            textBinding(7, bind(ctx.exp3));
            elementProperty(0, 'title', i18nInterpolation2(i18n_2, ctx.exp1, ctx.exp2));
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp);
    expect(fixture.html).toEqual('<div title="start 2 middle 1 end">1 <p>trad 2</p></div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div title="start 2 middle 1 end">1 <p>trad 2</p></div>');

    // Change the expressions
    fixture.component.exp1 = 'expr 1';
    fixture.component.exp2 = 'expr 2';
    fixture.update();
    expect(fixture.html)
        .toEqual('<div title="start expr 2 middle expr 1 end">expr 1 <p>trad expr 2</p></div>');
  });

  it('should support multiple i18n elements', () => {
    const MSG_DIV_SECTION_1 = `trad {$EXP_1}`;
    const MSG_DIV_SECTION_2 = `{$START_C}trad{$END_C}`;
    const MSG_ATTR_1 = `start {$EXP_2} middle {$EXP_1} end`;
    let i18n_1: I18nInstruction[][];
    let i18n_2: I18nInstruction[][];
    let i18n_3: I18nExpInstruction[];

    class MyApp {
      exp1 = '1';
      exp2 = '2';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 6,
        vars: 2,
        // Initial template:
        // <div>
        //  <a i18n>
        //    {{exp1}}
        //  </a>
        //  hello
        //  <b i18n i18n-title title="{{exp1}}{{exp2}}">
        //    <c></c>
        //  </b>
        // </div>

        // Translated to:
        // <div>
        //  <a i18n>
        //    trad {{exp1}}
        //  </a>
        //  hello
        //  <b i18n i18n-title title="start {{exp2}} middle {{exp1}} end">
        //    <c>trad</c>
        //  </b>
        // </div>
        template: (rf: RenderFlags, ctx: MyApp) => {
          if (rf & RenderFlags.Create) {
            if (!i18n_1) {
              i18n_1 = i18nMapping(MSG_DIV_SECTION_1, null, [{'EXP_1': 2}]);
            }
            if (!i18n_2) {
              i18n_2 = i18nMapping(MSG_DIV_SECTION_2, [{'START_C': 5}]);
            }
            if (!i18n_3) {
              i18n_3 = i18nExpMapping(MSG_ATTR_1, {'EXP_1': 0, 'EXP_2': 1});
            }

            elementStart(0, 'div');
            {
              elementStart(1, 'a');
              {
                // Start of translated section 1
                text(2);  // EXP_1
                // End of translated section 1
              }
              elementEnd();
              text(3, 'hello');
              elementStart(4, 'b');
              {
                // Start of translated section 2
                element(5, 'c');  // START_C
                // End of translated section 2
              }
              elementEnd();
            }
            elementEnd();
            i18nApply(2, i18n_1[0]);
            i18nApply(5, i18n_2[0]);
          }
          if (rf & RenderFlags.Update) {
            textBinding(2, bind(ctx.exp1));
            elementProperty(4, 'title', i18nInterpolation2(i18n_3, ctx.exp1, ctx.exp2));
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp);
    expect(fixture.html)
        .toEqual('<div><a>trad 1</a>hello<b title="start 2 middle 1 end"><c>trad</c></b></div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html)
        .toEqual('<div><a>trad 1</a>hello<b title="start 2 middle 1 end"><c>trad</c></b></div>');

    // Change the expressions
    fixture.component.exp1 = 'expr 1';
    fixture.component.exp2 = 'expr 2';
    fixture.update();
    expect(fixture.html)
        .toEqual(
            '<div><a>trad expr 1</a>hello<b title="start expr 2 middle expr 1 end"><c>trad</c></b></div>');
  });

  describe('view containers / embedded templates', () => {
    it('should support containers', () => {
      const MSG_DIV_SECTION_1 = `valeur: {$EXP_1}`;
      // The indexes are based on the main template function
      let i18n_1: I18nInstruction[][];

      class MyApp {
        exp1 = '1';

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 3,
          vars: 0,
          // Initial template:
          // before (
          // % if (condition) { // with i18n
          //   value: {{exp1}}
          // % }
          // ) after

          // Translated :
          // before (
          // % if (condition) { // with i18n
          //   valeur: {{exp1}}
          // % }
          // ) after
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              if (!i18n_1) {
                i18n_1 = i18nMapping(MSG_DIV_SECTION_1, null, [{'EXP_1': 0}]);
              }

              text(0, 'before (');
              container(1);
              text(2, ') after');
            }
            if (rf & RenderFlags.Update) {
              containerRefreshStart(1);
              {
                let rf0 = embeddedViewStart(0, 1, 1);
                if (rf0 & RenderFlags.Create) {
                  // Start of translated section 1
                  text(0);  // EXP_1
                  // End of translated section 1
                  i18nApply(0, i18n_1[0]);
                }
                if (rf0 & RenderFlags.Update) {
                  textBinding(0, bind(myApp.exp1));
                }
                embeddedViewEnd();
              }
              containerRefreshEnd();
            }
          }
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('before (valeur: 1) after');

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html).toEqual('before (valeur: 1) after');
    });

    it('should support ng-container', () => {
      const MSG_DIV_SECTION_1 = `{$START_B}{$END_B}`;
      // With ng-container the i18n node doesn't create any element at runtime which means that
      // its children are not the only children of their parent, some nodes which are not
      // translated might also be the children of the same parent.
      // This is why we need to pass the `lastChildIndex` to `i18nMapping`
      let i18n_1: I18nInstruction[][];
      // Initial template:
      // <div i18n>
      //  <a></a>
      //  <ng-container i18n>
      //    <b></b>
      //    <c></c>
      //  </ng-container>
      //  <d></d>
      // </div>

      // Translated to:
      // <div i18n>
      //  <a></a>
      //  <ng-container i18n>
      //    <b></b>
      //  </ng-container>
      //  <d></d>
      // </div>
      function createTemplate() {
        if (!i18n_1) {
          i18n_1 = i18nMapping(MSG_DIV_SECTION_1, [{'START_B': 2, 'START_C': 3}], null, null, 4);
        }

        elementStart(0, 'div');
        {
          element(1, 'a');
          {
            // Start of translated section 1
            element(2, 'b');  // START_B
            element(3, 'c');  // START_C
            // End of translated section 1
          }
          element(4, 'd');
        }
        elementEnd();
        i18nApply(2, i18n_1[0]);
      }

      const fixture = new TemplateFixture(createTemplate, () => {}, 5);
      expect(fixture.html).toEqual('<div><a></a><b></b><d></d></div>');
    });

    it('should support embedded templates', () => {
      const MSG_DIV_SECTION_1 = `{$START_LI}valeur: {$EXP_1}!{$END_LI}`;
      // The indexes are based on each template function
      let i18n_1: I18nInstruction[][];

      function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
        if (rf1 & RenderFlags.Create) {
          // This is a container so the whole template is a translated section
          // Start of translated section 2
          elementStart(0, 'li');  // START_LI
          { text(1); }            // EXP_1
          elementEnd();
          // End of translated section 2
          i18nApply(0, i18n_1[1]);
        }
        if (rf1 & RenderFlags.Update) {
          textBinding(1, bind(row.$implicit));
        }
      }

      class MyApp {
        items: string[] = ['1', '2'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 2,
          vars: 1,
          // Initial template:
          // <ul i18n>
          //   <li *ngFor="let item of items">value: {{item}}</li>
          // </ul>

          // Translated to:
          // <ul i18n>
          //   <li *ngFor="let item of items">valeur: {{item}}!</li>
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              if (!i18n_1) {
                i18n_1 = i18nMapping(
                    MSG_DIV_SECTION_1, [{'START_LI': 1}, {'START_LI': 0}], [null, {'EXP_1': 1}],
                    ['START_LI']);
              }

              elementStart(0, 'ul');
              {
                // Start of translated section 1
                template(1, liTemplate, 2, 1, null, ['ngForOf', '']);  // START_LI
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(myApp.items));
            }
          },
          directives: () => [NgForOf]
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('<ul><li>valeur: 1!</li><li>valeur: 2!</li></ul>');

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>valeur: 1!</li><li>valeur: 2!</li></ul>');

      // Remove the last item
      fixture.component.items.length = 1;
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>valeur: 1!</li></ul>');

      // Change an item
      fixture.component.items[0] = 'one';
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>valeur: one!</li></ul>');

      // Add an item
      fixture.component.items.push('two');
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>valeur: one!</li><li>valeur: two!</li></ul>');
    });

    it('should support sibling embedded templates', () => {
      const MSG_DIV_SECTION_1 =
          `{$START_LI_0}valeur: {$EXP_1}!{$END_LI_0}{$START_LI_1}valeur bis: {$EXP_2}!{$END_LI_1}`;
      // The indexes are based on each template function
      let i18n_1: I18nInstruction[][];

      function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
        if (rf1 & RenderFlags.Create) {
          // This is a container so the whole template is a translated section
          // Start of translated section 2
          elementStart(0, 'li');  // START_LI_0
          { text(1); }            // EXP_1
          elementEnd();
          // End of translated section 2
          i18nApply(0, i18n_1[1]);
        }
        if (rf1 & RenderFlags.Update) {
          textBinding(1, bind(row.$implicit));
        }
      }

      function liTemplateBis(rf1: RenderFlags, row: NgForOfContext<string>) {
        if (rf1 & RenderFlags.Create) {
          // This is a container so the whole template is a translated section
          // Start of translated section 3
          elementStart(0, 'li');  // START_LI_1
          { text(1); }            // EXP_2
          elementEnd();
          // End of translated section 3
          i18nApply(0, i18n_1[2]);
        }
        if (rf1 & RenderFlags.Update) {
          textBinding(1, bind(row.$implicit));
        }
      }

      class MyApp {
        items: string[] = ['1', '2'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 3,
          vars: 2,
          // Initial template:
          // <ul i18n>
          //   <li *ngFor="let item of items">value: {{item}}</li>
          //   <li *ngFor="let item of items">value bis: {{item}}</li>
          // </ul>

          // Translated to:
          // <ul i18n>
          //   <li *ngFor="let item of items">valeur: {{item}}!</li>
          //   <li *ngFor="let item of items">valeur bis: {{item}}!</li>
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              if (!i18n_1) {
                i18n_1 = i18nMapping(
                    MSG_DIV_SECTION_1,
                    [{'START_LI_0': 1, 'START_LI_1': 2}, {'START_LI_0': 0}, {'START_LI_1': 0}],
                    [null, {'EXP_1': 1}, {'EXP_2': 1}], ['START_LI_0', 'START_LI_1']);
              }

              elementStart(0, 'ul');
              {
                // Start of translated section 1
                template(1, liTemplate, 2, 1, null, ['ngForOf', '']);     // START_LI_0
                template(2, liTemplateBis, 2, 1, null, ['ngForOf', '']);  // START_LI_1
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(myApp.items));
              elementProperty(2, 'ngForOf', bind(myApp.items));
            }
          },
          directives: () => [NgForOf]
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html)
          .toEqual(
              '<ul><li>valeur: 1!</li><li>valeur: 2!</li><li>valeur bis: 1!</li><li>valeur bis: 2!</li></ul>');

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li>valeur: 1!</li><li>valeur: 2!</li><li>valeur bis: 1!</li><li>valeur bis: 2!</li></ul>');

      // Remove the last item
      fixture.component.items.length = 1;
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>valeur: 1!</li><li>valeur bis: 1!</li></ul>');

      // Change an item
      fixture.component.items[0] = 'one';
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>valeur: one!</li><li>valeur bis: one!</li></ul>');

      // Add an item
      fixture.component.items.push('two');
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li>valeur: one!</li><li>valeur: two!</li><li>valeur bis: one!</li><li>valeur bis: two!</li></ul>');
    });

    it('should support changing the order of multiple template roots in the same template', () => {
      const MSG_DIV_SECTION_1 =
          `{$START_LI_1}valeur bis: {$EXP_2}!{$END_LI_1}{$START_LI_0}valeur: {$EXP_1}!{$END_LI_0}`;
      // The indexes are based on each template function
      let i18n_1: I18nInstruction[][];

      function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
        if (rf1 & RenderFlags.Create) {
          // This is a container so the whole template is a translated section
          // Start of translated section 2
          elementStart(0, 'li');  // START_LI_0
          { text(1); }            // EXP_1
          elementEnd();
          // End of translated section 2
          i18nApply(0, i18n_1[1]);
        }
        if (rf1 & RenderFlags.Update) {
          textBinding(1, bind(row.$implicit));
        }
      }

      function liTemplateBis(rf1: RenderFlags, row: NgForOfContext<string>) {
        if (rf1 & RenderFlags.Create) {
          // This is a container so the whole template is a translated section
          // Start of translated section 3
          elementStart(0, 'li');  // START_LI_1
          { text(1); }            // EXP_2
          elementEnd();
          // End of translated section 3
          i18nApply(0, i18n_1[2]);
        }
        if (rf1 & RenderFlags.Update) {
          textBinding(1, bind(row.$implicit));
        }
      }

      class MyApp {
        items: string[] = ['1', '2'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 3,
          vars: 2,
          // Initial template:
          // <ul i18n>
          //   <li *ngFor="let item of items">value: {{item}}</li>
          //   <li *ngFor="let item of items">value bis: {{item}}</li>
          // </ul>

          // Translated to:
          // <ul i18n>
          //   <li *ngFor="let item of items">valeur bis: {{item}}!</li>
          //   <li *ngFor="let item of items">valeur: {{item}}!</li>
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              if (!i18n_1) {
                i18n_1 = i18nMapping(
                    MSG_DIV_SECTION_1,
                    [{'START_LI_0': 1, 'START_LI_1': 2}, {'START_LI_0': 0}, {'START_LI_1': 0}],
                    [null, {'EXP_1': 1}, {'EXP_2': 1}], ['START_LI_0', 'START_LI_1']);
              }

              elementStart(0, 'ul');
              {
                // Start of translated section 1
                template(1, liTemplate, 2, 1, null, ['ngForOf', '']);     // START_LI_0
                template(2, liTemplateBis, 2, 1, null, ['ngForOf', '']);  // START_LI_1
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(myApp.items));
              elementProperty(2, 'ngForOf', bind(myApp.items));
            }
          },
          directives: () => [NgForOf]
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html)
          .toEqual(
              '<ul><li>valeur bis: 1!</li><li>valeur bis: 2!</li><li>valeur: 1!</li><li>valeur: 2!</li></ul>');

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li>valeur bis: 1!</li><li>valeur bis: 2!</li><li>valeur: 1!</li><li>valeur: 2!</li></ul>');

      // Remove the last item
      fixture.component.items.length = 1;
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>valeur bis: 1!</li><li>valeur: 1!</li></ul>');

      // Change an item
      fixture.component.items[0] = 'one';
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>valeur bis: one!</li><li>valeur: one!</li></ul>');

      // Add an item
      fixture.component.items.push('two');
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li>valeur bis: one!</li><li>valeur bis: two!</li><li>valeur: one!</li><li>valeur: two!</li></ul>');
    });

    it('should support nested embedded templates', () => {
      const MSG_DIV_SECTION_1 = `{$START_LI}{$START_SPAN}valeur: {$EXP_1}!{$END_SPAN}{$END_LI}`;
      // The indexes are based on each template function
      let i18n_1: I18nInstruction[][];

      function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
        if (rf1 & RenderFlags.Create) {
          // This is a container so the whole template is a translated section
          // Start of translated section 2
          elementStart(0, 'li');  // START_LI
          {
            template(1, spanTemplate, 2, 1, null, ['ngForOf', '']);  // START_SPAN
          }
          elementEnd();
          // End of translated section 2
          i18nApply(0, i18n_1[1]);
        }
        if (rf1 & RenderFlags.Update) {
          const myApp = nextContext();
          elementProperty(1, 'ngForOf', bind(myApp.items));
        }
      }

      function spanTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
        if (rf1 & RenderFlags.Create) {
          // This is a container so the whole template is a translated section
          // Start of translated section 3
          elementStart(0, 'span');  // START_SPAN
          { text(1); }              // EXP_1
          elementEnd();
          // End of translated section 3
          i18nApply(0, i18n_1[2]);
        }
        if (rf1 & RenderFlags.Update) {
          textBinding(1, bind(row.$implicit));
        }
      }

      class MyApp {
        items: string[] = ['1', '2'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 2,
          vars: 1,
          // Initial template:
          // <ul i18n>
          //   <li *ngFor="let item of items">
          //     <span *ngFor="let item of items">value: {{item}}</span>
          //   </li>
          // </ul>

          // Translated to:
          // <ul i18n>
          //   <li *ngFor="let item of items">
          //     <span *ngFor="let item of items">valeur: {{item}}!</span>
          //   </li>
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              if (!i18n_1) {
                i18n_1 = i18nMapping(
                    MSG_DIV_SECTION_1,
                    [{'START_LI': 1}, {'START_LI': 0, 'START_SPAN': 1}, {'START_SPAN': 0}],
                    [null, null, {'EXP_1': 1}], ['START_LI', 'START_SPAN']);
              }

              elementStart(0, 'ul');
              {
                // Start of translated section 1
                template(1, liTemplate, 2, 1, null, ['ngForOf', '']);  // START_LI
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(myApp.items));
            }
          },
          directives: () => [NgForOf]
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html)
          .toEqual(
              '<ul><li><span>valeur: 1!</span><span>valeur: 2!</span></li><li><span>valeur: 1!</span><span>valeur: 2!</span></li></ul>');

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li><span>valeur: 1!</span><span>valeur: 2!</span></li><li><span>valeur: 1!</span><span>valeur: 2!</span></li></ul>');

      // Remove the last item
      fixture.component.items.length = 1;
      fixture.update();
      expect(fixture.html).toEqual('<ul><li><span>valeur: 1!</span></li></ul>');

      // Change an item
      fixture.component.items[0] = 'one';
      fixture.update();
      expect(fixture.html).toEqual('<ul><li><span>valeur: one!</span></li></ul>');

      // Add an item
      fixture.component.items.push('two');
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li><span>valeur: one!</span><span>valeur: two!</span></li><li><span>valeur: one!</span><span>valeur: two!</span></li></ul>');
    });

    it('should be able to move template roots around', () => {
      const MSG_DIV_SECTION_1 =
          `{$START_LI_0}début{$END_LI_0}{$START_LI_1}valeur: {$EXP_1}{$END_LI_1}fin`;
      // The indexes are based on each template function
      let i18n_1: I18nInstruction[][];

      function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
        if (rf1 & RenderFlags.Create) {
          // This is a container so the whole template is a translated section
          // Start of translated section 2
          elementStart(0, 'li');  // START_LI_1
          { text(1); }            // EXP_1
          elementEnd();
          // End of translated section 2
          i18nApply(0, i18n_1[1]);
        }
        if (rf1 & RenderFlags.Update) {
          textBinding(1, bind(row.$implicit));
        }
      }

      class MyApp {
        items: string[] = ['first', 'second'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 5,
          vars: 1,
          // Initial template:
          // <ul i18n>
          //   <li>start</li>
          //   <li *ngFor="let item of items">value: {{item}}</li>
          //   <li>delete me</li>
          // </ul>

          // Translated to:
          // <ul i18n>
          //   <li>début</li>
          //   <li *ngFor="let item of items">valeur: {{item}}</li>
          //   fin
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              if (!i18n_1) {
                i18n_1 = i18nMapping(
                    MSG_DIV_SECTION_1,
                    [{'START_LI_0': 1, 'START_LI_1': 2, 'START_LI_2': 3}, {'START_LI_1': 0}],
                    [null, {'EXP_1': 1}], ['START_LI_1']);
              }

              elementStart(0, 'ul');
              {
                // Start of translated section 1
                element(1, 'li');                                      // START_LI_0
                template(2, liTemplate, 2, 1, null, ['ngForOf', '']);  // START_LI_1
                elementStart(3, 'li');                                 // START_LI_2
                { text(4, 'delete me'); }
                elementEnd();
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(2, 'ngForOf', bind(myApp.items));
            }
          },
          directives: () => [NgForOf]
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html)
          .toEqual('<ul><li>début</li><li>valeur: first</li><li>valeur: second</li>fin</ul>');

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html)
          .toEqual('<ul><li>début</li><li>valeur: first</li><li>valeur: second</li>fin</ul>');

      // Remove the last item
      fixture.component.items.length = 1;
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>début</li><li>valeur: first</li>fin</ul>');

      // Change an item
      fixture.component.items[0] = 'one';
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>début</li><li>valeur: one</li>fin</ul>');

      // Add an item
      fixture.component.items.push('two');
      fixture.update();
      expect(fixture.html)
          .toEqual('<ul><li>début</li><li>valeur: one</li><li>valeur: two</li>fin</ul>');
    });

    it('should be able to remove template roots', () => {
      const MSG_DIV_SECTION_1 = `loop`;
      // The indexes are based on each template function
      let i18n_1: I18nInstruction[][];
      function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
        if (rf1 & RenderFlags.Create) {
          // This is a container so the whole template is a translated section
          // Start of translated section 2
          elementStart(0, 'li');  // START_LI
          { text(1); }            // EXP_1
          elementEnd();
          // End of translated section 2
          i18nApply(0, i18n_1[1]);
        }
        if (rf1 & RenderFlags.Update) {
          textBinding(1, bind(row.$implicit));
        }
      }

      class MyApp {
        items: string[] = ['first', 'second'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 2,
          vars: 1,
          // Initial template:
          // <ul i18n>
          //   <li *ngFor="let item of items">value: {{item}}</li>
          // </ul>

          // Translated to:
          // <ul i18n>
          //   loop
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              if (!i18n_1) {
                i18n_1 = i18nMapping(
                    MSG_DIV_SECTION_1, [{'START_LI': 1}, {'START_LI': 0}], [null, {'EXP_1': 1}],
                    ['START_LI']);
              }

              elementStart(0, 'ul');
              {
                // Start of translated section 1
                template(1, liTemplate, 2, 1, undefined, ['ngForOf', '']);  // START_LI
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(myApp.items));
            }
          },
          directives: () => [NgForOf]
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('<ul>loop</ul>');

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html).toEqual('<ul>loop</ul>');

      // Remove the last item
      fixture.component.items.length = 1;
      fixture.update();
      expect(fixture.html).toEqual('<ul>loop</ul>');

      // Change an item
      fixture.component.items[0] = 'one';
      fixture.update();
      expect(fixture.html).toEqual('<ul>loop</ul>');

      // Add an item
      fixture.component.items.push('two');
      fixture.update();
      expect(fixture.html).toEqual('<ul>loop</ul>');
    });
  });

  describe('projection', () => {
    it('should project the translations', () => {
      @Component({selector: 'child', template: '<p><ng-content></ng-content></p>'})
      class Child {
        static ngComponentDef = defineComponent({
          type: Child,
          selectors: [['child']],
          factory: () => new Child(),
          consts: 2,
          vars: 0,
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef();
              elementStart(0, 'p');
              { projection(1); }
              elementEnd();
            }
          }
        });
      }

      const MSG_DIV_SECTION_1 =
          `{$START_CHILD}Je suis projeté depuis {$START_B}{$EXP_1}{$END_B}{$END_CHILD}`;
      let i18n_1: I18nInstruction[][];
      const MSG_ATTR_1 = `Enfant de {$EXP_1}`;
      let i18n_2: I18nExpInstruction[];

      @Component({
        selector: 'parent',
        template: `
        <div i18n>
          <child>I am projected from <b i18n-title title="Child of {{name}}">{{name}}<remove-me-1></remove-me-1></b><remove-me-2></remove-me-2></child>
          <remove-me-3></remove-me-3>
        </div>`
        // Translated to:
        // <div i18n>
        //   <child>
        //     Je suis projeté depuis <b i18n-title title="Enfant de {{name}}">{{name}}</b>
        //   </child>
        // </div>
      })
      class Parent {
        name: string = 'Parent';
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          directives: [Child],
          factory: () => new Parent(),
          consts: 7,
          vars: 2,
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              if (!i18n_1) {
                i18n_1 = i18nMapping(
                    MSG_DIV_SECTION_1, [{
                      'START_CHILD': 1,
                      'START_B': 2,
                      'START_REMOVE_ME_1': 4,
                      'START_REMOVE_ME_2': 5,
                      'START_REMOVE_ME_3': 6
                    }],
                    [{'EXP_1': 3}]);
              }
              if (!i18n_2) {
                i18n_2 = i18nExpMapping(MSG_ATTR_1, {'EXP_1': 0});
              }

              elementStart(0, 'div');
              {
                // Start of translated section 1
                elementStart(1, 'child');  // START_CHILD
                {
                  elementStart(2, 'b');  // START_B
                  {
                    text(3);                    // EXP_1
                    element(4, 'remove-me-1');  // START_REMOVE_ME_1
                  }
                  elementEnd();
                  element(5, 'remove-me-2');  // START_REMOVE_ME_2
                }
                elementEnd();
                element(6, 'remove-me-3');  // START_REMOVE_ME_3
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(2, 'title', i18nInterpolation1(i18n_2, cmp.name));
              textBinding(3, bind(cmp.name));
            }
          }
        });
      }

      const fixture = new ComponentFixture(Parent);
      expect(fixture.html)
          .toEqual(
              '<div><child><p>Je suis projeté depuis <b title="Enfant de Parent">Parent</b></p></child></div>');
    });

    it('should project a translated i18n block', () => {
      @Component({selector: 'child', template: '<p><ng-content></ng-content></p>'})
      class Child {
        static ngComponentDef = defineComponent({
          type: Child,
          selectors: [['child']],
          factory: () => new Child(),
          consts: 2,
          vars: 0,
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef();
              elementStart(0, 'p');
              { projection(1); }
              elementEnd();
            }
          }
        });
      }

      const MSG_DIV_SECTION_1 = `Je suis projeté depuis {$EXP_1}`;
      let i18n_1: I18nInstruction[][];
      const MSG_ATTR_1 = `Enfant de {$EXP_1}`;
      let i18n_2: I18nExpInstruction[];

      @Component({
        selector: 'parent',
        template: `
        <div>
          <child><any></any><b i18n i18n-title title="Child of {{name}}">I am projected from {{name}}</b><any></any></child>
        </div>`
        // Translated to:
        // <div>
        //   <child>
        //     <any></any>
        //     <b i18n i18n-title title="Enfant de {{name}}">Je suis projeté depuis {{name}}</b>
        //     <any></any>
        //   </child>
        // </div>
      })
      class Parent {
        name: string = 'Parent';
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          directives: [Child],
          factory: () => new Parent(),
          consts: 6,
          vars: 2,
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              if (!i18n_1) {
                i18n_1 = i18nMapping(MSG_DIV_SECTION_1, null, [{'EXP_1': 4}]);
              }
              if (!i18n_2) {
                i18n_2 = i18nExpMapping(MSG_ATTR_1, {'EXP_1': 0});
              }

              elementStart(0, 'div');
              {
                elementStart(1, 'child');
                {
                  element(2, 'any');
                  elementStart(3, 'b');
                  {
                    // Start of translated section 1
                    text(4);  // EXP_1
                    // End of translated section 1
                  }
                  elementEnd();
                  element(5, 'any');
                }
                elementEnd();
              }
              elementEnd();
              i18nApply(4, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(3, 'title', i18nInterpolation1(i18n_2, cmp.name));
              textBinding(4, bind(cmp.name));
            }
          }
        });
      }

      const fixture = new ComponentFixture(Parent);
      expect(fixture.html)
          .toEqual(
              '<div><child><p><any></any><b title="Enfant de Parent">Je suis projeté depuis Parent</b><any></any></p></child></div>');
    });

    it('should re-project translations when multiple projections', () => {
      @Component({selector: 'grand-child', template: '<div><ng-content></ng-content></div>'})
      class GrandChild {
        static ngComponentDef = defineComponent({
          type: GrandChild,
          selectors: [['grand-child']],
          factory: () => new GrandChild(),
          consts: 2,
          vars: 0,
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef();
              elementStart(0, 'div');
              { projection(1); }
              elementEnd();
            }
          }
        });
      }

      @Component(
          {selector: 'child', template: '<grand-child><ng-content></ng-content></grand-child>'})
      class Child {
        static ngComponentDef = defineComponent({
          type: Child,
          selectors: [['child']],
          directives: [GrandChild],
          factory: () => new Child(),
          consts: 2,
          vars: 0,
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef();
              elementStart(0, 'grand-child');
              { projection(1); }
              elementEnd();
            }
          }
        });
      }

      const MSG_DIV_SECTION_1 = `{$START_B}Bonjour{$END_B} Monde!`;
      let i18n_1: I18nInstruction[][];

      @Component({
        selector: 'parent',
        template: `<child i18n><b>Hello</b> World!</child>`
        // Translated to:
        // <child i18n><grand-child><div><b>Bonjour</b> Monde!</div></grand-child></child>
      })
      class Parent {
        name: string = 'Parent';
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          directives: [Child],
          factory: () => new Parent(),
          consts: 2,
          vars: 0,
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              if (!i18n_1) {
                i18n_1 = i18nMapping(MSG_DIV_SECTION_1, [{'START_B': 1}]);
              }

              elementStart(0, 'child');
              {
                // Start of translated section 1
                element(1, 'b');  // START_B
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
          }
        });
      }

      const fixture = new ComponentFixture(Parent);
      expect(fixture.html)
          .toEqual('<child><grand-child><div><b>Bonjour</b> Monde!</div></grand-child></child>');
    });

    it('should project translations with selectors', () => {
      @Component({
        selector: 'child',
        template: `
          <ng-content select="span"></ng-content>
        `
      })
      class Child {
        static ngComponentDef = defineComponent({
          type: Child,
          selectors: [['child']],
          factory: () => new Child(),
          consts: 1,
          vars: 0,
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef([[['span']]], ['span']);
              projection(0, 1);
            }
          }
        });
      }

      const MSG_DIV_SECTION_1 = `{$START_SPAN_0}Contenu{$END_SPAN_0}`;
      let i18n_1: I18nInstruction[][];

      @Component({
        selector: 'parent',
        template: `
          <child i18n>
            <span title="keepMe"></span>
            <span title="deleteMe"></span>
          </child>
        `
        // Translated to:
        // <child i18n><span title="keepMe">Contenu</span></child>
      })
      class Parent {
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          directives: [Child],
          factory: () => new Parent(),
          consts: 3,
          vars: 0,
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              if (!i18n_1) {
                i18n_1 = i18nMapping(MSG_DIV_SECTION_1, [{'START_SPAN_0': 1, 'START_SPAN_1': 2}]);
              }

              elementStart(0, 'child');
              {
                // Start of translated section 1
                element(1, 'span', ['title', 'keepMe']);    // START_SPAN_0
                element(2, 'span', ['title', 'deleteMe']);  // START_SPAN_1
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
          }
        });
      }

      const fixture = new ComponentFixture(Parent);
      expect(fixture.html).toEqual('<child><span title="keepMe">Contenu</span></child>');
    });
  });

  describe('i18nInterpolation', () => {
    it('i18nInterpolation should return the same value as i18nInterpolationV', () => {
      const MSG_DIV_SECTION_1 = `start {$EXP_2} middle {$EXP_1} end`;
      const i18n_1 = i18nExpMapping(MSG_DIV_SECTION_1, {'EXP_1': 0, 'EXP_2': 1});
      let interpolation;
      let interpolationV;

      class MyApp {
        exp1: any = '1';
        exp2: any = '2';

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 1,
          vars: 4,
          // Initial template:
          // <div i18n i18n-title title="{{exp1}}{{exp2}}"></div>

          // Translated to:
          // <div i18n i18n-title title="start {{exp2}} middle {{exp1}} end"></div>
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'div');  // translated section 1
            }
            if (rf & RenderFlags.Update) {
              interpolation = i18nInterpolation2(i18n_1, ctx.exp1, ctx.exp2);
              interpolationV = i18nInterpolationV(i18n_1, [ctx.exp1, ctx.exp2]);
              elementProperty(0, 'title', interpolation);
            }
          }
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(interpolation).toBeDefined();
      expect(interpolation).toEqual(interpolationV);
    });

    it('i18nInterpolation3 should work', () => {
      const MSG_DIV_SECTION_1 = `start {$EXP_1} _ {$EXP_2} _ {$EXP_3} end`;
      const i18n_1 = i18nExpMapping(MSG_DIV_SECTION_1, {'EXP_1': 0, 'EXP_2': 1, 'EXP_3': 2});

      class MyApp {
        exp1: any = '1';
        exp2: any = '2';
        exp3: any = '3';

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 1,
          vars: 3,
          // Initial template:
          // <div i18n i18n-title title="{{exp1}}{{exp2}}{{exp3}}"></div>

          // Translated to:
          // <div i18n i18n-title title="start {{exp1}} _ {{exp2}} _ {{exp3}} end"></div>
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'div');  // translated section 1
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'title', i18nInterpolation3(i18n_1, ctx.exp1, ctx.exp2, ctx.exp3));
            }
          }
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('<div title="start 1 _ 2 _ 3 end"></div>');
    });

    it('i18nInterpolation4 should work', () => {
      const MSG_DIV_SECTION_1 = `start {$EXP_1} _ {$EXP_2} _ {$EXP_3} _ {$EXP_4} end`;
      const i18n_1 =
          i18nExpMapping(MSG_DIV_SECTION_1, {'EXP_1': 0, 'EXP_2': 1, 'EXP_3': 2, 'EXP_4': 3});

      class MyApp {
        exp1: any = '1';
        exp2: any = '2';
        exp3: any = '3';
        exp4: any = '4';

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 1,
          vars: 4,
          // Initial template:
          // <div i18n i18n-title title="{{exp1}}{{exp2}}{{exp3}}{{exp4}}"></div>

          // Translated to:
          // <div i18n i18n-title title="start {{exp1}} _ {{exp2}} _ {{exp3}} _ {{exp4}} end"></div>
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'div');  // translated section 1
            }
            if (rf & RenderFlags.Update) {
              elementProperty(
                  0, 'title', i18nInterpolation4(i18n_1, ctx.exp1, ctx.exp2, ctx.exp3, ctx.exp4));
            }
          }
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('<div title="start 1 _ 2 _ 3 _ 4 end"></div>');
    });

    it('i18nInterpolation5 should work', () => {
      const MSG_DIV_SECTION_1 = `start {$EXP_1} _ {$EXP_2} _ {$EXP_3} _ {$EXP_4} _ {$EXP_5} end`;
      const i18n_1 = i18nExpMapping(
          MSG_DIV_SECTION_1, {'EXP_1': 0, 'EXP_2': 1, 'EXP_3': 2, 'EXP_4': 3, 'EXP_5': 4});

      class MyApp {
        exp1: any = '1';
        exp2: any = '2';
        exp3: any = '3';
        exp4: any = '4';
        exp5: any = '5';

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 1,
          vars: 5,
          // Initial template:
          // <div i18n i18n-title title="{{exp1}}{{exp2}}{{exp3}}{{exp4}}{{exp5}}"></div>

          // Translated to:
          // <div i18n i18n-title title="start {{exp1}} _ {{exp2}} _ {{exp3}} _ {{exp4}} _ {{exp5}}
          // end"></div>
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'div');  // translated section 1
            }
            if (rf & RenderFlags.Update) {
              elementProperty(
                  0, 'title',
                  i18nInterpolation5(i18n_1, ctx.exp1, ctx.exp2, ctx.exp3, ctx.exp4, ctx.exp5));
            }
          }
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('<div title="start 1 _ 2 _ 3 _ 4 _ 5 end"></div>');
    });

    it('i18nInterpolation6 should work', () => {
      const MSG_DIV_SECTION_1 =
          `start {$EXP_1} _ {$EXP_2} _ {$EXP_3} _ {$EXP_4} _ {$EXP_5} _ {$EXP_6} end`;
      const i18n_1 = i18nExpMapping(
          MSG_DIV_SECTION_1,
          {'EXP_1': 0, 'EXP_2': 1, 'EXP_3': 2, 'EXP_4': 3, 'EXP_5': 4, 'EXP_6': 5});

      class MyApp {
        exp1: any = '1';
        exp2: any = '2';
        exp3: any = '3';
        exp4: any = '4';
        exp5: any = '5';
        exp6: any = '6';

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 1,
          vars: 6,
          // Initial template:
          // <div i18n i18n-title title="{{exp1}}{{exp2}}{{exp3}}{{exp4}}{{exp5}}{{exp6}}"></div>

          // Translated to:
          // <div i18n i18n-title title="start {{exp1}} _ {{exp2}} _ {{exp3}} _ {{exp4}} _ {{exp5}}
          // _ {{exp6}} end"></div>
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'div');  // translated section 1
            }
            if (rf & RenderFlags.Update) {
              elementProperty(
                  0, 'title',
                  i18nInterpolation6(
                      i18n_1, ctx.exp1, ctx.exp2, ctx.exp3, ctx.exp4, ctx.exp5, ctx.exp6));
            }
          }
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('<div title="start 1 _ 2 _ 3 _ 4 _ 5 _ 6 end"></div>');
    });

    it('i18nInterpolation7 should work', () => {
      const MSG_DIV_SECTION_1 =
          `start {$EXP_1} _ {$EXP_2} _ {$EXP_3} _ {$EXP_4} _ {$EXP_5} _ {$EXP_6} _ {$EXP_7} end`;
      const i18n_1 = i18nExpMapping(
          MSG_DIV_SECTION_1,
          {'EXP_1': 0, 'EXP_2': 1, 'EXP_3': 2, 'EXP_4': 3, 'EXP_5': 4, 'EXP_6': 5, 'EXP_7': 6});

      class MyApp {
        exp1: any = '1';
        exp2: any = '2';
        exp3: any = '3';
        exp4: any = '4';
        exp5: any = '5';
        exp6: any = '6';
        exp7: any = '7';

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 1,
          vars: 7,
          // Initial template:
          // <div i18n i18n-title
          // title="{{exp1}}{{exp2}}{{exp3}}{{exp4}}{{exp5}}{{exp6}}{{exp7}}"></div>

          // Translated to:
          // <div i18n i18n-title title="start {{exp1}} _ {{exp2}} _ {{exp3}} _ {{exp4}} _ {{exp5}}
          // _ {{exp6}} _ {{exp7}} end"></div>
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'div');  // translated section 1
            }
            if (rf & RenderFlags.Update) {
              elementProperty(
                  0, 'title', i18nInterpolation7(
                                  i18n_1, ctx.exp1, ctx.exp2, ctx.exp3, ctx.exp4, ctx.exp5,
                                  ctx.exp6, ctx.exp7));
            }
          }
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('<div title="start 1 _ 2 _ 3 _ 4 _ 5 _ 6 _ 7 end"></div>');
    });

    it('i18nInterpolation8 should work', () => {
      const MSG_DIV_SECTION_1 =
          `start {$EXP_1} _ {$EXP_2} _ {$EXP_3} _ {$EXP_4} _ {$EXP_5} _ {$EXP_6} _ {$EXP_7} _ {$EXP_8} end`;
      const i18n_1 = i18nExpMapping(MSG_DIV_SECTION_1, {
        'EXP_1': 0,
        'EXP_2': 1,
        'EXP_3': 2,
        'EXP_4': 3,
        'EXP_5': 4,
        'EXP_6': 5,
        'EXP_7': 6,
        'EXP_8': 7
      });

      class MyApp {
        exp1: any = '1';
        exp2: any = '2';
        exp3: any = '3';
        exp4: any = '4';
        exp5: any = '5';
        exp6: any = '6';
        exp7: any = '7';
        exp8: any = '8';

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 1,
          vars: 8,
          // Initial template:
          // <div i18n i18n-title
          // title="{{exp1}}{{exp2}}{{exp3}}{{exp4}}{{exp5}}{{exp6}}{{exp7}}{{exp8}}"></div>

          // Translated to:
          // <div i18n i18n-title title="start {{exp1}} _ {{exp2}} _ {{exp3}} _ {{exp4}} _ {{exp5}}
          // _ {{exp6}} _ {{exp7}} _ {{exp8}} end"></div>
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              element(0, 'div');  // translated section 1
            }
            if (rf & RenderFlags.Update) {
              elementProperty(
                  0, 'title', i18nInterpolation8(
                                  i18n_1, ctx.exp1, ctx.exp2, ctx.exp3, ctx.exp4, ctx.exp5,
                                  ctx.exp6, ctx.exp7, ctx.exp8));
            }
          }
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('<div title="start 1 _ 2 _ 3 _ 4 _ 5 _ 6 _ 7 _ 8 end"></div>');
    });

  });
});
