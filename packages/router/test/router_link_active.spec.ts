/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Router, RouterLink, RouterLinkActive, provideRouter} from '../index';

describe('RouterLinkActive', () => {
  it('removes initial active class even if never active', async () => {
    @Component({
      imports: [RouterLinkActive, RouterLink],
      template: '<a class="active" routerLinkActive="active" routerLink="/abc123"></a>',
    })
    class MyCmp {}

    TestBed.configureTestingModule({providers: [provideRouter([{path: '**', children: []}])]});
    const fixture = TestBed.createComponent(MyCmp);
    fixture.autoDetectChanges();
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('a').classList.value).toEqual('');
  });
});
