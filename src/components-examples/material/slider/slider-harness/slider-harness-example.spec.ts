import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatSliderHarness} from '@angular/material/slider/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatSliderModule} from '@angular/material/slider';
import {SliderHarnessExample} from './slider-harness-example';

describe('SliderHarnessExample', () => {
  let fixture: ComponentFixture<SliderHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSliderModule],
      declarations: [SliderHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(SliderHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all slider harnesses', async () => {
    const sliders = await loader.getAllHarnesses(MatSliderHarness);
    expect(sliders.length).toBe(1);
  });

  it('should get value of slider', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    expect(await slider.getValue()).toBe(50);
  });

  it('should get percentage of slider', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    expect(await slider.getPercentage()).toBe(0.5);
  });

  it('should get max value of slider', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    expect(await slider.getMaxValue()).toBe(100);
  });


  it('should be able to set value of slider', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    expect(await slider.getValue()).toBe(50);

    await slider.setValue(33);

    expect(await slider.getValue()).toBe(33);
  });
});
