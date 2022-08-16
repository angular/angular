import {MatSnackBar, MatSnackBarConfig, MatSnackBarModule} from '@angular/material/snack-bar';
import {runHarnessTests} from './shared.spec';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, TemplateRef, ViewChild} from '@angular/core';
import {MatSnackBarHarness} from './snack-bar-harness';

describe('MDC-based MatSnackBarHarness', () => {
  runHarnessTests(MatSnackBarModule, MatSnackBar, MatSnackBarHarness);
});

describe('MDC-based MatSnackBarHarness (MDC only behavior)', () => {
  let fixture: ComponentFixture<SnackbarHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule, NoopAnimationsModule],
      declarations: [SnackbarHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should be able to get message of a snack-bar with custom content', async () => {
    fixture.componentInstance.openCustom();
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getMessage()).toBe('My custom snack-bar.');

    fixture.componentInstance.openCustomWithAction();
    snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getMessage()).toBe('My custom snack-bar with action.');
  });

  it('should fail to get action description of a snack-bar with no action', async () => {
    fixture.componentInstance.openCustom();
    const snackBar = await loader.getHarness(MatSnackBarHarness);
    await expectAsync(snackBar.getActionDescription()).toBeRejectedWithError(/without an action/);
  });

  it('should be able to get action description of a snack-bar with an action', async () => {
    fixture.componentInstance.openCustomWithAction();
    const snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getActionDescription()).toBe('Ok');
  });

  it('should be able to check whether a snack-bar with custom content has an action', async () => {
    fixture.componentInstance.openCustom();
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.hasAction()).toBe(false);

    fixture.componentInstance.openCustomWithAction();
    snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.hasAction()).toBe(true);
  });
});

@Component({
  template: `
    <ng-template #custom>My custom snack-bar.</ng-template>
    <ng-template #customWithAction>
      <span matSnackBarLabel>My custom snack-bar with action.</span>
      <div matSnackBarActions><button matSnackBarAction>Ok</button></div>
    </ng-template>
  `,
})
class SnackbarHarnessTest {
  @ViewChild('custom') customTmpl: TemplateRef<any>;
  @ViewChild('customWithAction') customWithActionTmpl: TemplateRef<any>;

  constructor(public snackBar: MatSnackBar) {}

  openCustom(config?: MatSnackBarConfig) {
    return this.snackBar.openFromTemplate(this.customTmpl, config);
  }

  openCustomWithAction(config?: MatSnackBarConfig) {
    return this.snackBar.openFromTemplate(this.customWithActionTmpl, config);
  }
}
