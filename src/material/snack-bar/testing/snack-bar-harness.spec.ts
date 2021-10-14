import {MatSnackBar, MatSnackBarConfig, MatSnackBarModule} from '@angular/material/snack-bar';
import {runHarnessTests} from '@angular/material/snack-bar/testing/shared.spec';
import {MatSnackBarHarness} from './snack-bar-harness';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, TemplateRef, ViewChild} from '@angular/core';

describe('Non-MDC-based MatSnackBarHarness', () => {
  runHarnessTests(MatSnackBarModule, MatSnackBar, MatSnackBarHarness);
});

describe('Non-MDC-based MatSnackBarHarness (non-MDC only behavior)', () => {
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

  it('should fail to get message of a snack-bar with custom content', async () => {
    fixture.componentInstance.openCustom();
    const snackBar = await loader.getHarness(MatSnackBarHarness);
    await expectAsync(snackBar.getMessage()).toBeRejectedWithError(/custom content/);
  });

  it('should fail to get action description of a snack-bar with custom content', async () => {
    fixture.componentInstance.openCustom();
    const snackBar = await loader.getHarness(MatSnackBarHarness);
    await expectAsync(snackBar.getActionDescription()).toBeRejectedWithError(/custom content/);
  });

  it('should fail to check whether a snack-bar with custom content has an action', async () => {
    fixture.componentInstance.openCustom();
    const snackBar = await loader.getHarness(MatSnackBarHarness);
    await expectAsync(snackBar.hasAction()).toBeRejectedWithError(/custom content/);
  });
});

@Component({
  template: `<ng-template>My custom snack-bar.</ng-template>`,
})
class SnackbarHarnessTest {
  @ViewChild(TemplateRef) customTmpl: TemplateRef<any>;

  constructor(public snackBar: MatSnackBar) {}

  openCustom(config?: MatSnackBarConfig) {
    return this.snackBar.openFromTemplate(this.customTmpl, config);
  }
}
