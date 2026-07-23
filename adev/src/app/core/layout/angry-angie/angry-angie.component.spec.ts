/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {AngryAngie} from '../../services/angry-angie.service';
import {AngryAngieComponent} from './angry-angie.component';

describe('AngryAngieComponent', () => {
  const fakeAngie = {show: signal(false)};
  let fixture: ComponentFixture<AngryAngieComponent>;

  beforeEach(async () => {
    fakeAngie.show.set(false);
    TestBed.configureTestingModule({
      imports: [AngryAngieComponent],
      providers: [{provide: AngryAngie, useValue: fakeAngie}],
    });
    fixture = TestBed.createComponent(AngryAngieComponent);
    await fixture.whenStable();
  });

  const overlay = () => fixture.debugElement.query(By.css('.adev-angry-angie'));

  it('renders nothing while the easter egg is hidden', () => {
    expect(overlay()).toBeNull();
  });

  it('renders the overlay while the easter egg is showing', async () => {
    fakeAngie.show.set(true);
    await fixture.whenStable();

    expect(overlay()).not.toBeNull();
    expect(overlay().query(By.css('img'))).not.toBeNull();
  });
});
