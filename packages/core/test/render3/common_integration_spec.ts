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
import {bind, container, elementEnd, elementProperty, elementStart, interpolation1, interpolation3, listener, load, text, textBinding} from '../../src/render3/instructions';
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

            function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
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

            function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
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

            function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
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
       * <ul *ngFor="let outterItem of items.">
       *   <li *ngFor="let item of items">
       *      <span>{{item}}</span>
       *   </li>
       * </ul>
       */
      class MyApp {
        items: string[] = ['1', '2'];

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

            function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'li');
                { container(1, spanTemplate, null, ['ngForOf', '']); }
                elementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(1, 'ngForOf', bind(myApp.items));
              }
            }

            function spanTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'span');
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

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li><span>1</span><span>2</span></li><li><span>1</span><span>2</span></li></ul>');

      // Remove the last item
      fixture.component.items.length = 1;
      fixture.update();
      expect(fixture.html).toEqual('<ul><li><span>1</span></li></ul>');

      // Change an item
      fixture.component.items[0] = 'one';
      fixture.update();
      expect(fixture.html).toEqual('<ul><li><span>one</span></li></ul>');

      // Add an item
      fixture.component.items.push('two');
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<ul><li><span>one</span><span>two</span></li><li><span>one</span><span>two</span></li></ul>');
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

            function templateOne(rf: RenderFlags, ctx: any) {
              if (rf & RenderFlags.Create) {
                elementStart(0, 'div');
                { text(1); }
                elementEnd();
              }
              if (rf & RenderFlags.Update) {
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
                textBinding(1, bind(myApp.valueTwo));
              }
            }
          },
          directives: () => [NgIf]
        });
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
