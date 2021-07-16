import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatSlideToggleHarness} from '@angular/material/slide-toggle/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {SlideToggleHarnessExample} from './slide-toggle-harness-example';
import {ReactiveFormsModule} from '@angular/forms';

describe('SlideToggleHarnessExample', () => {
  let fixture: ComponentFixture<SlideToggleHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSlideToggleModule, ReactiveFormsModule],
      declarations: [SlideToggleHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(SlideToggleHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all slide-toggle harnesses', async () => {
    const slideToggles = await loader.getAllHarnesses(MatSlideToggleHarness);
    expect(slideToggles.length).toBe(2);
  });

  it('should load slide-toggle with name', async () => {
    const slideToggles = await loader.getAllHarnesses(
      MatSlideToggleHarness.with({name: 'first-name'}));
    expect(slideToggles.length).toBe(1);
    expect(await slideToggles[0].getLabelText()).toBe('First');
  });

  it('should get disabled state', async () => {
    const [enabledToggle, disabledToggle] = await loader.getAllHarnesses(MatSlideToggleHarness);
    expect(await enabledToggle.isDisabled()).toBe(false);
    expect(await disabledToggle.isDisabled()).toBe(true);
  });

  it('should get label text', async () => {
    const [firstToggle, secondToggle] = await loader.getAllHarnesses(MatSlideToggleHarness);
    expect(await firstToggle.getLabelText()).toBe('First');
    expect(await secondToggle.getLabelText()).toBe('Second');
  });

  it('should toggle slide-toggle', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(MatSlideToggleHarness);
    await checkedToggle.toggle();
    await uncheckedToggle.toggle();
    expect(await checkedToggle.isChecked()).toBe(false);
    expect(await uncheckedToggle.isChecked()).toBe(true);
  });
});
