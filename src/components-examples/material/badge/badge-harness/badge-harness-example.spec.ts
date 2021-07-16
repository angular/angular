import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatBadgeHarness} from '@angular/material/badge/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatBadgeModule} from '@angular/material/badge';
import {BadgeHarnessExample} from './badge-harness-example';

describe('BadgeHarnessExample', () => {
  let fixture: ComponentFixture<BadgeHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatBadgeModule],
      declarations: [BadgeHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(BadgeHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all badge harnesses', async () => {
    const badges = await loader.getAllHarnesses(MatBadgeHarness);
    expect(badges.length).toBe(3);
  });

  it('should be able to get the text of a badge', async () => {
    const badge = await loader.getHarness(MatBadgeHarness.with({selector: '#simple'}));

    expect(await badge.getText()).toBe('S');
    fixture.componentInstance.simpleContent = 'Changed';
    expect(await badge.getText()).toBe('Changed');
  });

  it('should get whether a badge is overlapping', async () => {
    const badge = await loader.getHarness(MatBadgeHarness.with({selector: '#overlapping'}));

    expect(await badge.isOverlapping()).toBe(true);
    fixture.componentInstance.overlap = false;
    expect(await badge.isOverlapping()).toBe(false);
  });

  it('should get whether a badge is disabled', async () => {
    const badge = await loader.getHarness(MatBadgeHarness.with({selector: '#disabled'}));

    expect(await badge.isDisabled()).toBe(true);
    fixture.componentInstance.disabled = false;
    expect(await badge.isDisabled()).toBe(false);
  });
});
