import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import {MatProgressBarHarness} from './progress-bar-harness';

let fixture: ComponentFixture<ProgressBarHarnessTest>;
let loader: HarnessLoader;
let progressBarHarness: typeof MatProgressBarHarness;

describe('MatProgressBarHarness', () => {
  beforeEach(async () => {
    await TestBed
        .configureTestingModule({
          imports: [MatProgressBarModule],
          declarations: [ProgressBarHarnessTest],
        })
        .compileComponents();

    fixture = TestBed.createComponent(ProgressBarHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    progressBarHarness = MatProgressBarHarness;
  });

  runTests();
});

function runTests() {
  it('should load all progress bar harnesses', async () => {
    const progressBars = await loader.getAllHarnesses(progressBarHarness);
    expect(progressBars.length).toBe(2);
  });

  it('should get the value', async () => {
    fixture.componentInstance.value = 50;
    const [determinate, indeterminate] = await loader.getAllHarnesses(progressBarHarness);
    expect(await determinate.getValue()).toBe(50);
    expect(await indeterminate.getValue()).toBe(null);
  });

  it('should get the mode', async () => {
    const [determinate, indeterminate] = await loader.getAllHarnesses(progressBarHarness);
    expect(await determinate.getMode()).toBe('determinate');
    expect(await indeterminate.getMode()).toBe('indeterminate');
  });
}

// TODO: Add and test progress bars with modes `buffer` and `query`.
@Component({
  template: `
    <mat-progress-bar mode="determinate" [value]="value"></mat-progress-bar>
    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
  `
})
class ProgressBarHarnessTest {
  value: number;
}
