/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PROGRESS_BAR_DELAY, ProgressBarComponent} from './progress-bar.component';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideRouter} from '@angular/router';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // This test often timeouts
  // We suspect a racing condition inside the RouterTestingHarness.
  // Until this has been investigated, we will skip this test.
  xit('should call progressBar.complete() on route change', async () => {
    const progressBarCompleteSpy = spyOn(component.progressBar(), 'complete');

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');

    await new Promise((resolve) => setTimeout(resolve, PROGRESS_BAR_DELAY));
    expect(progressBarCompleteSpy).toHaveBeenCalled();
  });
});
