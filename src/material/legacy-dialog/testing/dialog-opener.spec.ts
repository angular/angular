import {Component, Inject} from '@angular/core';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {
  MatTestLegacyDialogOpenerModule,
  MatTestLegacyDialogOpener,
} from '@angular/material/legacy-dialog/testing';
import {
  MAT_LEGACY_DIALOG_DATA,
  MatLegacyDialogRef,
  MatLegacyDialogState,
} from '@angular/material/legacy-dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('MDC-based MatTestDialogOpener', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatTestLegacyDialogOpenerModule, NoopAnimationsModule],
      declarations: [ExampleComponent],
    });

    TestBed.compileComponents();
  }));

  it('should open a dialog when created', fakeAsync(() => {
    const fixture = TestBed.createComponent(
      MatTestLegacyDialogOpener.withComponent(ExampleComponent),
    );
    flush();
    expect(fixture.componentInstance.dialogRef.getState()).toBe(MatLegacyDialogState.OPEN);
    expect(document.querySelector('mat-dialog-container')).toBeTruthy();
  }));

  it('should throw an error if no dialog component is provided', () => {
    expect(() => TestBed.createComponent(MatTestLegacyDialogOpener)).toThrow(
      Error('MatTestDialogOpener does not have a component provided.'),
    );
  });

  it('should pass data to the component', fakeAsync(() => {
    const config = {data: 'test'};
    TestBed.createComponent(MatTestLegacyDialogOpener.withComponent(ExampleComponent, config));
    flush();
    const dialogContainer = document.querySelector('mat-dialog-container');
    expect(dialogContainer!.innerHTML).toContain('Data: test');
  }));

  it('should get closed result data', fakeAsync(() => {
    const config = {data: 'test'};
    const fixture = TestBed.createComponent(
      MatTestLegacyDialogOpener.withComponent<ExampleComponent, ExampleDialogResult>(
        ExampleComponent,
        config,
      ),
    );
    flush();
    const closeButton = document.querySelector('#close-btn') as HTMLElement;
    closeButton.click();
    flush();
    expect(fixture.componentInstance.closedResult).toEqual({reason: 'closed'});
  }));
});

interface ExampleDialogResult {
  reason: string;
}

/** Simple component for testing MatTestDialogOpener. */
@Component({
  template: `
    Data: {{data}}
    <button id="close-btn" (click)="close()">Close</button>
  `,
})
class ExampleComponent {
  constructor(
    public dialogRef: MatLegacyDialogRef<ExampleComponent, ExampleDialogResult>,
    @Inject(MAT_LEGACY_DIALOG_DATA) public data: any,
  ) {}

  close() {
    this.dialogRef.close({reason: 'closed'});
  }
}
