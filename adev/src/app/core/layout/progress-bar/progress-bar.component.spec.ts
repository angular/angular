/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProgressBarComponent} from './progress-bar.component';
import {RouterTestingHarness, RouterTestingModule} from '@angular/router/testing';
import {Event, NavigationEnd, NavigationStart, Router} from '@angular/router';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [ProgressBarComponent]});

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call progressBar.complete() on route change', async () => {
    const progressBar = component.progressBar();
    const progressBarCompleteSpy = spyOn(progressBar, 'complete');

    const events: Event[] = [];
    const router = TestBed.inject(Router);
    router.events.subscribe((e) => events.push(e));

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');

    // This is to investigate the flakiness of the test.
    expect(events).toContain(jasmine.any(NavigationStart));
    expect(events).toContain(jasmine.any(NavigationEnd));

    expect(progressBarCompleteSpy).toHaveBeenCalled();
  });
});
