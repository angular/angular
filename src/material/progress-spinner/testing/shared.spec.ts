import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatProgressSpinnerModule, ProgressSpinnerMode} from '@angular/material/progress-spinner';
import {MatProgressSpinnerHarness} from './progress-spinner-harness';

export function runHarnessTests(progressSpinnerModule: typeof MatProgressSpinnerModule,
                                progressSpinnerHarness: typeof MatProgressSpinnerHarness) {
  let fixture: ComponentFixture<ProgressSpinnerHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed
        .configureTestingModule({
          imports: [MatProgressSpinnerModule],
          declarations: [ProgressSpinnerHarnessTest],
        })
        .compileComponents();

    fixture = TestBed.createComponent(ProgressSpinnerHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all progress spinner harnesses', async () => {
    const progressSpinners = await loader.getAllHarnesses(progressSpinnerHarness);
    expect(progressSpinners.length).toBe(2);
  });

  it('should get the value', async () => {
    fixture.componentInstance.value = 50;
    const [determinate, indeterminate] = await loader.getAllHarnesses(progressSpinnerHarness);
    expect(await determinate.getValue()).toBe(50);
    expect(await indeterminate.getValue()).toBe(null);
  });

  it('should get the mode', async () => {
    const [determinate, indeterminate] = await loader.getAllHarnesses(progressSpinnerHarness);
    expect<ProgressSpinnerMode>(await determinate.getMode()).toBe('determinate');
    expect<ProgressSpinnerMode>(await indeterminate.getMode()).toBe('indeterminate');
  });
}

@Component({
  template: `
    <mat-progress-spinner mode="determinate" [value]="value"></mat-progress-spinner>
    <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
  `
})
class ProgressSpinnerHarnessTest {
  value: number;
}
