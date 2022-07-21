import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatLegacyProgressBarHarness} from '@angular/material/legacy-progress-bar/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatLegacyProgressBarModule} from '@angular/material/legacy-progress-bar';
import {ProgressBarHarnessExample} from './progress-bar-harness-example';

describe('ProgressBarHarnessExample', () => {
  let fixture: ComponentFixture<ProgressBarHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatLegacyProgressBarModule],
      declarations: [ProgressBarHarnessExample],
    }).compileComponents();
    fixture = TestBed.createComponent(ProgressBarHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all progress bar harnesses', async () => {
    const progressBars = await loader.getAllHarnesses(MatLegacyProgressBarHarness);
    expect(progressBars.length).toBe(2);
  });

  it('should get the value', async () => {
    fixture.componentInstance.value = 50;
    const [determinate, indeterminate] = await loader.getAllHarnesses(MatLegacyProgressBarHarness);
    expect(await determinate.getValue()).toBe(50);
    expect(await indeterminate.getValue()).toBe(null);
  });

  it('should get the mode', async () => {
    const [determinate, indeterminate] = await loader.getAllHarnesses(MatLegacyProgressBarHarness);
    expect(await determinate.getMode()).toBe('determinate');
    expect(await indeterminate.getMode()).toBe('indeterminate');
  });
});
