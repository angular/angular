import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatProgressBarHarness} from '@angular/material/progress-bar/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {ProgressBarHarnessExample} from './progress-bar-harness-example';

describe('ProgressBarHarnessExample', () => {
  let fixture: ComponentFixture<ProgressBarHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatProgressBarModule],
      declarations: [ProgressBarHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(ProgressBarHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all progress bar harnesses', async () => {
    const progressBars = await loader.getAllHarnesses(MatProgressBarHarness);
    expect(progressBars.length).toBe(2);
  });

  it('should get the value', async () => {
    fixture.componentInstance.value = 50;
    const [determinate, indeterminate] = await loader.getAllHarnesses(MatProgressBarHarness);
    expect(await determinate.getValue()).toBe(50);
    expect(await indeterminate.getValue()).toBe(null);
  });

  it('should get the mode', async () => {
    const [determinate, indeterminate] = await loader.getAllHarnesses(MatProgressBarHarness);
    expect(await determinate.getMode()).toBe('determinate');
    expect(await indeterminate.getMode()).toBe('indeterminate');
  });
});
