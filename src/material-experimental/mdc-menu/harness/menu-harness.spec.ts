import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {MatMenuModule} from '@angular/material/menu';
import {OverlayContainer} from '@angular/cdk/overlay';
import {MatMenuModule as MatMdcMenuModule} from '../index';
import {MatMenuHarness as MatMdcMenuHarness} from './mdc-menu-harness';
import {MatMenuHarness} from './menu-harness';

let fixture: ComponentFixture<MenuHarnessTest>;
let loader: HarnessLoader;
let menuHarness: typeof MatMenuHarness;
let overlayContainer: OverlayContainer;

describe('MatMenuHarness', () => {
  describe('non-MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatMenuModule],
        declarations: [MenuHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      menuHarness = MatMenuHarness;
      inject([OverlayContainer], (oc: OverlayContainer) => {
        overlayContainer = oc;
      })();
    });

    runTests();
  });

  describe('MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatMdcMenuModule],
        declarations: [MenuHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      // Public APIs are the same as MatMenuHarness, but cast is necessary because of different
      // private fields.
      menuHarness = MatMdcMenuHarness as any;
    });

    runTests();
  });
});

/** Shared tests to run on both the original and MDC-based menues. */
function runTests() {
  afterEach(() => {
    // Angular won't call this for us so we need to do it ourselves to avoid leaks.
    overlayContainer.ngOnDestroy();
  });

  it('should load all menu harnesses', async () => {
    const menues = await loader.getAllHarnesses(menuHarness);
    expect(menues.length).toBe(2);
  });

  it('should load menu with exact text', async () => {
    const menus = await loader.getAllHarnesses(menuHarness.with({triggerText: 'Settings'}));
    expect(menus.length).toBe(1);
    expect(await menus[0].getTriggerText()).toBe('Settings');
  });

  it('should load menu with regex label match', async () => {
    const menus = await loader.getAllHarnesses(menuHarness.with({triggerText: /settings/i}));
    expect(menus.length).toBe(1);
    expect(await menus[0].getTriggerText()).toBe('Settings');
  });

  it('should get disabled state', async () => {
    const [enabledMenu, disabledMenu] = await loader.getAllHarnesses(menuHarness);
    expect(await enabledMenu.isDisabled()).toBe(false);
    expect(await disabledMenu.isDisabled()).toBe(true);
  });

  it('should get menu text', async () => {
    const [firstMenu, secondMenu] = await loader.getAllHarnesses(menuHarness);
    expect(await firstMenu.getTriggerText()).toBe('Settings');
    expect(await secondMenu.getTriggerText()).toBe('Disabled menu');
  });

  it('should focus and blur a menu', async () => {
    const menu = await loader.getHarness(menuHarness.with({triggerText: 'Settings'}));
    expect(getActiveElementId()).not.toBe('settings');
    await menu.focus();
    expect(getActiveElementId()).toBe('settings');
    await menu.blur();
    expect(getActiveElementId()).not.toBe('settings');
  });
}

function getActiveElementId() {
  return document.activeElement ? document.activeElement.id : '';
}

@Component({
  template: `
      <button type="button" id="settings" [matMenuTriggerFor]="settingsMenu">Settings</button>
      <button type="button" disabled [matMenuTriggerFor]="settingsMenu">Disabled menu</button>

      <mat-menu #settingsMenu>
        <menu mat-menu-item>Profile</menu>
        <menu mat-menu-item>Account</menu>
      </mat-menu>
  `
})
class MenuHarnessTest { }

