/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {getLContext} from '@angular/core/src/render3/context_discovery';
import {getComponentLView} from '@angular/core/src/render3/util/discovery_utils';
import {createNamedArrayType} from '@angular/core/src/util/named_array_type';
import {ngDevModeResetPerfCounters} from '@angular/core/src/util/ng_dev_mode';
import {TestBed} from '@angular/core/testing';
import {onlyInIvy} from '@angular/private/testing';

class SupportsArraySubclassing extends Array {}

// If this is being compiled to ES5 then the array subclass has `Array` as constructor
// instead of `SupportsArraySubclassing`.
const targetSupportsArraySubclassing =
    (new SupportsArraySubclassing()).constructor.name === 'SupportsArraySubclassing';

// Creation of a named array types dynamically may succeed even in ES5 targets, as the named array
// is created using the Function constructor.
const runtimeSupportsArraySubclassing =
    (new (createNamedArrayType('SupportsArraySubclassing'))).constructor.name ===
    'SupportsArraySubclassing';

onlyInIvy('Debug information exist in ivy only').describe('ngDevMode debug', () => {
  describe('LViewDebug', () => {
    beforeEach(ngDevModeResetPerfCounters);

    runtimeSupportsArraySubclassing && it('should not name LView based on type by default', () => {
      @Component({
        template: `
        <ul>
          <li *ngIf="true">item</li>
        </ul>
        `
      })
      class MyApp {
      }

      TestBed.configureTestingModule({declarations: [MyApp], imports: [CommonModule]});
      const fixture = TestBed.createComponent(MyApp);
      const rootLView = getLContext(fixture.nativeElement)!.lView;
      expect(rootLView.constructor.name)
          .toEqual(targetSupportsArraySubclassing ? 'LRootView' : 'Array');

      const componentLView = getComponentLView(fixture.componentInstance);
      expect(componentLView.constructor.name)
          .toEqual(targetSupportsArraySubclassing ? 'LComponentView' : 'Array');

      const element: HTMLElement = fixture.nativeElement;
      fixture.detectChanges();
      const li = element.querySelector('li')!;
      const embeddedLView = getLContext(li)!.lView;
      expect(embeddedLView.constructor.name)
          .toEqual(targetSupportsArraySubclassing ? 'LEmbeddedView' : 'Array');
    });

    runtimeSupportsArraySubclassing &&
        it('should name LView based on type when namedConstructors is true', () => {
          ngDevMode!.namedConstructors = true;

          @Component({
            template: `
            <ul>
              <li *ngIf="true">item</li>
            </ul>
            `
          })
          class MyApp {
          }

          TestBed.configureTestingModule({declarations: [MyApp], imports: [CommonModule]});
          const fixture = TestBed.createComponent(MyApp);
          const rootLView = getLContext(fixture.nativeElement)!.lView;
          expect(rootLView.constructor.name)
              .toEqual(targetSupportsArraySubclassing ? 'LRootView' : 'Array');

          const componentLView = getComponentLView(fixture.componentInstance);
          expect(componentLView.constructor.name).toEqual('LComponentView_MyApp');

          const element: HTMLElement = fixture.nativeElement;
          fixture.detectChanges();
          const li = element.querySelector('li')!;
          const embeddedLView = getLContext(li)!.lView;
          expect(embeddedLView.constructor.name).toEqual('LEmbeddedView_MyApp_li_1');
        });
  });
});
