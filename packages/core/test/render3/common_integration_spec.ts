/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOfContext} from '@angular/common';
import {ElementRef, TemplateRef} from '@angular/core';

import {AttributeMarker, defineComponent, templateRefExtractor} from '../../src/render3/index';
import {bind, template, elementEnd, elementProperty, elementStart, getCurrentView, interpolation1, interpolation2, interpolation3, interpolationV, listener, load, nextContext, restoreView, text, textBinding, elementContainerStart, elementContainerEnd, reference} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {NgForOf, NgIf, NgTemplateOutlet} from './common_with_def';
import {ComponentFixture} from './render_util';

describe('@angular/common integration', () => {

  describe('NgForOf', () => {
    it('should update a loop', () => {
      function liTemplate(rf: RenderFlags, ctx: NgForOfContext<string>) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'li');
          { text(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const item = ctx.$implicit;
          textBinding(1, bind(item));
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
          // <ul>
          //   <li *ngFor="let item of items">{{item}}</li>
          // </ul>
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'ul');
              { template(1, liTemplate, 2, 1, undefined, ['ngForOf', '']); }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(ctx.items));
            }
          },
          directives: () => [NgForOf]
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('<ul><li>first</li><li>second</li></ul>');

      // change detection cycle, no model changes
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>first</li><li>second</li></ul>');

      // remove the last item
      fixture.component.items.length = 1;
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>first</li></ul>');

      // change an item
      fixture.component.items[0] = 'one';
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>one</li></ul>');

      // add an item
      fixture.component.items.push('two');
      fixture.update();
      expect(fixture.html).toEqual('<ul><li>one</li><li>two</li></ul>');
    });

    it('should support ngForOf context variables', () => {
      function liTemplate(rf: RenderFlags, ctx: NgForOfContext<string>) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'li');
          { text(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const item = ctx.$implicit;
          textBinding(1, interpolation3('', ctx.index, ' of ', ctx.count, ': ', item, ''));
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
          // <ul>
          //   <li *ngFor="let item of items; index as index; count as count">{{index}} of
          //   {{count}}: {{item}}</li>
          // </ul>
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'ul');
              { template(1, liTemplate, 2, 3, undefined, ['ngForOf', '']); }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(ctx.items));
            }

          },
          directives: () => [NgForOf]
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('<ul><li>0 of 2: first</li><li>1 of 2: second</li></ul>');

      fixture.component.items.splice(1, 0, 'middle');
      fixture.update();
      expect(fixture.html)
          .toEqual('<ul><li>0 of 3: first</li><li>1 of 3: middle</li><li>2 of 3: second</li></ul>');
    });


    it('should retain parent view listeners when the NgFor destroy views', () => {

      function liTemplate(rf: RenderFlags, ctx: NgForOfContext<string>) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'li');
          { text(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const item = ctx.$implicit;
          textBinding(1, interpolation1('', item, ''));
        }
      }

      class MyApp {
        private _data: number[] = [1, 2, 3];
        items: number[] = [];

        toggle() {
          if (this.items.length) {
            this.items = [];
          } else {
            this.items = this._data;
          }
        }

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 4,
          vars: 1,
          // <button (click)="toggle()">Toggle List</button>
          // <ul>
          //   <li *ngFor="let item of items">{{index}}</li>
          // </ul>
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'button');
              {
                listener('click', function() { return ctx.toggle(); });
                text(1, 'Toggle List');
              }
              elementEnd();
              elementStart(2, 'ul');
              { template(3, liTemplate, 2, 1, undefined, ['ngForOf', '']); }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              elementProperty(3, 'ngForOf', bind(ctx.items));
            }

          },
          directives: () => [NgForOf]
        });
      }

      const fixture = new ComponentFixture(MyApp);
      const button = fixture.hostElement.querySelector('button') !;

      expect(fixture.html).toEqual('<button>Toggle List</button><ul></ul>');

      // this will fill the list
      fixture.component.toggle();
      fixture.update();
      expect(fixture.html)
          .toEqual('<button>Toggle List</button><ul><li>1</li><li>2</li><li>3</li></ul>');

      button.click();
      fixture.update();

      expect(fixture.html).toEqual('<button>Toggle List</button><ul></ul>');

      button.click();
      fixture.update();
      expect(fixture.html)
          .toEqual('<button>Toggle List</button><ul><li>1</li><li>2</li><li>3</li></ul>');
    });

    it('should support multiple levels of embedded templates', () => {
      /**
       * <ul>
       *   <li *ngFor="let row of items">
       *      <span *ngFor="let cell of row.data">{{cell}} - {{ row.value }} - {{ items.length }}
       * </span>
       *   </li>
       * </ul>
       */
      class MyApp {
        items: any[] = [{data: ['1', '2'], value: 'first'}, {data: ['3', '4'], value: 'second'}];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 2,
          vars: 1,
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'ul');
              { template(1, liTemplate, 2, 1, null, ['ngForOf', '']); }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(ctx.items));
            }

          },
          directives: () => [NgForOf]
        });
      }

      function liTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'li');
          { template(1, spanTemplate, 2, 3, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const row = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(row.data));
        }
      }

      function spanTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { text(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const cell = ctx.$implicit;
          const row = nextContext().$implicit as any;
          const app = nextContext() as any;
          textBinding(1, interpolation3('', cell, ' - ', row.value, ' - ', app.items.length, ''));
        }
      }

      const fixture = new ComponentFixture(MyApp);

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li><span>1 - first - 2</span><span>2 - first - 2</span></li><li><span>3 - second - 2</span><span>4 - second - 2</span></li></ul>');

      // Remove the last item
      fixture.component.items.length = 1;
      fixture.update();
      expect(fixture.html)
          .toEqual('<ul><li><span>1 - first - 1</span><span>2 - first - 1</span></li></ul>');

      // Change an item
      fixture.component.items[0].data[0] = 'one';
      fixture.update();
      expect(fixture.html)
          .toEqual('<ul><li><span>one - first - 1</span><span>2 - first - 1</span></li></ul>');

      // Add an item
      fixture.component.items[1] = {data: ['three', '4'], value: 'third'};
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li><span>one - first - 2</span><span>2 - first - 2</span></li><li><span>three - third - 2</span><span>4 - third - 2</span></li></ul>');
    });

    it('should support multiple levels of embedded templates with listeners', () => {
      /**
       * <div *ngFor="let row of items">
       *    <p *ngFor="let cell of row.data">
       *        <span (click)="onClick(row.value, name)"></span>
       *        {{ row.value }} - {{ name }}
       *    </p>
       * </div>
       */
      class MyApp {
        items: any[] = [{data: ['1'], value: 'first'}];
        name = 'app';
        events: string[] = [];

        onClick(value: string, name: string) { this.events.push(value, name); }

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 1,
          vars: 1,
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              template(0, divTemplate, 2, 1, null, ['ngForOf', '']);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'ngForOf', bind(ctx.items));
            }

          },
          directives: () => [NgForOf]
        });
      }

      function divTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { template(1, pTemplate, 3, 2, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const row = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(row.data));
        }
      }

      function pTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          const state = getCurrentView();
          elementStart(0, 'p');
          {
            elementStart(1, 'span');
            {
              listener('click', () => {
                restoreView(state);
                const row = nextContext().$implicit as any;
                const app = nextContext();
                app.onClick(row.value, app.name);
              });
            }
            elementEnd();
            text(2);
          }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const row = nextContext().$implicit as any;
          const app = nextContext() as any;
          textBinding(2, interpolation2('', row.value, ' - ', app.name, ''));
        }
      }

      const fixture = new ComponentFixture(MyApp);

      fixture.update();
      expect(fixture.html).toEqual('<div><p><span></span>first - app</p></div>');

      const span = fixture.hostElement.querySelector('span') as any;
      span.click();
      expect(fixture.component.events).toEqual(['first', 'app']);

      fixture.component.name = 'new name';
      fixture.update();
      expect(fixture.html).toEqual('<div><p><span></span>first - new name</p></div>');

      span.click();
      expect(fixture.component.events).toEqual(['first', 'app', 'first', 'new name']);
    });

    it('should support skipping contexts', () => {
      /**
       * <div *ngFor="let row of items">
       *    <div *ngFor="let cell of row">
       *       <span *ngFor="let span of cell.data">
       *           {{ cell.value }} - {{ name }}
       *       </span>
       *    </div>
       * </div>
       */
      class MyApp {
        name = 'app';
        items: any[] = [
          [
            // row
            {value: 'one', data: ['1', '2']}  // cell
          ],
          [{value: 'two', data: ['3', '4']}]
        ];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 1,
          vars: 1,
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              template(0, divTemplate, 2, 1, null, ['ngForOf', '']);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'ngForOf', bind(ctx.items));
            }

          },
          directives: () => [NgForOf]
        });
      }

      function divTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { template(1, innerDivTemplate, 2, 1, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const row = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(row));
        }
      }

      function innerDivTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { template(1, spanTemplate, 2, 2, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const cell = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(cell.data));
        }
      }

      function spanTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { text(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const cell = nextContext().$implicit as any;
          const app = nextContext(2) as any;
          textBinding(1, interpolation2('', cell.value, ' - ', app.name, ''));
        }
      }

      const fixture = new ComponentFixture(MyApp);

      fixture.update();
      expect(fixture.html)
          .toEqual(
              `<div><div><span>one - app</span><span>one - app</span></div></div><div><div><span>two - app</span><span>two - app</span></div></div>`);

      fixture.component.name = 'other';
      fixture.update();
      expect(fixture.html)
          .toEqual(
              `<div><div><span>one - other</span><span>one - other</span></div></div><div><div><span>two - other</span><span>two - other</span></div></div>`);
    });

    it('should support context for 9+ levels of embedded templates', () => {
      /**
       *
       * <span *ngFor="let item0 of items">
       *     <span *ngFor="let item1 of item0.data">
       *        <span *ngFor="let item2 of item1.data">
       *            <span *ngFor="let item3 of item2.data">
       *                <span *ngFor="let item4 of item3.data">
       *                    <span *ngFor="let item5 of item4.data">
       *                        <span *ngFor="let item6 of item5.data">
       *                            <span *ngFor="let item7 of item6.data">
       *                                <span *ngFor="let item8 of item7.data">
       *                                    {{ item8 }} - {{ item7.value }} - {{ item6.value }}...
       *                                 </span>
       *                            </span>
       *                        </span>
       *                    </span>
       *                </span>
       *            </span>
       *        </span>
       *     </span>
       * </span>
       */
      class MyApp {
        value = 'App';
        items: any[] = [
          {
            // item0
            data: [{
              // item1
              data: [{
                // item2
                data: [{
                  // item3
                  data: [{
                    // item4
                    data: [{
                      // item5
                      data: [{
                        // item6
                        data: [{
                          // item7
                          data: [
                            '1', '2'  // item8
                          ],
                          value: 'h'
                        }],
                        value: 'g'
                      }],
                      value: 'f'
                    }],
                    value: 'e'
                  }],
                  value: 'd'
                }],
                value: 'c'
              }],
              value: 'b'
            }],
            value: 'a'
          },
          {
            // item0
            data: [{
              // item1
              data: [{
                // item2
                data: [{
                  // item3
                  data: [{
                    // item4
                    data: [{
                      // item5
                      data: [{
                        // item6
                        data: [{
                          // item7
                          data: [
                            '3', '4'  // item8
                          ],
                          value: 'H'
                        }],
                        value: 'G'
                      }],
                      value: 'F'
                    }],
                    value: 'E'
                  }],
                  value: 'D'
                }],
                value: 'C'
              }],
              value: 'B'
            }],
            value: 'A'
          }
        ];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 1,
          vars: 1,
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              template(0, itemTemplate0, 2, 1, null, ['ngForOf', '']);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'ngForOf', bind(ctx.items));
            }

          },
          directives: () => [NgForOf]
        });
      }

      function itemTemplate0(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { template(1, itemTemplate1, 2, 1, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const item0 = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item0.data));
        }
      }

      function itemTemplate1(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { template(1, itemTemplate2, 2, 1, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const item1 = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item1.data));
        }
      }

      function itemTemplate2(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { template(1, itemTemplate3, 2, 1, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const item2 = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item2.data));
        }
      }

      function itemTemplate3(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { template(1, itemTemplate4, 2, 1, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const item3 = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item3.data));
        }
      }

      function itemTemplate4(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { template(1, itemTemplate5, 2, 1, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const item4 = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item4.data));
        }
      }

      function itemTemplate5(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { template(1, itemTemplate6, 2, 1, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const item5 = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item5.data));
        }
      }

      function itemTemplate6(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { template(1, itemTemplate7, 2, 1, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const item6 = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item6.data));
        }
      }

      function itemTemplate7(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { template(1, itemTemplate8, 2, 10, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const item7 = ctx.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item7.data));
        }
      }

      function itemTemplate8(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span');
          { text(1); }
          elementEnd();
        }

        if (rf & RenderFlags.Update) {
          const value = ctx.$implicit;
          const item7 = nextContext().$implicit;
          const item6 = nextContext().$implicit;
          const item5 = nextContext().$implicit;
          const item4 = nextContext().$implicit;
          const item3 = nextContext().$implicit;
          const item2 = nextContext().$implicit;
          const item1 = nextContext().$implicit;
          const item0 = nextContext().$implicit;
          const myApp = nextContext();
          textBinding(1, interpolationV([
                        '',  value,       '.', item7.value, '.', item6.value, '.', item5.value,
                        '.', item4.value, '.', item3.value, '.', item2.value, '.', item1.value,
                        '.', item0.value, '.', myApp.value, ''
                      ]));
        }
      }

      const fixture = new ComponentFixture(MyApp);

      expect(fixture.html)
          .toEqual(
              '<span><span><span><span><span><span><span><span>' +
              '<span>1.h.g.f.e.d.c.b.a.App</span>' +
              '<span>2.h.g.f.e.d.c.b.a.App</span>' +
              '</span></span></span></span></span></span></span></span>' +
              '<span><span><span><span><span><span><span><span>' +
              '<span>3.H.G.F.E.D.C.B.A.App</span>' +
              '<span>4.H.G.F.E.D.C.B.A.App</span>' +
              '</span></span></span></span></span></span></span></span>');
    });

  });

  describe('ngIf', () => {
    it('should support sibling ngIfs', () => {
      class MyApp {
        showing = true;
        valueOne = 'one';
        valueTwo = 'two';

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 2,
          vars: 2,
          /**
           * <div *ngIf="showing">{{ valueOne }}</div>
           * <div *ngIf="showing">{{ valueTwo }}</div>
           */
          template: (rf: RenderFlags, ctx: MyApp) => {
            if (rf & RenderFlags.Create) {
              template(0, templateOne, 2, 1, undefined, ['ngIf', '']);
              template(1, templateTwo, 2, 1, undefined, ['ngIf', '']);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'ngIf', bind(ctx.showing));
              elementProperty(1, 'ngIf', bind(ctx.showing));
            }

          },
          directives: () => [NgIf]
        });
      }

      function templateOne(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { text(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const myApp = nextContext();
          textBinding(1, bind(myApp.valueOne));
        }
      }

      function templateTwo(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { text(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const myApp = nextContext();
          textBinding(1, bind(myApp.valueTwo));
        }
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('<div>one</div><div>two</div>');

      fixture.component.valueOne = '$$one$$';
      fixture.component.valueTwo = '$$two$$';
      fixture.update();
      expect(fixture.html).toEqual('<div>$$one$$</div><div>$$two$$</div>');
    });

    it('should handle nested ngIfs with no intermediate context vars', () => {
      /**
       * <div *ngIf="showing">
       *     <div *ngIf="outerShowing">
       *         <div *ngIf="innerShowing'>
       *           {{ name }}
       *         </div>
       *     </div>
       * </div>
       */
      class AppComponent {
        showing = true;
        outerShowing = true;
        innerShowing = true;
        name = 'App name';

        static ngComponentDef = defineComponent({
          type: AppComponent,
          factory: () => new AppComponent(),
          selectors: [['my-app']],
          consts: 1,
          vars: 1,
          template: (rf: RenderFlags, ctx: AppComponent) => {
            if (rf & RenderFlags.Create) {
              template(0, divTemplate, 2, 1, undefined, ['ngIf', '']);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'ngIf', bind(ctx.showing));
            }

          },
          directives: () => [NgIf]
        });
      }

      function divTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { template(1, outerDivTemplate, 2, 1, undefined, ['ngIf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const app = nextContext();
          elementProperty(1, 'ngIf', bind(app.outerShowing));
        }
      }

      function outerDivTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { template(1, innerDivTemplate, 2, 1, undefined, ['ngIf', '']); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const app = nextContext(2);
          elementProperty(1, 'ngIf', bind(app.innerShowing));
        }
      }

      function innerDivTemplate(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { text(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const app = nextContext(3);
          textBinding(1, bind(app.name));
        }
      }

      const fixture = new ComponentFixture(AppComponent);
      expect(fixture.html).toEqual(`<div><div><div>App name</div></div></div>`);

      fixture.component.name = 'Other name';
      fixture.update();
      expect(fixture.html).toEqual(`<div><div><div>Other name</div></div></div>`);
    });

  });

  describe('NgTemplateOutlet', () => {

    it('should create and remove embedded views', () => {

      class MyApp {
        showing = false;
        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 3,
          vars: 1,
          /**
           * <ng-template #tpl>from tpl</ng-template>
           * <ng-template [ngTemplateOutlet]="showing ? tpl : null"></ng-template>
           */
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              template(
                  0,
                  (rf1: RenderFlags) => {
                    if (rf1 & RenderFlags.Create) {
                      text(0, 'from tpl');
                    }
                  },
                  1, 0, undefined, undefined, ['tpl', ''],
                  templateRefExtractor(TemplateRef, ElementRef));
              template(2, null, 0, 0, null, [AttributeMarker.SelectOnly, 'ngTemplateOutlet']);
            }
            if (rf & RenderFlags.Update) {
              const tplRef = load(1);
              elementProperty(2, 'ngTemplateOutlet', bind(myApp.showing ? tplRef : null));
            }
          },
          directives: () => [NgTemplateOutlet]
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('');

      fixture.component.showing = true;
      fixture.update();
      expect(fixture.html).toEqual('from tpl');

      fixture.component.showing = false;
      fixture.update();
      expect(fixture.html).toEqual('');
    });

    it('should allow usage on ng-container', () => {
      class MyApp {
        showing = false;
        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          consts: 3,
          vars: 1,
          /**
           * <ng-template #tpl>from tpl</ng-template>
           * <ng-container [ngTemplateOutlet]="showing ? tpl : null"></ng-container>
           */
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              template(
                  0,
                  (rf1: RenderFlags) => {
                    if (rf1 & RenderFlags.Create) {
                      text(0, 'from tpl');
                    }
                  },
                  1, 0, undefined, undefined, ['tpl', ''],
                  templateRefExtractor(TemplateRef, ElementRef));
              elementContainerStart(2, [AttributeMarker.SelectOnly, 'ngTemplateOutlet']);
              elementContainerEnd();
            }
            if (rf & RenderFlags.Update) {
              const tplRef = reference(1);
              elementProperty(2, 'ngTemplateOutlet', bind(myApp.showing ? tplRef : null));
            }
          },
          directives: () => [NgTemplateOutlet]
        });
      }

      const fixture = new ComponentFixture(MyApp);
      expect(fixture.html).toEqual('');

      fixture.component.showing = true;
      fixture.update();
      expect(fixture.html).toEqual('from tpl');

      fixture.component.showing = false;
      fixture.update();
      expect(fixture.html).toEqual('');

    });

  });
});
