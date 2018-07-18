/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOfContext} from '@angular/common';

import {getOrCreateNodeInjectorForNode, getOrCreateTemplateRef} from '../../src/render3/di';
import {AttributeMarker, defineComponent} from '../../src/render3/index';
import {bind, container, elementEnd, elementProperty, elementStart, interpolation1, interpolation2, interpolation3, interpolationV, listener, load, text, textBinding} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {NgForOf, NgIf, NgTemplateOutlet} from './common_with_def';
import {ComponentFixture} from './render_util';

describe('@angular/common integration', () => {

  describe('NgForOf', () => {
    it('should update a loop', () => {
      class MyApp {
        items: string[] = ['first', 'second'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          // <ul>
          //   <li *ngFor="let item of items">{{item}}</li>
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'ul');
              { container(1, liTemplate, undefined, ['ngForOf', '']); }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(myApp.items));
            }

            function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>, parent: MyApp) {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'li');
                { text(1); }
                elementEnd();
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

      class MyApp {
        items: string[] = ['first', 'second'];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          // <ul>
          //   <li *ngFor="let item of items">{{index}} of {{count}}: {{item}}</li>
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'ul');
              { container(1, liTemplate, undefined, ['ngForOf', '']); }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(myApp.items));
            }

            function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>, parent: MyApp) {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'li');
                { text(1); }
                elementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                textBinding(
                    1, interpolation3('', row.index, ' of ', row.count, ': ', row.$implicit, ''));
              }
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
          // <button (click)="toggle()">Toggle List</button>
          // <ul>
          //   <li *ngFor="let item of items">{{index}}</li>
          // </ul>
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'button');
              {
                listener('click', function() { return myApp.toggle(); });
                text(1, 'Toggle List');
              }
              elementEnd();
              elementStart(2, 'ul');
              { container(3, liTemplate, undefined, ['ngForOf', '']); }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              elementProperty(3, 'ngForOf', bind(myApp.items));
            }

            function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>, parent: MyApp) {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'li');
                { text(1); }
                elementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                textBinding(1, interpolation1('', row.$implicit, ''));
              }
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
       *      <span *ngFor="let cell of row.data">{{cell}} - {{ row.value }}</span>
       *   </li>
       * </ul>
       */
      class MyApp {
        items: any[] = [{data: ['1', '2'], value: 'first'}, {data: ['3', '4'], value: 'second'}];

        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'ul');
              { container(1, liTemplate, null, ['ngForOf', '']); }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              elementProperty(1, 'ngForOf', bind(myApp.items));
            }

          },
          directives: () => [NgForOf]
        });
      }

      function liTemplate(rf1: RenderFlags, row: any, myApp: MyApp) {
        if (rf1 & RenderFlags.Create) {
          elementStart(0, 'li');
          { container(1, spanTemplate, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf1 & RenderFlags.Update) {
          const r1 = row.$implicit as any;
          elementProperty(1, 'ngForOf', bind(r1.data));
        }
      }

      function spanTemplate(rf1: RenderFlags, cell: any, row: any, myApp: MyApp) {
        if (rf1 & RenderFlags.Create) {
          elementStart(0, 'span');
          { text(1); }
          elementEnd();
        }
        if (rf1 & RenderFlags.Update) {
          textBinding(
              1, interpolation2('', cell.$implicit, ' - ', (row.$implicit as any).value, ''));
        }
      }

      const fixture = new ComponentFixture(MyApp);

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li><span>1 - first</span><span>2 - first</span></li><li><span>3 - second</span><span>4 - second</span></li></ul>');

      // Remove the last item
      fixture.component.items.length = 1;
      fixture.update();
      expect(fixture.html)
          .toEqual('<ul><li><span>1 - first</span><span>2 - first</span></li></ul>');

      // Change an item
      fixture.component.items[0].data[0] = 'one';
      fixture.update();
      expect(fixture.html)
          .toEqual('<ul><li><span>one - first</span><span>2 - first</span></li></ul>');

      // Add an item
      fixture.component.items[1] = {data: ['three', '4'], value: 'third'};
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li><span>one - first</span><span>2 - first</span></li><li><span>three - third</span><span>4 - third</span></li></ul>');
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
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              container(0, itemTemplate0, null, ['ngForOf', '']);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'ngForOf', bind(myApp.items));
            }

          },
          directives: () => [NgForOf]
        });
      }

      function itemTemplate0(rf1: RenderFlags, item0: any, myApp: MyApp) {
        if (rf1 & RenderFlags.Create) {
          elementStart(0, 'span');
          { container(1, itemTemplate1, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf1 & RenderFlags.Update) {
          const item = item0.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item.data));
        }
      }

      function itemTemplate1(rf1: RenderFlags, item1: any, item0: any, myApp: MyApp) {
        if (rf1 & RenderFlags.Create) {
          elementStart(0, 'span');
          { container(1, itemTemplate2, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf1 & RenderFlags.Update) {
          const item = item1.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item.data));
        }
      }

      function itemTemplate2(rf1: RenderFlags, item2: any, item1: any, item0: any, myApp: MyApp) {
        if (rf1 & RenderFlags.Create) {
          elementStart(0, 'span');
          { container(1, itemTemplate3, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf1 & RenderFlags.Update) {
          const item = item2.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item.data));
        }
      }

      function itemTemplate3(
          rf1: RenderFlags, item3: any, item2: any, item1: any, item0: any, myApp: MyApp) {
        if (rf1 & RenderFlags.Create) {
          elementStart(0, 'span');
          { container(1, itemTemplate4, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf1 & RenderFlags.Update) {
          const item = item3.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item.data));
        }
      }

      function itemTemplate4(
          rf1: RenderFlags, item4: any, item3: any, item2: any, item1: any, item0: any,
          myApp: MyApp) {
        if (rf1 & RenderFlags.Create) {
          elementStart(0, 'span');
          { container(1, itemTemplate5, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf1 & RenderFlags.Update) {
          const item = item4.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item.data));
        }
      }

      function itemTemplate5(
          rf1: RenderFlags, item5: any, item4: any, item3: any, item2: any, item1: any, item0: any,
          myApp: MyApp) {
        if (rf1 & RenderFlags.Create) {
          elementStart(0, 'span');
          { container(1, itemTemplate6, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf1 & RenderFlags.Update) {
          const item = item5.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item.data));
        }
      }

      function itemTemplate6(
          rf1: RenderFlags, item6: any, item5: any, item4: any, item3: any, item2: any, item1: any,
          item0: any, myApp: MyApp) {
        if (rf1 & RenderFlags.Create) {
          elementStart(0, 'span');
          { container(1, itemTemplate7, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf1 & RenderFlags.Update) {
          const item = item6.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item.data));
        }
      }

      function itemTemplate7(
          rf1: RenderFlags, item7: any, item6: any, item5: any, item4: any, item3: any, item2: any,
          item1: any, item0: any, myApp: MyApp) {
        if (rf1 & RenderFlags.Create) {
          elementStart(0, 'span');
          { container(1, itemTemplate8, null, ['ngForOf', '']); }
          elementEnd();
        }
        if (rf1 & RenderFlags.Update) {
          const item = item7.$implicit as any;
          elementProperty(1, 'ngForOf', bind(item.data));
        }
      }

      function itemTemplate8(
          rf1: RenderFlags, item8: any, item7: any, item6: any, item5: any, item4: any, item3: any,
          item2: any, item1: any, item0: any, myApp: MyApp) {
        if (rf1 & RenderFlags.Create) {
          elementStart(0, 'span');
          { text(1); }
          elementEnd();
        }

        if (rf1 & RenderFlags.Update) {
          textBinding(
              1, interpolationV([
                '',  item8.$implicit,       '.', item7.$implicit.value, '.', item6.$implicit.value,
                '.', item5.$implicit.value, '.', item4.$implicit.value, '.', item3.$implicit.value,
                '.', item2.$implicit.value, '.', item1.$implicit.value, '.', item0.$implicit.value,
                '.', myApp.value,           ''
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
          /**
           * <div *ngIf="showing">{{ valueOne }}</div>
           * <div *ngIf="showing">{{ valueTwo }}</div>
           */
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              container(0, templateOne, undefined, ['ngIf', '']);
              container(1, templateTwo, undefined, ['ngIf', '']);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'ngIf', bind(myApp.showing));
              elementProperty(1, 'ngIf', bind(myApp.showing));
            }

          },
          directives: () => [NgIf]
        });
      }

      function templateOne(rf: RenderFlags, ctx: any, myApp: MyApp) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { text(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          textBinding(1, bind(myApp.valueOne));
        }
      }

      function templateTwo(rf: RenderFlags, ctx: any, myApp: MyApp) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          { text(1); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
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

  });

  describe('NgTemplateOutlet', () => {

    it('should create and remove embedded views', () => {

      class MyApp {
        showing = false;
        static ngComponentDef = defineComponent({
          type: MyApp,
          factory: () => new MyApp(),
          selectors: [['my-app']],
          /**
           * <ng-template #tpl>from tpl</ng-template>
           * <ng-template [ngTemplateOutlet]="showing ? tpl : null"></ng-template>
           */
          template: (rf: RenderFlags, myApp: MyApp) => {
            if (rf & RenderFlags.Create) {
              container(0, (rf1: RenderFlags) => {
                if (rf1 & RenderFlags.Create) {
                  text(0, 'from tpl');
                }
              }, undefined, undefined, ['tpl', '']);
              container(2, undefined, null, [AttributeMarker.SelectOnly, 'ngTemplateOutlet']);
            }
            if (rf & RenderFlags.Update) {
              const tplRef = getOrCreateTemplateRef(getOrCreateNodeInjectorForNode(load(0)));
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
