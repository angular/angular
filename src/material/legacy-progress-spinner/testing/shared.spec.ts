import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatLegacyProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {MatLegacyProgressSpinnerHarness} from './progress-spinner-harness';

/** Runs the shared unit tests for the progress spinner test harness. */
export function runHarnessTests(
  progressSpinnerModule: typeof MatLegacyProgressSpinnerModule,
  progressSpinnerHarness: typeof MatLegacyProgressSpinnerHarness,
) {
  let fixture: ComponentFixture<ProgressSpinnerHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [progressSpinnerModule],
      declarations: [ProgressSpinnerHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressSpinnerHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all progress spinner harnesses', async () => {
    const progressSpinners = await loader.getAllHarnesses(progressSpinnerHarness);
    expect(progressSpinners.length).toBe(3);
  });

  it('should get the value', async () => {
    fixture.componentInstance.value = 50;
    const [determinate, indeterminate, impliedIndeterminate] = await loader.getAllHarnesses(
      progressSpinnerHarness,
    );
    expect(await determinate.getValue()).toBe(50);
    expect(await indeterminate.getValue()).toBe(null);
    expect(await impliedIndeterminate.getValue()).toBe(null);
  });

  it('should get the mode', async () => {
    const [determinate, indeterminate, impliedIndeterminate] = await loader.getAllHarnesses(
      progressSpinnerHarness,
    );
    expect(await determinate.getMode()).toBe('determinate');
    expect(await indeterminate.getMode()).toBe('indeterminate');
    expect(await impliedIndeterminate.getMode()).toBe('indeterminate');
  });
}

@Component({
  template: `
    <mat-progress-spinner mode="determinate" [value]="value"></mat-progress-spinner>
    <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
    <mat-spinner></mat-spinner>
  `,
})
class ProgressSpinnerHarnessTest {
  value: number;
}
