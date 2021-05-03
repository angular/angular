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
import {TestBed} from '@angular/core/testing';
import {onlyInIvy} from '@angular/private/testing';

const supportsArraySubclassing =
    createNamedArrayType('SupportsArraySubclassing').name === 'SupportsArraySubclassing';

onlyInIvy('Debug information exist in ivy only').describe('ngDevMode debug', () => {
  describe('LViewDebug', () => {
    supportsArraySubclassing && it('should name LView based on type', () => {
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
      expect(rootLView.constructor.name).toEqual('LRootView');

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
