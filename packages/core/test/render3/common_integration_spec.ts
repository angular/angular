/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOfContext} from '@angular/common';

import {defineComponent} from '../../src/render3/index';
import {bind, container, elementEnd, elementProperty, elementStart, interpolation3, text, textBinding, tick} from '../../src/render3/instructions';

import {NgForOf} from './common_with_def';
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
          template: (myApp: MyApp, cm: boolean) => {
            if (cm) {
              elementStart(0, 'ul');
              { container(1, liTemplate, undefined, ['ngForOf', '']); }
              elementEnd();
            }
            elementProperty(1, 'ngForOf', bind(myApp.items));

            function liTemplate(row: NgForOfContext<string>, cm: boolean) {
              if (cm) {
                elementStart(0, 'li');
                { text(1); }
                elementEnd();
              }
              textBinding(1, bind(row.$implicit));
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
          template: (myApp: MyApp, cm: boolean) => {
            if (cm) {
              elementStart(0, 'ul');
              { container(1, liTemplate, undefined, ['ngForOf', '']); }
              elementEnd();
            }
            elementProperty(1, 'ngForOf', bind(myApp.items));

            function liTemplate(row: NgForOfContext<string>, cm: boolean) {
              if (cm) {
                elementStart(0, 'li');
                { text(1); }
                elementEnd();
              }
              textBinding(
                  1, interpolation3('', row.index, ' of ', row.count, ': ', row.$implicit, ''));
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

  });
});
