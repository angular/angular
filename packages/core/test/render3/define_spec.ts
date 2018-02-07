/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DoCheck, OnChanges, SimpleChanges} from '../../src/core';
import {NgOnChangesFeature, defineDirective} from '../../src/render3/index';

describe('define', () => {
  describe('component', () => {
    describe('NgOnChangesFeature', () => {
      it('should patch class', () => {
        class MyDirective implements OnChanges, DoCheck {
          public log: string[] = [];
          public valA: string = 'initValue';
          public set valB(value: string) { this.log.push(value); }

          public get valB() { return 'works'; }

          ngDoCheck(): void { this.log.push('ngDoCheck'); }
          ngOnChanges(changes: SimpleChanges): void {
            this.log.push('ngOnChanges');
            this.log.push('valA', changes['valA'].previousValue, changes['valA'].currentValue);
            this.log.push('valB', changes['valB'].previousValue, changes['valB'].currentValue);
          }

          static ngDirectiveDef = defineDirective({
            type: MyDirective,
            factory: () => new MyDirective(),
            features: [NgOnChangesFeature],
            inputs: {valA: 'valA', valB: 'valB'}
          });
        }

        const myDir = MyDirective.ngDirectiveDef.n() as MyDirective;
        myDir.valA = 'first';
        expect(myDir.valA).toEqual('first');
        myDir.valB = 'second';
        expect(myDir.log).toEqual(['second']);
        expect(myDir.valB).toEqual('works');
        myDir.log.length = 0;
        MyDirective.ngDirectiveDef.doCheck !.call(myDir);
        expect(myDir.log).toEqual([
          'ngOnChanges', 'valA', 'initValue', 'first', 'valB', undefined, 'second', 'ngDoCheck'
        ]);
      });
    });
  });
});
