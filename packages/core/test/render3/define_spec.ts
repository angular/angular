/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DoCheck, OnChanges, SimpleChange, SimpleChanges} from '../../src/core';
import {DirectiveDef, NgOnChangesFeature, defineDirective} from '../../src/render3/index';

describe('define', () => {
  describe('component', () => {
    describe('NgOnChangesFeature', () => {
      it('should patch class', () => {
        class MyDirective implements OnChanges, DoCheck {
          public log: Array<string|SimpleChange> = [];
          public valA: string = 'initValue';
          public set valB(value: string) { this.log.push(value); }

          public get valB() { return 'works'; }

          ngDoCheck(): void { this.log.push('ngDoCheck'); }
          ngOnChanges(changes: SimpleChanges): void {
            this.log.push('ngOnChanges');
            this.log.push('valA', changes['valA']);
            this.log.push('valB', changes['valB']);
          }

          static ngDirectiveDef = defineDirective({
            type: MyDirective,
            selectors: [['', 'myDir', '']],
            factory: () => new MyDirective(),
            features: [NgOnChangesFeature()],
            inputs: {valA: 'valA', valB: 'valB'}
          });
        }

        const myDir =
            (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).factory() as MyDirective;
        myDir.valA = 'first';
        expect(myDir.valA).toEqual('first');
        myDir.valB = 'second';
        expect(myDir.log).toEqual(['second']);
        expect(myDir.valB).toEqual('works');
        myDir.log.length = 0;
        (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).doCheck !.call(myDir);
        const changeA = new SimpleChange(undefined, 'first', true);
        const changeB = new SimpleChange(undefined, 'second', true);
        expect(myDir.log).toEqual(['ngOnChanges', 'valA', changeA, 'valB', changeB, 'ngDoCheck']);
      });

      it('correctly computes firstChange', () => {
        class MyDirective implements OnChanges {
          public log: Array<string|SimpleChange> = [];
          public valA: string = 'initValue';
          public valB: string;

          ngOnChanges(changes: SimpleChanges): void {
            this.log.push('valA', changes['valA']);
            this.log.push('valB', changes['valB']);
          }

          static ngDirectiveDef = defineDirective({
            type: MyDirective,
            selectors: [['', 'myDir', '']],
            factory: () => new MyDirective(),
            features: [NgOnChangesFeature()],
            inputs: {valA: 'valA', valB: 'valB'}
          });
        }

        const myDir =
            (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).factory() as MyDirective;
        myDir.valA = 'first';
        myDir.valB = 'second';
        (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).doCheck !.call(myDir);
        const changeA1 = new SimpleChange(undefined, 'first', true);
        const changeB1 = new SimpleChange(undefined, 'second', true);
        expect(myDir.log).toEqual(['valA', changeA1, 'valB', changeB1]);

        myDir.log.length = 0;
        myDir.valA = 'third';
        (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).doCheck !.call(myDir);
        const changeA2 = new SimpleChange('first', 'third', false);
        expect(myDir.log).toEqual(['valA', changeA2, 'valB', undefined]);
      });

      it('should not create a getter when only a setter is originally defined', () => {
        class MyDirective implements OnChanges {
          public log: Array<string|SimpleChange> = [];

          public set onlySetter(value: string) { this.log.push(value); }

          ngOnChanges(changes: SimpleChanges): void {
            this.log.push('ngOnChanges');
            this.log.push('onlySetter', changes['onlySetter']);
          }

          static ngDirectiveDef = defineDirective({
            type: MyDirective,
            selectors: [['', 'myDir', '']],
            factory: () => new MyDirective(),
            features: [NgOnChangesFeature()],
            inputs: {onlySetter: 'onlySetter'}
          });
        }

        const myDir =
            (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).factory() as MyDirective;
        myDir.onlySetter = 'someValue';
        expect(myDir.onlySetter).toBeUndefined();
        (MyDirective.ngDirectiveDef as DirectiveDef<MyDirective>).doCheck !.call(myDir);
        const changeSetter = new SimpleChange(undefined, 'someValue', true);
        expect(myDir.log).toEqual(['someValue', 'ngOnChanges', 'onlySetter', changeSetter]);
      });
    });
  });
});
