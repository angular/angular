/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, IterableDiffer, IterableDifferFactory, IterableDiffers, NgModule, TrackByFunction} from '@angular/core';
import {TestBed} from '@angular/core/testing';

{
  describe('IterableDiffers', function() {
    let factory1: any;
    let factory2: any;
    let factory3: any;

    beforeEach(() => {
      const getFactory = () => jasmine.createSpyObj('IterableDifferFactory', ['supports']);
      factory1 = getFactory();
      factory2 = getFactory();
      factory3 = getFactory();
    });

    it('should throw when no suitable implementation found', () => {
      const differs = new IterableDiffers([]);
      expect(() => differs.find('some object'))
          .toThrowError(/Cannot find a differ supporting object 'some object'/);
    });

    it('should return the first suitable implementation', () => {
      factory1.supports.and.returnValue(false);
      factory2.supports.and.returnValue(true);
      factory3.supports.and.returnValue(true);

      const differs = IterableDiffers.create(<any>[factory1, factory2, factory3]);
      expect(differs.find('some object')).toBe(factory2);
    });

    it('should copy over differs from the parent repo', () => {
      factory1.supports.and.returnValue(true);
      factory2.supports.and.returnValue(false);

      const parent = IterableDiffers.create(<any>[factory1]);
      const child = IterableDiffers.create(<any>[factory2], parent);

      expect(child.factories).toEqual([factory2, factory1]);
    });

    describe('.extend()', () => {
      it('should extend di-inherited differs', () => {
        const parent = new IterableDiffers([factory1]);
        const injector = Injector.create([{provide: IterableDiffers, useValue: parent}]);
        const childInjector = Injector.create([IterableDiffers.extend([factory2])], injector);

        expect(injector.get<IterableDiffers>(IterableDiffers).factories).toEqual([factory1]);
        expect(childInjector.get<IterableDiffers>(IterableDiffers).factories).toEqual([
          factory2, factory1
        ]);
      });

      it('should support .extend in root NgModule', () => {
        const DIFFER: IterableDiffer<any> = {} as any;
        const log: string[] = [];
        class MyIterableDifferFactory implements IterableDifferFactory {
          supports(objects: any): boolean {
            log.push('supports', objects);
            return true;
          }
          create<V>(trackByFn?: TrackByFunction<V>): IterableDiffer<V> {
            log.push('create');
            return DIFFER;
          }
        }


        @NgModule({providers: [IterableDiffers.extend([new MyIterableDifferFactory()])]})
        class MyModule {
        }

        TestBed.configureTestingModule({imports: [MyModule]});
        const differs = TestBed.inject(IterableDiffers);
        const differ = differs.find('VALUE').create(null!);
        expect(differ).toEqual(DIFFER);
        expect(log).toEqual(['supports', 'VALUE', 'create']);
      });
    });
  });
}
