import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatLegacyProgressSpinnerHarness} from '@angular/material/legacy-progress-spinner/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatLegacyProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {ProgressSpinnerHarnessExample} from './progress-spinner-harness-example';

describe('ProgressSpinnerHarnessExample', () => {
  let fixture: ComponentFixture<ProgressSpinnerHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatLegacyProgressSpinnerModule],
      declarations: [ProgressSpinnerHarnessExample],
    }).compileComponents();
    fixture = TestBed.createComponent(ProgressSpinnerHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all progress spinner harnesses', async () => {
    const progressSpinners = await loader.getAllHarnesses(MatLegacyProgressSpinnerHarness);
    expect(progressSpinners.length).toBe(2);
  });

  it('should get the value', async () => {
    fixture.componentInstance.value = 50;
    const [determinate, impliedIndeterminate] = await loader.getAllHarnesses(
      MatLegacyProgressSpinnerHarness,
    );
    expect(await determinate.getValue()).toBe(50);
    expect(await impliedIndeterminate.getValue()).toBe(null);
  });

  it('should get the mode', async () => {
    const [determinate, impliedIndeterminate] = await loader.getAllHarnesses(
      MatLegacyProgressSpinnerHarness,
    );
    expect(await determinate.getMode()).toBe('determinate');
    expect(await impliedIndeterminate.getMode()).toBe('indeterminate');
  });
});
