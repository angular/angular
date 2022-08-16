import {
  MatLegacySnackBar,
  MatLegacySnackBarConfig,
  MatLegacySnackBarModule,
} from '@angular/material/legacy-snack-bar';
import {runHarnessTests} from '@angular/material/snack-bar/testing/shared.spec';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, TemplateRef, ViewChild} from '@angular/core';
import {MatLegacySnackBarHarness} from './snack-bar-harness';

describe('Non-MDC-based MatSnackBarHarness', () => {
  runHarnessTests(
    MatLegacySnackBarModule,
    MatLegacySnackBar as any,
    MatLegacySnackBarHarness as any,
  );
});

describe('Non-MDC-based MatSnackBarHarness (non-MDC only behavior)', () => {
  let fixture: ComponentFixture<SnackbarHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatLegacySnackBarModule, NoopAnimationsModule],
      declarations: [SnackbarHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should fail to get message of a snack-bar with custom content', async () => {
    fixture.componentInstance.openCustom();
    const snackBar = await loader.getHarness(MatLegacySnackBarHarness);
    await expectAsync(snackBar.getMessage()).toBeRejectedWithError(/custom content/);
  });

  it('should fail to get action description of a snack-bar with custom content', async () => {
    fixture.componentInstance.openCustom();
    const snackBar = await loader.getHarness(MatLegacySnackBarHarness);
    await expectAsync(snackBar.getActionDescription()).toBeRejectedWithError(/custom content/);
  });

  it('should fail to check whether a snack-bar with custom content has an action', async () => {
    fixture.componentInstance.openCustom();
    const snackBar = await loader.getHarness(MatLegacySnackBarHarness);
    await expectAsync(snackBar.hasAction()).toBeRejectedWithError(/custom content/);
  });
});

@Component({
  template: `<ng-template>My custom snack-bar.</ng-template>`,
})
class SnackbarHarnessTest {
  @ViewChild(TemplateRef) customTmpl: TemplateRef<any>;

  constructor(public snackBar: MatLegacySnackBar) {}

  openCustom(config?: MatLegacySnackBarConfig) {
    return this.snackBar.openFromTemplate(this.customTmpl, config);
  }
}
