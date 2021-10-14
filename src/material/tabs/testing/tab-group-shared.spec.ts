import {ComponentHarness, HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatTabsModule} from '@angular/material/tabs';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabGroupHarness} from './tab-group-harness';

/** Shared tests to run on both the original and MDC-based tab-group's. */
export function runTabGroupHarnessTests(
  tabsModule: typeof MatTabsModule,
  tabGroupHarness: typeof MatTabGroupHarness,
) {
  let fixture: ComponentFixture<TabGroupHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [tabsModule, NoopAnimationsModule],
      declarations: [TabGroupHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(TabGroupHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness for tab-group', async () => {
    const tabGroups = await loader.getAllHarnesses(tabGroupHarness);
    expect(tabGroups.length).toBe(1);
  });

  it('should load harness for tab-group with selected tab label', async () => {
    const tabGroups = await loader.getAllHarnesses(
      tabGroupHarness.with({
        selectedTabLabel: 'First',
      }),
    );
    expect(tabGroups.length).toBe(1);
  });

  it('should load harness for tab-group with matching tab label regex', async () => {
    const tabGroups = await loader.getAllHarnesses(
      tabGroupHarness.with({
        selectedTabLabel: /f.*st/i,
      }),
    );
    expect(tabGroups.length).toBe(1);
  });

  it('should be able to get tabs of tab-group', async () => {
    const tabGroup = await loader.getHarness(tabGroupHarness);
    const tabs = await tabGroup.getTabs();
    expect(tabs.length).toBe(3);
  });

  it('should be able to get filtered tabs', async () => {
    const tabGroup = await loader.getHarness(tabGroupHarness);
    const tabs = await tabGroup.getTabs({label: 'Third'});
    expect(tabs.length).toBe(1);
    expect(await tabs[0].getLabel()).toBe('Third');
  });

  it('should be able to select tab from tab-group', async () => {
    const tabGroup = await loader.getHarness(tabGroupHarness);
    expect(await (await tabGroup.getSelectedTab()).getLabel()).toBe('First');
    await tabGroup.selectTab({label: 'Second'});
    expect(await (await tabGroup.getSelectedTab()).getLabel()).toBe('Second');
  });

  it('should throw error when attempting to select invalid tab', async () => {
    const tabGroup = await loader.getHarness(tabGroupHarness);
    await expectAsync(tabGroup.selectTab({label: 'Fake'})).toBeRejectedWithError(
      /Cannot find mat-tab matching filter {"label":"Fake"}/,
    );
  });

  it('should be able to get label of tabs', async () => {
    const tabGroup = await loader.getHarness(tabGroupHarness);
    const tabs = await tabGroup.getTabs();
    expect(await tabs[0].getLabel()).toBe('First');
    expect(await tabs[1].getLabel()).toBe('Second');
    expect(await tabs[2].getLabel()).toBe('Third');
  });

  it('should be able to get aria-label of tabs', async () => {
    const tabGroup = await loader.getHarness(tabGroupHarness);
    const tabs = await tabGroup.getTabs();
    expect(await tabs[0].getAriaLabel()).toBe('First tab');
    expect(await tabs[1].getAriaLabel()).toBe('Second tab');
    expect(await tabs[2].getAriaLabel()).toBe(null);
  });

  it('should be able to get aria-labelledby of tabs', async () => {
    const tabGroup = await loader.getHarness(tabGroupHarness);
    const tabs = await tabGroup.getTabs();
    expect(await tabs[0].getAriaLabelledby()).toBe(null);
    expect(await tabs[1].getAriaLabelledby()).toBe(null);
    expect(await tabs[2].getAriaLabelledby()).toBe('tabLabelId');
  });

  it('should be able to get harness for content element of active tab', async () => {
    const tabGroup = await loader.getHarness(tabGroupHarness);
    const tabs = await tabGroup.getTabs();
    expect(await tabs[0].getTextContent()).toBe('Content 1');
    const tabContentHarness = await tabs[0].getHarness(TestTabContentHarness);
    expect(await (await tabContentHarness.host()).text()).toBe('Content 1');
  });

  it('should be able to get disabled state of tab', async () => {
    const tabGroup = await loader.getHarness(tabGroupHarness);
    const tabs = await tabGroup.getTabs();
    expect(await tabs[0].isDisabled()).toBe(false);
    expect(await tabs[1].isDisabled()).toBe(false);
    expect(await tabs[2].isDisabled()).toBe(false);

    fixture.componentInstance.isDisabled = true;
    fixture.detectChanges();

    expect(await tabs[0].isDisabled()).toBe(false);
    expect(await tabs[1].isDisabled()).toBe(false);
    expect(await tabs[2].isDisabled()).toBe(true);
  });

  it('should be able to select specific tab', async () => {
    const tabGroup = await loader.getHarness(tabGroupHarness);
    const tabs = await tabGroup.getTabs();
    expect(await tabs[0].isSelected()).toBe(true);
    expect(await tabs[1].isSelected()).toBe(false);
    expect(await tabs[2].isSelected()).toBe(false);

    await tabs[1].select();
    expect(await tabs[0].isSelected()).toBe(false);
    expect(await tabs[1].isSelected()).toBe(true);
    expect(await tabs[2].isSelected()).toBe(false);

    // Should not be able to select third tab if disabled.
    fixture.componentInstance.isDisabled = true;
    fixture.detectChanges();

    await tabs[2].select();
    expect(await tabs[0].isSelected()).toBe(false);
    expect(await tabs[1].isSelected()).toBe(true);
    expect(await tabs[2].isSelected()).toBe(false);

    // Should be able to select third tab if not disabled.
    fixture.componentInstance.isDisabled = false;
    fixture.detectChanges();
    await tabs[2].select();
    expect(await tabs[0].isSelected()).toBe(false);
    expect(await tabs[1].isSelected()).toBe(false);
    expect(await tabs[2].isSelected()).toBe(true);
  });
}

@Component({
  template: `
    <mat-tab-group>
      <mat-tab label="First" aria-label="First tab">
        <span class="test-tab-content">Content 1</span>
      </mat-tab>
      <mat-tab label="Second" aria-label="Second tab">
        <span class="test-tab-content">Content 2</span>
      </mat-tab>
      <mat-tab label="Third" aria-labelledby="tabLabelId" [disabled]="isDisabled">
        <ng-template matTabLabel>Third</ng-template>
        <span class="test-tab-content">Content 3</span>
      </mat-tab>
    </mat-tab-group>
  `,
})
class TabGroupHarnessTest {
  isDisabled = false;
}

class TestTabContentHarness extends ComponentHarness {
  static hostSelector = '.test-tab-content';
}
