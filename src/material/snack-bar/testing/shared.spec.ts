import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, TemplateRef, ViewChild, Injector} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarModule} from '@angular/material/snack-bar';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatSnackBarHarness} from './snack-bar-harness';

/**
 * Function that can be used to run the shared snack-bar harness tests for either
 * the non-MDC or MDC based snack-bar harness.
 */
export function runHarnessTests(
  snackBarModule: typeof MatSnackBarModule,
  snackBarToken: typeof MatSnackBar,
  snackBarHarness: typeof MatSnackBarHarness,
) {
  let fixture: ComponentFixture<SnackbarHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [snackBarModule, NoopAnimationsModule],
      declarations: [SnackbarHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
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
    const snackBars = await loader.getAllHarnesses(
      snackBarHarness.with({
        selector: '.my-snack-bar',
      }),
    );
    expect(snackBars.length).toBe(1);
  });

  it('should be able to get role of snack-bar', async () => {
    // Get role is now deprecated, so it should always return null.
    fixture.componentInstance.openCustom();
    let snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getRole()).toBe(null);

    fixture.componentInstance.openCustom({politeness: 'polite'});
    snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getRole()).toBe(null);

    fixture.componentInstance.openCustom({politeness: 'off'});
    snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getRole()).toBe(null);
  });

  it('should be able to get aria-live of snack-bar', async () => {
    fixture.componentInstance.openCustom();
    let snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getAriaLive()).toBe('assertive');

    fixture.componentInstance.openCustom({politeness: 'polite'});
    snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getAriaLive()).toBe('polite');

    fixture.componentInstance.openCustom({politeness: 'off'});
    snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getAriaLive()).toBe('off');
  });

  it('should be able to get message of simple snack-bar', async () => {
    fixture.componentInstance.openSimple('Subscribed to newsletter.');
    let snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getMessage()).toBe('Subscribed to newsletter.');
  });

  it('should be able to get action description of simple snack-bar', async () => {
    fixture.componentInstance.openSimple('Hello', 'Unsubscribe');
    let snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.getActionDescription()).toBe('Unsubscribe');
  });

  it('should be able to check whether simple snack-bar has action', async () => {
    fixture.componentInstance.openSimple('With action', 'Unsubscribe');
    let snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.hasAction()).toBe(true);

    fixture.componentInstance.openSimple('No action');
    snackBar = await loader.getHarness(snackBarHarness);
    expect(await snackBar.hasAction()).toBe(false);
  });

  it('should be able to dismiss simple snack-bar with action', async () => {
    const snackBarRef = fixture.componentInstance.openSimple('With action', 'Unsubscribe');
    let snackBar = await loader.getHarness(snackBarHarness);
    let actionCount = 0;
    snackBarRef.onAction().subscribe(() => actionCount++);

    expect(await snackBar.isDismissed())
      .withContext('The snackbar should be present in the DOM before dismiss')
      .toBe(false);

    await snackBar.dismissWithAction();
    expect(actionCount).toBe(1);
    expect(await snackBar.isDismissed())
      .withContext('The snackbar should be absent from the DOM after dismiss')
      .toBe(true);

    fixture.componentInstance.openSimple('No action');
    snackBar = await loader.getHarness(snackBarHarness);
    await expectAsync(snackBar.dismissWithAction()).toBeRejectedWithError(/without an action/);
  });

  @Component({
    template: `<ng-template>My custom snack-bar.</ng-template>`,
  })
  class SnackbarHarnessTest {
    @ViewChild(TemplateRef) customTmpl: TemplateRef<any>;
    snackBar: MatSnackBar;

    constructor(injector: Injector) {
      this.snackBar = injector.get(snackBarToken);
    }

    openSimple(message: string, action = '', config?: MatSnackBarConfig) {
      return this.snackBar.open(message, action, config);
    }

    openCustom(config?: MatSnackBarConfig) {
      return this.snackBar.openFromTemplate(this.customTmpl, config);
    }
  }
}
