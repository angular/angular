import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, TemplateRef, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {OverlayContainer} from '@angular/cdk/overlay';
import {MatBottomSheetHarness} from './bottom-sheet-harness';

/** Shared tests to run on both the original and MDC-based bottom sheets. */
export function runHarnessTests(
    bottomSheetModule: typeof MatBottomSheetModule, harness: typeof MatBottomSheetHarness) {
  let fixture: ComponentFixture<BottomSheetHarnessTest>;
  let loader: HarnessLoader;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [bottomSheetModule, NoopAnimationsModule],
      declarations: [BottomSheetHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomSheetHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
    })();
  });

  afterEach(() => {
    // Dismiss the bottom sheet once the tests are done. This is necessary because the
    // "MatBottomSheet" service is not destroyed automatically by TestBed, and it could
    // mean that bottom sheets are left in the DOM.
    fixture.componentInstance.bottomSheet.dismiss();
    fixture.detectChanges();

    // Angular won't call this for us so we need to do it ourselves to avoid leaks.
    overlayContainer.ngOnDestroy();
  });

  it('should load harness for a bottom sheet', async () => {
    fixture.componentInstance.open();
    const bottomSheets = await loader.getAllHarnesses(harness);
    expect(bottomSheets.length).toBe(1);
  });

  it('should be able to get aria-label of the bottom sheet', async () => {
    fixture.componentInstance.open({ariaLabel: 'Confirm purchase.'});
    const bottomSheet = await loader.getHarness(harness);
    expect(await bottomSheet.getAriaLabel()).toBe('Confirm purchase.');
  });

  it('should be able to dismiss the bottom sheet', async () => {
    fixture.componentInstance.open();
    let bottomSheets = await loader.getAllHarnesses(harness);

    expect(bottomSheets.length).toBe(1);
    await bottomSheets[0].dismiss();

    bottomSheets = await loader.getAllHarnesses(harness);
    expect(bottomSheets.length).toBe(0);
  });
}

@Component({
  template: `
    <ng-template>
      Hello from the bottom sheet!
    </ng-template>
  `
})
class BottomSheetHarnessTest {
  @ViewChild(TemplateRef) template: TemplateRef<any>;

  constructor(readonly bottomSheet: MatBottomSheet) {}

  open(config?: MatBottomSheetConfig) {
    return this.bottomSheet.open(this.template, config);
  }
}
