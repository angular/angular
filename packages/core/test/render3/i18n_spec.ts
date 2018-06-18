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
import {i18nExpMapping, i18nInterpolation, i18nMapping} from '../../src/render3/i18n';
import {bind, container, containerRefreshEnd, containerRefreshStart, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, i18nApply, projection, projectionDef, text, textBinding} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {NgForOf} from './common_with_def';
import {ComponentFixture, TemplateFixture} from './render_util';

describe('Runtime i18n', () => {
  it('should support html elements', () => {
    // Html tags are replaced by placeholders.
    // Open tag placeholders are never re-used (closing tag placeholders can be).
    const MSG_DIV_SECTION_1 = `{$p_3}trad 1{$c_p}{$p_0}trad 2{$p_1}trad 3{$c_p}{$c_p}`;
    const i18n_1 = i18nMapping(MSG_DIV_SECTION_1, [{p_0: 1, p_1: 2, p_2: 3, p_3: 4}]);
    // Initial template:
    // <div i18n>
    //  <a>
    //    <b></b>
    //    <remove-me></remove-me>
    //  </a>
    //  <c></c>
    // </div>
    function createTemplate() {
      elementStart(0, 'div');
      {  // Start of translated section 1
        // - i18n sections do not contain any text() instruction
        elementStart(1, 'a');
        {
          elementStart(2, 'b');
          elementEnd();
          elementStart(3, 'remove-me');
          elementEnd();
        }
        elementEnd();
        elementStart(4, 'c');
        elementEnd();
      }  // End of translated section 1
      elementEnd();
      i18nApply(1, i18n_1[0]);
    }

    const fixture = new TemplateFixture(createTemplate);
    expect(fixture.html).toEqual('<div><c>trad 1</c><a>trad 2<b>trad 3</b></a></div>');
  });

  it('should support interpolations', () => {
    const MSG_DIV_SECTION_1 = `start {$exp_2} middle {$exp_1} end`;
    const i18n_1 = i18nMapping(MSG_DIV_SECTION_1, null, [{exp_1: 1, exp_2: 2}]);

    class MyApp {
      exp1 = '1';
      exp2 = '2';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        // Initial template:
        // <div i18n>
        //  {{exp1}} {{exp2}}
        // </div>
        template: (rf: RenderFlags, ctx: MyApp) => {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div');
            {
              // Start of translated section 1
              // One text node is added per expression in the interpolation
              text(1);
              text(2);
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

  it('should support interpolations on removed nodes', () => {
    const MSG_DIV_SECTION_1 = `message`;
    const i18n_1 = i18nMapping(MSG_DIV_SECTION_1, null, [{exp_1: 1}]);

    class MyApp {
      exp1 = '1';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        // Initial template:
        // <div i18n>
        //  {{exp1}}
        // </div>
        template: (rf: RenderFlags, ctx: MyApp) => {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div');
            {
              // Start of translated section 1
              text(1);  // will be removed
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

  it('should support interpolations in attributes', () => {
    const MSG_DIV_SECTION_1 = `start {$exp_2} middle {$exp_1} end`;
    const i18n_1 = i18nExpMapping(MSG_DIV_SECTION_1, {exp_1: 0, exp_2: 1});

    class MyApp {
      exp1: any = '1';
      exp2: any = '2';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        // Initial template:
        // <div i18n i18n-title title="{{exp1}}{{exp2}}"></div>
        template: (rf: RenderFlags, ctx: MyApp) => {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div');
            // Start of translated section 1
            // End of translated section 1
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            elementProperty(0, 'title', i18nInterpolation(i18n_1, 2, ctx.exp1, ctx.exp2));
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

  it('should support both html elements, interpolations and interpolations in attributes', () => {
    const MSG_DIV_SECTION_1 = `{$exp_1} {$p_3}trad {$exp_2}{$c_p}`;
    const MSG_ATTR_1 = `start {$exp_2} middle {$exp_1} end`;
    const i18n_1 = i18nMapping(
        MSG_DIV_SECTION_1, [{p_0: 2, p_1: 3, p_2: 4, p_3: 5}], [{exp_1: 1, exp_2: 6, exp_3: 7}]);
    const i18n_2 = i18nExpMapping(MSG_ATTR_1, {exp_1: 0, exp_2: 1});

    class MyApp {
      exp1 = '1';
      exp2 = '2';
      exp3 = '3';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
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
        template: (rf: RenderFlags, ctx: MyApp) => {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div');
            {
              // Start of translated section 1
              text(1);
              elementStart(2, 'remove-me-1');
              {
                elementStart(3, 'remove-me-2');
                elementEnd();
                elementStart(4, 'remove-me-3');
                elementEnd();
              }
              elementEnd();
              elementStart(5, 'p');
              { text(6); }
              elementEnd();
              text(7);
              // End of translated section 1
            }
            elementEnd();
            i18nApply(1, i18n_1[0]);
          }
          if (rf & RenderFlags.Update) {
            textBinding(1, bind(ctx.exp1));
            textBinding(6, bind(ctx.exp2));
            textBinding(7, bind(ctx.exp3));
            elementProperty(0, 'title', i18nInterpolation(i18n_2, 2, ctx.exp1, ctx.exp2));
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
    const MSG_DIV_SECTION_1 = `trad {$exp_1}`;
    const MSG_DIV_SECTION_2 = `{$p_0}trad{$c_p}`;
    const MSG_ATTR_1 = `start {$exp_2} middle {$exp_1} end`;
    const i18n_1 = i18nMapping(MSG_DIV_SECTION_1, null, [{exp_1: 2}]);
    const i18n_2 = i18nMapping(MSG_DIV_SECTION_2, [{p_0: 5}]);
    const i18n_3 = i18nExpMapping(MSG_ATTR_1, {exp_1: 0, exp_2: 1});

    class MyApp {
      exp1 = '1';
      exp2 = '2';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        // Initial template:
        // <div i18n i18n-title title="{{exp1}}{{exp2}}>
        //  <a>
        //    {{exp1}}
        //  </a>
        //  hello
        //  <b>
        //    <c></c>
        //  </b>
        // </div>
        template: (rf: RenderFlags, ctx: MyApp) => {
          if (rf & RenderFlags.Create) {
            elementStart(0, 'div');
            {
              elementStart(1, 'a');
              {
                // Start of translated section 1
                text(2);
                // End of translated section 1
              }
              elementEnd();
              text(3, 'hello');
              elementStart(4, 'b');
              {
                // Start of translated section 2
                elementStart(5, 'c');
                elementEnd();
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
            elementProperty(4, 'title', i18nInterpolation(i18n_3, 2, ctx.exp1, ctx.exp2));
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

  describe('containers', () => {
    it('should support containers', () => {
      const MSG_DIV_SECTION_1 = `valeur: {$exp_1}`;
      // The indexes are based on the main template function
      const i18n_1 = i18nMapping(MSG_DIV_SECTION_1, null, [{exp_1: 0}]);

      class MyApp {
        exp1 = '1';

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          // Initial template:
          // before (
          // % if (condition) { // with i18n
          //   value: {{item}}
          // % }
          // ) after
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              text(0, 'before (');
              container(1);
              text(2, ') after');
            }
            if (rf & RenderFlags.Update) {
              containerRefreshStart(1);
              {
                let rf0 = embeddedViewStart(0);
                if (rf0 & RenderFlags.Create) {
                  // Start of translated section 1
                  text(0);
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
      const MSG_DIV_SECTION_1 = `{$p_0}{$c_p}`;
      // With ng-container the i18n node doesn't create any element at runtime which means that
      // its children are not the only children of their parent, some nodes which are not
      // translated might also be the children of the same parent.
      // This is why we need to pass the `lastChildIndex` to `i18nMapping`
      const i18n_1 = i18nMapping(MSG_DIV_SECTION_1, [{p_0: 2, p_1: 3}], null, null, [4]);
      // Initial template:
      // <div i18n>
      //  <a></a>
      //  <ng-container i18n>
      //    <b></b>
      //    <c></c>
      //  </ng-container>
      //  <d></d>
      // </div>
      function createTemplate() {
        elementStart(0, 'div');
        {
          elementStart(1, 'a');
          elementEnd();
          {
            // Start of translated section 1
            elementStart(2, 'b');
            elementEnd();
            elementStart(3, 'c');
            elementEnd();
            // End of translated section 1
          }
          elementStart(4, 'd');
          elementEnd();
        }
        elementEnd();
        i18nApply(2, i18n_1[0]);
      }

      const fixture = new TemplateFixture(createTemplate);
      expect(fixture.html).toEqual('<div><a></a><b></b><d></d></div>');
    });

    it('should support embedded templates', () => {
      const MSG_DIV_SECTION_1 = `{$p_0}valeur: {$exp_1}!{$c_p}`;
      // The indexes are based on each template function
      const i18n_1 =
          i18nMapping(MSG_DIV_SECTION_1, [{p_0: 1}, {p_0: 0}], [null, {exp_1: 1}], ['p_0']);
      class MyApp {
        items: string[] = ['1', '2'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          // Initial template:
          // <ul i18n>
          //   <li>start</li>
          //   <li *ngFor="let item of items">value: {{item}}</li>
          //   end
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'ul');
              {
                // Start of translated section 1
                container(1, liTemplate, null, ['ngForOf', '']);
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(myApp.items));
            }

            function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
              if (rf1 & RenderFlags.Create) {
                // This is a container so the whole template is a translated section
                // Start of translated section 2
                elementStart(0, 'li');
                { text(1); }
                elementEnd();
                // End of translated section 2
                i18nApply(0, i18n_1[1]);
              }
              if (rf1 & RenderFlags.Update) {
                textBinding(1, bind(row.$implicit));
              }
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
      const MSG_DIV_SECTION_1 = `{$p_0}valeur: {$exp_1}!{$c_p}{$p_1}valeur bis: {$exp_2}!{$c_p}`;
      // The indexes are based on each template function
      const i18n_1 = i18nMapping(
          MSG_DIV_SECTION_1, [{p_0: 1, p_1: 2}, {p_0: 0}, {p_1: 0}], [null, {exp_1: 1}, {exp_2: 1}],
          ['p_0', 'p_1']);
      class MyApp {
        items: string[] = ['1', '2'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          // Initial template:
          // <ul i18n>
          //   <li>start</li>
          //   <li *ngFor="let item of items">value: {{item}}</li>
          //   <li *ngFor="let item of items">value bis: {{item}}</li>
          //   end
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'ul');
              {
                // Start of translated section 1
                container(1, liTemplate, null, ['ngForOf', '']);
                container(2, liTemplate2, null, ['ngForOf', '']);
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(myApp.items));
              elementProperty(2, 'ngForOf', bind(myApp.items));
            }

            function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
              if (rf1 & RenderFlags.Create) {
                // This is a container so the whole template is a translated section
                // Start of translated section 2
                elementStart(0, 'li');
                { text(1); }
                elementEnd();
                // End of translated section 2
                i18nApply(0, i18n_1[1]);
              }
              if (rf1 & RenderFlags.Update) {
                textBinding(1, bind(row.$implicit));
              }
            }

            function liTemplate2(rf1: RenderFlags, row: NgForOfContext<string>) {
              if (rf1 & RenderFlags.Create) {
                // This is a container so the whole template is a translated section
                // Start of translated section 3
                elementStart(0, 'li');
                { text(1); }
                elementEnd();
                // End of translated section 3
                i18nApply(0, i18n_1[2]);
              }
              if (rf1 & RenderFlags.Update) {
                textBinding(1, bind(row.$implicit));
              }
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

    // TODO(ocombe): make this work once PR #24346 has landed
    xit('should be able to move template directives around', () => {
      const MSG_DIV_SECTION_1 = `{$p_0}début{$c_p}{$p_1}{$exp_1}{$c_p}fin`;
      // The indexes are based on each template function
      const i18n_1 =
          i18nMapping(MSG_DIV_SECTION_1, [{p_0: 1, p_1: 2, p_2: 3}, {p_1: 0}], [null, {exp_1: 1}]);

      class MyApp {
        items: string[] = ['first', 'second'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          // Initial template:
          // <ul i18n>
          //   <li>start</li>
          //   <li *ngFor="let item of items">value: {{item}}</li>
          //   <li>delete me</li>
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'ul');
              {
                // Start of translated section 1
                elementStart(1, 'li');
                elementEnd();
                container(2, liTemplate, null, ['ngForOf', '']);
                elementStart(3, 'li');
                text(4, 'delete me');
                elementEnd();
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(2, 'ngForOf', bind(myApp.items));
            }

            function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
              if (rf1 & RenderFlags.Create) {
                // This is a container so the whole template is a translated section
                // Start of translated section 2
                elementStart(0, 'li');
                { text(1); }
                elementEnd();
                // End of translated section 2
                i18nApply(0, i18n_1[1]);
              }
              if (rf1 & RenderFlags.Update) {
                textBinding(1, bind(row.$implicit));
              }
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

    it('should be able to remove containers', () => {
      const MSG_DIV_SECTION_1 = `loop`;
      // The indexes are based on each template function
      const i18n_1 =
          i18nMapping(MSG_DIV_SECTION_1, [{p_0: 1}, {p_0: 0}], [null, {exp_1: 1}], ['p_0']);

      class MyApp {
        items: string[] = ['first', 'second'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          // Initial template:
          // <ul i18n>
          //   <li *ngFor="let item of items">value: {{item}}</li>
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'ul');
              {
                // Start of translated section 1
                container(1, liTemplate, undefined, ['ngForOf', '']);
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(myApp.items));
            }

            function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
              if (rf1 & RenderFlags.Create) {
                // This is a container so the whole template is a translated section
                // Start of translated section 2
                elementStart(0, 'li');
                { text(1); }
                elementEnd();
                // End of translated section 2
                i18nApply(0, i18n_1[1]);
              }
              if (rf1 & RenderFlags.Update) {
                textBinding(1, bind(row.$implicit));
              }
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
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef(0);
              elementStart(1, 'p');
              { projection(2, 0); }
              elementEnd();
            }
          }
        });
      }

      const MSG_DIV_SECTION_1 = `{$p_0}Je suis projeté depuis {$p_1}{$exp_1}{$c_p}{$c_p}`;
      const i18n_1 =
          i18nMapping(MSG_DIV_SECTION_1, [{p_0: 1, p_1: 2, p_2: 4, p_3: 5, p_4: 6}], [{exp_1: 3}]);
      const MSG_ATTR_1 = `Enfant de {$exp_1}`;
      const i18n_2 = i18nExpMapping(MSG_ATTR_1, {exp_1: 0});

      @Component({
        selector: 'parent',
        template: `
        <div i18n>
          <child>I am projected from <b i18n-title title="Child of {{name}}">{{name}}<remove-me-1></remove-me-1></b><remove-me-2></remove-me-2></child>
          <remove-me-3></remove-me-3>
        </div>`
      })
      class Parent {
        name: string = 'Parent';
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          directives: [Child],
          factory: () => new Parent(),
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'div');
              {
                // Start of translated section 1
                elementStart(1, 'child');
                {
                  elementStart(2, 'b');
                  {
                    text(3);
                    elementStart(4, 'remove-me-1');
                    elementEnd();
                  }
                  elementEnd();
                  elementStart(5, 'remove-me-2');
                  elementEnd();
                }
                elementEnd();
                elementStart(6, 'remove-me-3');
                elementEnd();
                // End of translated section 1
              }
              elementEnd();
              i18nApply(1, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(2, 'title', i18nInterpolation(i18n_2, 1, cmp.name));
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
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef(0);
              elementStart(1, 'p');
              { projection(2, 0); }
              elementEnd();
            }
          }
        });
      }

      const MSG_DIV_SECTION_1 = `Je suis projeté depuis {$exp_1}`;
      const i18n_1 = i18nMapping(MSG_DIV_SECTION_1, null, [{exp_1: 4}]);
      const MSG_ATTR_1 = `Enfant de {$exp_1}`;
      const i18n_2 = i18nExpMapping(MSG_ATTR_1, {exp_1: 0});

      @Component({
        selector: 'parent',
        template: `
        <div>
          <child><any></any><b i18n i18n-title title="Child of {{name}}">I am projected from {{name}}</b><any></any></child>
        </div>`
      })
      class Parent {
        name: string = 'Parent';
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          directives: [Child],
          factory: () => new Parent(),
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'div');
              {
                elementStart(1, 'child');
                {
                  elementStart(2, 'any');
                  elementEnd();
                  elementStart(3, 'b');
                  {
                    // Start of translated section 1
                    text(4);
                    // End of translated section 1
                  }
                  elementEnd();
                  elementStart(5, 'any');
                  elementEnd();
                }
                elementEnd();
              }
              elementEnd();
              i18nApply(4, i18n_1[0]);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(3, 'title', i18nInterpolation(i18n_2, 1, cmp.name));
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
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef(0);
              elementStart(1, 'div');
              { projection(2, 0); }
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
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef(0);
              elementStart(1, 'grand-child');
              { projection(2, 0); }
              elementEnd();
            }
          }
        });
      }

      const MSG_DIV_SECTION_1 = `{$p_0}Bonjour{$c_p} Monde!`;
      const i18n_1 = i18nMapping(MSG_DIV_SECTION_1, [{p_0: 1}]);

      @Component({selector: 'parent', template: `<child i18n><b>Hello</b> World!</child>`})
      class Parent {
        name: string = 'Parent';
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          directives: [Child],
          factory: () => new Parent(),
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'child');
              {
                // Start of translated section 1
                elementStart(1, 'b');
                elementEnd();
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
  });
});
