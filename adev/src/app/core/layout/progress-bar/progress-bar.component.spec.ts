/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PROGRESS_BAR_DELAY, ProgressBarComponent} from './progress-bar.component';
import {RouterTestingHarness, RouterTestingModule} from '@angular/router/testing';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call progressBar.complete() on route change', async () => {
    const progressBar = component.progressBar();
    const progressBarCompleteSpy = spyOn(progressBar, 'complete');

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');

    await new Promise((resolve) => setTimeout(resolve, PROGRESS_BAR_DELAY));
    expect(progressBarCompleteSpy).toHaveBeenCalled();
  });
});
