import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatLegacyTabGroupHarness} from '@angular/material/legacy-tabs/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatLegacyTabsModule} from '@angular/material/legacy-tabs';
import {TabGroupHarnessExample} from './tab-group-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('TabGroupHarnessExample', () => {
  let fixture: ComponentFixture<TabGroupHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatLegacyTabsModule, NoopAnimationsModule],
      declarations: [TabGroupHarnessExample],
    }).compileComponents();
    fixture = TestBed.createComponent(TabGroupHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness for tab-group', async () => {
    const tabGroups = await loader.getAllHarnesses(MatLegacyTabGroupHarness);
    expect(tabGroups.length).toBe(1);
  });

  it('should load harness for tab-group with selected tab label', async () => {
    const tabGroups = await loader.getAllHarnesses(
      MatLegacyTabGroupHarness.with({
        selectedTabLabel: 'Profile',
      }),
    );
    expect(tabGroups.length).toBe(1);
  });

  it('should be able to get tabs of tab-group', async () => {
    const tabGroup = await loader.getHarness(MatLegacyTabGroupHarness);
    const tabs = await tabGroup.getTabs();
    expect(tabs.length).toBe(3);
  });

  it('should be able to select tab from tab-group', async () => {
    const tabGroup = await loader.getHarness(MatLegacyTabGroupHarness);
    expect(await (await tabGroup.getSelectedTab()).getLabel()).toBe('Profile');
    await tabGroup.selectTab({label: 'FAQ'});
    expect(await (await tabGroup.getSelectedTab()).getLabel()).toBe('FAQ');
  });
});
