/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KeyValueDiffer, KeyValueDifferFactory, KeyValueDiffers, NgModule} from '@angular/core';
import {TestBed} from '@angular/core/testing';


describe('KeyValueDiffers', function() {
  it('should support .extend in root NgModule', () => {
    const DIFFER: KeyValueDiffer<any, any> = {} as any;
    const log: string[] = [];
    class MyKeyValueDifferFactory implements KeyValueDifferFactory {
      supports(objects: any): boolean {
        log.push('supports', objects);
        return true;
      }
      create<K, V>(): KeyValueDiffer<K, V> {
        log.push('create');
        return DIFFER;
      }
    }


    @NgModule({providers: [KeyValueDiffers.extend([new MyKeyValueDifferFactory()])]})
    class MyModule {
    }

    TestBed.configureTestingModule({imports: [MyModule]});
    const differs = TestBed.inject(KeyValueDiffers);
    const differ = differs.find('VALUE').create();
    expect(differ).toEqual(DIFFER);
    expect(log).toEqual(['supports', 'VALUE', 'create']);
  });
});
