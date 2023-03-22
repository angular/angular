/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, effect, ViewChild, ViewContainerRef} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';

describe('effects', () => {
  it('should run prior to change detection', withBody('<test-cmp></test-cmp>', async () => {
       const log: string[] = [];
       @Component({
         selector: 'test-cmp',
         standalone: true,
         template: '',
       })
       class Cmp {
         constructor() {
           log.push('B');

           effect(() => {
             log.push('E');
           });
         }

         ngDoCheck() {
           log.push('C');
         }
       }

       await bootstrapApplication(Cmp);

       expect(log).toEqual([
         // B: component bootstrapped
         'B',
         // C: change detection runs -> triggers ngDoCheck
         'C',
         // E: effect runs
         'E',
         // C: change detection runs after effect runs
         'C',
       ]);
     }));
});
