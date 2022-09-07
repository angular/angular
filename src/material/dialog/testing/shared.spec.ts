import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, TemplateRef, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog, MatDialogModule, MatDialogConfig} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogHarness} from './dialog-harness';

/** Shared tests to run on both the original and MDC-based dialog's. */
export function runHarnessTests(
  dialogModule: typeof MatDialogModule,
  dialogHarness: typeof MatDialogHarness,
  dialogService: typeof MatDialog,
) {
  let fixture: ComponentFixture<DialogHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    // If the specified dialog service does not match the default `MatDialog` service
    // that is used in the test components below, we provide the `MatDialog` service with
    // the existing instance of the specified dialog service. This allows us to run these
    // tests for the MDC-based version of the dialog too.
    const providers =
      dialogService !== MatDialog ? [{provide: MatDialog, useExisting: dialogService}] : undefined;
    await TestBed.configureTestingModule({
      imports: [dialogModule, NoopAnimationsModule],
      declarations: [DialogHarnessTest],
      providers,
    }).compileComponents();

    fixture = TestBed.createComponent(DialogHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should load harness for dialog', async () => {
    fixture.componentInstance.open();
    const dialogs = await loader.getAllHarnesses(dialogHarness);
    expect(dialogs.length).toBe(1);
  });

  it('should load harness for dialog with specific id', async () => {
    fixture.componentInstance.open({id: 'my-dialog'});
    fixture.componentInstance.open({id: 'other'});
    let dialogs = await loader.getAllHarnesses(dialogHarness);
    expect(dialogs.length).toBe(2);

    dialogs = await loader.getAllHarnesses(dialogHarness.with({selector: '#my-dialog'}));
    expect(dialogs.length).toBe(1);
  });

  it('should be able to get id of dialog', async () => {
    fixture.componentInstance.open({id: 'my-dialog'});
    fixture.componentInstance.open({id: 'other'});
    const dialogs = await loader.getAllHarnesses(dialogHarness);
    expect(await dialogs[0].getId()).toBe('my-dialog');
    expect(await dialogs[1].getId()).toBe('other');
  });

  it('should be able to get role of dialog', async () => {
    fixture.componentInstance.open({role: 'alertdialog'});
    fixture.componentInstance.open({role: 'dialog'});
    fixture.componentInstance.open({role: undefined});
    const dialogs = await loader.getAllHarnesses(dialogHarness);
    expect(await dialogs[0].getRole()).toBe('alertdialog');
    expect(await dialogs[1].getRole()).toBe('dialog');
    expect(await dialogs[2].getRole()).toBe(null);
  });

  it('should be able to get aria-label of dialog', async () => {
    fixture.componentInstance.open();
    fixture.componentInstance.open({ariaLabel: 'Confirm purchase.'});
    const dialogs = await loader.getAllHarnesses(dialogHarness);
    expect(await dialogs[0].getAriaLabel()).toBe(null);
    expect(await dialogs[1].getAriaLabel()).toBe('Confirm purchase.');
  });

  it('should be able to get aria-labelledby of dialog', async () => {
    fixture.componentInstance.open();
    fixture.componentInstance.open({ariaLabelledBy: 'dialog-label'});
    const dialogs = await loader.getAllHarnesses(dialogHarness);
    expect(await dialogs[0].getAriaLabelledby()).toMatch(/-dialog-title-\d+/);
    expect(await dialogs[1].getAriaLabelledby()).toBe('dialog-label');
  });

  it('should be able to get aria-describedby of dialog', async () => {
    fixture.componentInstance.open();
    fixture.componentInstance.open({ariaDescribedBy: 'dialog-description'});
    const dialogs = await loader.getAllHarnesses(dialogHarness);
    expect(await dialogs[0].getAriaDescribedby()).toBe(null);
    expect(await dialogs[1].getAriaDescribedby()).toBe('dialog-description');
  });

  it('should be able to close dialog', async () => {
    fixture.componentInstance.open({disableClose: true});
    fixture.componentInstance.open();
    let dialogs = await loader.getAllHarnesses(dialogHarness);

    expect(dialogs.length).toBe(2);
    await dialogs[0].close();

    dialogs = await loader.getAllHarnesses(dialogHarness);
    expect(dialogs.length).toBe(1);

    // should be a noop since "disableClose" is set to "true".
    await dialogs[0].close();
    dialogs = await loader.getAllHarnesses(dialogHarness);
    expect(dialogs.length).toBe(1);
  });

  it('should get the text content of each section', async () => {
    fixture.componentInstance.open();
    const dialog = await loader.getHarness(dialogHarness);
    expect(await dialog.getText()).toBe(`I'm the dialog titleI'm the dialog contentCancelOk`);
    expect(await dialog.getTitleText()).toBe(`I'm the dialog title`);
    expect(await dialog.getContentText()).toBe(`I'm the dialog content`);
    expect(await dialog.getActionsText()).toBe(`CancelOk`);
  });

  @Component({
    template: `
    <ng-template>
      <div matDialogTitle>I'm the dialog title</div>
      <div matDialogContent>I'm the dialog content</div>
      <div matDialogActions>
        <button>Cancel</button>
        <button>Ok</button>
      </div>
    </ng-template>
    `,
  })
  class DialogHarnessTest {
    @ViewChild(TemplateRef) dialogTmpl: TemplateRef<any>;

    constructor(readonly dialog: MatDialog) {}

    open(config?: MatDialogConfig) {
      return this.dialog.open(this.dialogTmpl, config);
    }
  }
}
