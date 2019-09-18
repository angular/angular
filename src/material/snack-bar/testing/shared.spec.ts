import {OverlayContainer} from '@angular/cdk/overlay';
import {expectAsyncError} from '@angular/cdk/private/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, TemplateRef, ViewChild} from '@angular/core';
import {ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarModule} from '@angular/material/snack-bar';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatSnackBarHarness} from './snack-bar-harness';

/**
 * Function that can be used to run the shared snack-bar harness tests for either
 * the non-MDC or MDC based snack-bar harness.
 */
export function runHarnessTests(
    snackBarModule: typeof MatSnackBarModule,
    snackBarHarness: typeof MatSnackBarHarness) {
  let fixture: ComponentFixture<SnackbarHarnessTest>;
  let loader: HarnessLoader;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [snackBarModule, NoopAnimationsModule],
      declarations: [SnackbarHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
    })();
  });

  afterEach(() => {
    // Angular won't call this for us so we need to do it ourselves to avoid leaks.
    overlayContainer.ngOnDestroy();
    overlayContainer = null!;
  });

  it('should load harness for simple snack-bar', async () => {
    const snackBarRef = fixture.componentInstance.openSimple('Hello!', '');
    let snackBars = await loader.getAllHarnesses(snackBarHarness);

    expect(snackBars.length).toBe(1);

    snackBarRef.dismiss();
    snackBars = await loader.getAllHarnesses(snackBarHarness);
    expect(snackBars.length).toBe(0);
  });

  it('should load harness for custom snack-bar', async () => {
    const snackBarRef = fixture.componentInstance.openCustom();
    let snackBars = await loader.getAllHarnesses(snackBarHarness);

    expect(snackBars.length).toBe(1);

    snackBarRef.dismiss();
    snackBars = await loader.getAllHarnesses(snackBarHarness);
    expect(snackBars.length).toBe(0);
  });

  it('should load snack-bar harness by selector', async () => {
    fixture.componentInstance.openSimple('Hello!', '', {panelClass: 'my-snack-bar'});
    const snackBars = await loader.getAllHarnesses(snackBarHarness.with({
      selector: '.my-snack-bar'
    }));
    expect(snackBars.length).toBe(1);
  });

  it('should be able to get role of snack-bar', async () => {
    fixture.componentInstance.openCustom();
    let snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getRole()).toBe('alert');

    fixture.componentInstance.openCustom({politeness: 'polite'});
    snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getRole()).toBe('status');

    fixture.componentInstance.openCustom({politeness: 'off'});
    snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getRole()).toBe(null);
  });

  it('should be able to get message of simple snack-bar', async () => {
    fixture.componentInstance.openSimple('Subscribed to newsletter.');
    let snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getMessage()).toBe('Subscribed to newsletter.');

    // For snack-bar's with custom template, the message cannot be
    // retrieved. We expect an error to be thrown.
    fixture.componentInstance.openCustom();
    snackBar = await loader.getHarness(snackBarHarness);
    await expectAsyncError(() => snackBar.getMessage(), /custom content/);
  });

  it('should be able to get action description of simple snack-bar', async () => {
    fixture.componentInstance.openSimple('Hello', 'Unsubscribe');
    let snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getActionDescription()).toBe('Unsubscribe');

    // For snack-bar's with custom template, the action description
    // cannot be retrieved. We expect an error to be thrown.
    fixture.componentInstance.openCustom();
    snackBar = await loader.getHarness(snackBarHarness);
    await expectAsyncError(() => snackBar.getActionDescription(), /custom content/);
  });

  it('should be able to check whether simple snack-bar has action', async () => {
    fixture.componentInstance.openSimple('With action', 'Unsubscribe');
    let snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.hasAction()).toBe(true);

    fixture.componentInstance.openSimple('No action');
    snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.hasAction()).toBe(false);

    // For snack-bar's with custom template, the action cannot
    // be found. We expect an error to be thrown.
    fixture.componentInstance.openCustom();
    snackBar = await loader.getHarness(snackBarHarness);
    await expectAsyncError(() => snackBar.hasAction(), /custom content/);
  });

  it('should be able to dismiss simple snack-bar with action', async () => {
    const snackBarRef = fixture.componentInstance.openSimple('With action', 'Unsubscribe');
    let snackBar = await loader.getHarness(snackBarHarness);
    let actionCount = 0;
    snackBarRef.onAction().subscribe(() => actionCount++);

    await snackBar.dismissWithAction();
    expect(actionCount).toBe(1);

    fixture.componentInstance.openSimple('No action');
    snackBar = await loader.getHarness(snackBarHarness);
    await expectAsyncError(() => snackBar.dismissWithAction(), /without action/);
  });
}

@Component({
  template: `
      <ng-template>
          My custom snack-bar.
      </ng-template>
  `
})
class SnackbarHarnessTest {
  @ViewChild(TemplateRef, {static: false}) customTmpl: TemplateRef<any>;

  constructor(readonly snackBar: MatSnackBar) {}

  openSimple(message: string, action = '', config?: MatSnackBarConfig) {
    return this.snackBar.open(message, action, config);
  }

  openCustom(config?: MatSnackBarConfig) {
    return this.snackBar.openFromTemplate(this.customTmpl, config);
  }
}
