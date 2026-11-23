/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {timeout} from '@angular/docs';
import {provideRouter, Router} from '@angular/router';

import {PROGRESS_BAR_DELAY, ProgressBarComponent} from './progress-bar.component';

@Component({template: ''})
class Page {}

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;
  let router: Router;
  let resolveSlowPage: () => void;
  let startSpy: jasmine.Spy;
  let completeSpy: jasmine.Spy;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
      providers: [
        provideRouter([
          {path: 'fast', component: Page},
          {
            path: 'slow',
            component: Page,
            resolve: {data: () => new Promise<void>((resolve) => (resolveSlowPage = resolve))},
          },
        ]),
      ],
    });

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();

    startSpy = spyOn(component.progressBar(), 'start');
    completeSpy = spyOn(component.progressBar(), 'complete');
  });

  it('should start the progress bar for slow navigations and complete it when they end', async () => {
    const navigation = router.navigateByUrl('/slow');
    await timeout(PROGRESS_BAR_DELAY * 2);

    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(completeSpy).not.toHaveBeenCalled();

    resolveSlowPage();
    await navigation;
    await fixture.whenStable();

    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(completeSpy).toHaveBeenCalledTimes(1);
  });

  it('should not start the progress bar for navigations faster than the delay', async () => {
    await router.navigateByUrl('/fast');
    await fixture.whenStable();
    await timeout(PROGRESS_BAR_DELAY * 2);

    expect(startSpy).not.toHaveBeenCalled();
  });

  it('should complete the progress bar when a navigation is canceled', async () => {
    const navigation = router.navigateByUrl('/slow');
    await timeout(PROGRESS_BAR_DELAY * 2);
    expect(startSpy).toHaveBeenCalledTimes(1);

    router.currentNavigation()?.abort();
    await navigation;
    await fixture.whenStable();

    expect(completeSpy).toHaveBeenCalledTimes(1);
  });
});
