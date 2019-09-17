import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSidenavModule} from '@angular/material/sidenav';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatSidenavModule as MatMdcSidenavModule} from '../index';
import {MatSidenavHarness} from './sidenav-harness';
import {MatDrawerHarness as MatMdcSidenavHarness} from './mdc-drawer-harness';

let fixture: ComponentFixture<SidenavHarnessTest>;
let loader: HarnessLoader;
let harness: typeof MatSidenavHarness;

describe('MatSidenavHarness', () => {
  describe('non-MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatSidenavModule, NoopAnimationsModule],
        declarations: [SidenavHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(SidenavHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      harness = MatSidenavHarness;
    });

    runTests();
  });

  describe('MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatMdcSidenavModule, NoopAnimationsModule],
        declarations: [SidenavHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(SidenavHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      // Public APIs are the same as MatSidenavHarness, but cast
      // is necessary because of different private fields.
      harness = MatMdcSidenavHarness as any;
    });

    // TODO: enable after MDC sidenav is implemented
    // runTests();
  });
});

/**
 * Shared tests to run on both the original and MDC-based sidenav. Only tests logic that
 * is specific to `mat-sidenav`, everything else is with the `mat-drawer` tests.
 */
function runTests() {
  it('should be able to get whether a sidenav is fixed in the viewport', async () => {
    const sidenavs = await loader.getAllHarnesses(harness);

    expect(await sidenavs[0].isFixedInViewport()).toBe(false);
    expect(await sidenavs[1].isFixedInViewport()).toBe(false);
    expect(await sidenavs[2].isFixedInViewport()).toBe(true);
  });
}

@Component({
  template: `
    <mat-sidenav-container>
      <mat-sidenav id="one" position="start">One</mat-sidenav>
      <mat-sidenav id="two" position="end">Two</mat-sidenav>
      <mat-sidenav-content>Content</mat-sidenav-content>
    </mat-sidenav-container>

    <mat-sidenav-container>
      <mat-sidenav id="three" fixedInViewport>Three</mat-sidenav>
      <mat-sidenav-content>Content</mat-sidenav-content>
    </mat-sidenav-container>
  `
})
class SidenavHarnessTest {}

