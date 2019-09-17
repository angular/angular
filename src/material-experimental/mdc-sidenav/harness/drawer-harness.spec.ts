import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSidenavModule} from '@angular/material/sidenav';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatSidenavModule as MatMdcSidenavModule} from '../index';
import {MatDrawerHarness} from './drawer-harness';
import {MatDrawerHarness as MatMdcDrawerHarness} from './mdc-drawer-harness';

let fixture: ComponentFixture<DrawerHarnessTest>;
let loader: HarnessLoader;
let harness: typeof MatDrawerHarness;

describe('MatDrawerHarness', () => {
  describe('non-MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatSidenavModule, NoopAnimationsModule],
        declarations: [DrawerHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(DrawerHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      harness = MatDrawerHarness;
    });

    runTests();
  });

  describe('MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatMdcSidenavModule, NoopAnimationsModule],
        declarations: [DrawerHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(DrawerHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      // Public APIs are the same as MatDrawerHarness, but cast
      // is necessary because of different private fields.
      harness = MatMdcDrawerHarness as any;
    });

    // TODO: enable after MDC drawer is implemented
    // runTests();
  });
});

/** Shared tests to run on both the original and MDC-based drawer. */
function runTests() {
  it('should load all drawer harnesses', async () => {
    const drawers = await loader.getAllHarnesses(harness);
    expect(drawers.length).toBe(3);
  });

  it('should be able to get whether the drawer is open', async () => {
    const drawers = await loader.getAllHarnesses(harness);

    expect(await drawers[0].isOpen()).toBe(false);
    expect(await drawers[1].isOpen()).toBe(false);
    expect(await drawers[2].isOpen()).toBe(true);

    fixture.componentInstance.threeOpened = false;
    fixture.detectChanges();

    expect(await drawers[0].isOpen()).toBe(false);
    expect(await drawers[1].isOpen()).toBe(false);
    expect(await drawers[2].isOpen()).toBe(false);
  });

  it('should be able to get the position of a drawer', async () => {
    const drawers = await loader.getAllHarnesses(harness);

    expect(await drawers[0].getPosition()).toBe('start');
    expect(await drawers[1].getPosition()).toBe('end');
    expect(await drawers[2].getPosition()).toBe('start');
  });

  it('should be able to get the mode of a drawer', async () => {
    const drawers = await loader.getAllHarnesses(harness);

    expect(await drawers[0].getMode()).toBe('over');
    expect(await drawers[1].getMode()).toBe('side');
    expect(await drawers[2].getMode()).toBe('push');
  });
}

@Component({
  template: `
    <mat-drawer-container>
      <mat-drawer id="one" [opened]="oneOpened" position="start">One</mat-drawer>
      <mat-drawer id="two" mode="side" position="end">Two</mat-drawer>
      <mat-drawer-content>Content</mat-drawer-content>
    </mat-drawer-container>

    <mat-drawer-container>
      <mat-drawer id="three" mode="push" [opened]="threeOpened">Three</mat-drawer>
      <mat-drawer-content>Content</mat-drawer-content>
    </mat-drawer-container>
  `
})
class DrawerHarnessTest {
  threeOpened = true;
}

