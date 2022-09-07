import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatTabsModule} from '@angular/material/tabs';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabNavBarHarness} from './tab-nav-bar-harness';

/** Shared tests to run on both the original and MDC-based tab nav bars. */
export function runTabNavBarHarnessTests(
  tabsModule: typeof MatTabsModule,
  tabNavBarHarness: typeof MatTabNavBarHarness,
) {
  let fixture: ComponentFixture<TabNavBarHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [tabsModule, NoopAnimationsModule],
      declarations: [TabNavBarHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(TabNavBarHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness for tab nav bar', async () => {
    const navBars = await loader.getAllHarnesses(tabNavBarHarness);
    expect(navBars.length).toBe(1);
  });

  it('should be able to get links of nav bar', async () => {
    const navBar = await loader.getHarness(tabNavBarHarness);
    const links = await navBar.getLinks();
    expect(links.length).toBe(3);
  });

  it('should be able to get filtered links', async () => {
    const navBar = await loader.getHarness(tabNavBarHarness);
    const links = await navBar.getLinks({label: 'Third'});
    expect(links.length).toBe(1);
    expect(await links[0].getLabel()).toBe('Third');
  });

  it('should be able to click tab from nav bar', async () => {
    const navBar = await loader.getHarness(tabNavBarHarness);
    expect(await (await navBar.getActiveLink()).getLabel()).toBe('First');
    await navBar.clickLink({label: 'Second'});
    expect(await (await navBar.getActiveLink()).getLabel()).toBe('Second');
  });

  it('should throw error when attempting to click invalid link', async () => {
    const navBar = await loader.getHarness(tabNavBarHarness);
    await expectAsync(navBar.clickLink({label: 'Fake'})).toBeRejectedWithError(
      /Cannot find mat-tab-link matching filter {"label":"Fake"}/,
    );
  });

  it('should be able to get label of links', async () => {
    const navBar = await loader.getHarness(tabNavBarHarness);
    const links = await navBar.getLinks();
    expect(await links[0].getLabel()).toBe('First');
    expect(await links[1].getLabel()).toBe('Second');
    expect(await links[2].getLabel()).toBe('Third');
  });

  it('should be able to get disabled state of link', async () => {
    const navBar = await loader.getHarness(tabNavBarHarness);
    const links = await navBar.getLinks();
    expect(await links[0].isDisabled()).toBe(false);
    expect(await links[1].isDisabled()).toBe(false);
    expect(await links[2].isDisabled()).toBe(false);

    fixture.componentInstance.isDisabled = true;
    fixture.detectChanges();

    expect(await links[0].isDisabled()).toBe(false);
    expect(await links[1].isDisabled()).toBe(false);
    expect(await links[2].isDisabled()).toBe(true);
  });

  it('should be able to click specific link', async () => {
    const navBar = await loader.getHarness(tabNavBarHarness);
    const links = await navBar.getLinks();
    expect(await links[0].isActive()).toBe(true);
    expect(await links[1].isActive()).toBe(false);
    expect(await links[2].isActive()).toBe(false);

    await links[1].click();
    expect(await links[0].isActive()).toBe(false);
    expect(await links[1].isActive()).toBe(true);
    expect(await links[2].isActive()).toBe(false);
  });

  it('should be able to get the associated tab panel', async () => {
    const navBar = await loader.getHarness(tabNavBarHarness);
    const navPanel = await navBar.getPanel();
    expect(await navPanel.getTextContent()).toBe('Tab content');
  });
}

@Component({
  template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel">
      <a href="#" (click)="select(0, $event)" [active]="activeLink === 0" matTabLink>First</a>
      <a href="#" (click)="select(1, $event)" [active]="activeLink === 1" matTabLink>Second</a>
      <a
        href="#"
        (click)="select(2, $event)"
        [active]="activeLink === 2"
        [disabled]="isDisabled"
        matTabLink>Third</a>
    </nav>
    <mat-tab-nav-panel #tabPanel id="tab-panel">
      Tab content
    </mat-tab-nav-panel>
  `,
})
class TabNavBarHarnessTest {
  activeLink = 0;
  isDisabled = false;

  select(index: number, event: MouseEvent) {
    this.activeLink = index;
    event.preventDefault();
  }
}
