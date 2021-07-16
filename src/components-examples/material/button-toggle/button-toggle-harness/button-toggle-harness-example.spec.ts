import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatButtonToggleGroupHarness} from '@angular/material/button-toggle/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {ButtonToggleHarnessExample} from './button-toggle-harness-example';

describe('ButtonToggleHarnessExample', () => {
  let fixture: ComponentFixture<ButtonToggleHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonToggleModule],
      declarations: [ButtonToggleHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(ButtonToggleHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all button toggle group harnesses', async () => {
    const groups = await loader.getAllHarnesses(MatButtonToggleGroupHarness);
    expect(groups.length).toBe(1);
  });

  it('should load the toggles inside the group', async () => {
    const group = await loader.getHarness(MatButtonToggleGroupHarness);
    const toggles = await group.getToggles();
    expect(toggles.length).toBe(2);
  });

  it('should get whether the group is disabled', async () => {
    const group = await loader.getHarness(MatButtonToggleGroupHarness);
    expect(await group.isDisabled()).toBe(false);
    fixture.componentInstance.disabled = true;
    expect(await group.isDisabled()).toBe(true);
  });

  it('should get the group appearance', async () => {
    const group = await loader.getHarness(MatButtonToggleGroupHarness);
    expect(await group.getAppearance()).toBe('standard');
    fixture.componentInstance.appearance = 'legacy';
    expect(await group.getAppearance()).toBe('legacy');
  });
});
