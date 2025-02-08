/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Router, RouterModule} from '@angular/router';
import {getLoadedRoutes} from '../src/router_devtools';

@Component({template: '<div>simple standalone</div>'})
export class SimpleStandaloneComponent {}

@Component({
  template: '<router-outlet></router-outlet>',
  imports: [RouterModule],
})
export class RootCmp {}

describe('router_devtools', () => {
  describe('getLoadedRoutes', () => {
    it('should return loaded routes when called with load children', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'lazy',
              component: RootCmp,
              loadChildren: () => [{path: 'simple', component: SimpleStandaloneComponent}],
            },
          ]),
        ],
      });

      const root = TestBed.createComponent(RootCmp);

      const router = TestBed.inject(Router);
      router.navigateByUrl('/lazy/simple');
      advance(root);
      expect(root.nativeElement.innerHTML).toContain('simple standalone');

      const loadedRoutes = getLoadedRoutes(router.config[0]);
      const loadedPath = loadedRoutes && loadedRoutes[0].path;
      expect(loadedPath).toEqual('simple');
    }));
  });

  it('should return undefined when called without load children', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          {
            path: 'lazy',
            component: RootCmp,
          },
        ]),
      ],
    });

    const root = TestBed.createComponent(RootCmp);

    const router = TestBed.inject(Router);
    router.navigateByUrl('/lazy');
    advance(root);
    expect(root.nativeElement.innerHTML).toContain('');

    const loadedRoutes = getLoadedRoutes(router.config[0]);
    const loadedPath = loadedRoutes && loadedRoutes[0].path;
    expect(loadedPath).toEqual(undefined);
  }));
});

function advance(fixture: ComponentFixture<unknown>) {
  tick();
  fixture.detectChanges();
}
