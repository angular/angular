import {DataSource} from '@angular/cdk/collections';
import {LEFT_ARROW, UP_ARROW, RIGHT_ARROW, DOWN_ARROW, TAB} from '@angular/cdk/keycodes';
import {MatTableModule} from '@angular/material/table';
import {dispatchKeyboardEvent} from '@angular/cdk/testing';
import {CommonModule} from '@angular/common';
import {Component, ElementRef, Type, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed, tick, inject} from '@angular/core/testing';
import {FormsModule, NgForm} from '@angular/forms';
import {OverlayContainer} from '@angular/cdk/overlay';
import {BehaviorSubject} from 'rxjs';

import {
  CdkPopoverEditColspan,
  HoverContentState,
  FormValueContainer,
  PopoverEditClickOutBehavior,
} from '@angular/cdk-experimental/popover-edit';
import {MatPopoverEditModule} from './index';

const NAME_EDIT_TEMPLATE = `
    <div>
      <form #f="ngForm"
          matEditLens
          (ngSubmit)="onSubmit(element, f)"
          [(matEditLensPreservedFormValue)]="preservedValues.for(element).value"
          [matEditLensIgnoreSubmitUnlessValid]="ignoreSubmitUnlessValid"
          [matEditLensClickOutBehavior]="clickOutBehavior">
        <input [ngModel]="element.name" name="name" required>
        <br>
        <button class="submit" type="submit">Confirm</button>
        <button class="revert" matEditRevert>Revert</button>
        <button class="close" matEditClose>Close</button>
      </form>
    </div>
    `;

const WEIGHT_EDIT_TEMPLATE = `
    <div>
      <form #f="ngForm" matEditLens>
        <input>
      </form>
    </div>
    `;

const CELL_TEMPLATE = `
    {{element.name}}

    <span *matRowHoverContent>
      <button class="open" matEditOpen>Edit</button>
    </span>
    `;

const POPOVER_EDIT_DIRECTIVE_NAME = `[matPopoverEdit]="nameEdit" [matPopoverEditColspan]="colspan"`;

const POPOVER_EDIT_DIRECTIVE_WEIGHT = `[matPopoverEdit]="weightEdit" matPopoverEditTabOut`;

interface PeriodicElement {
  name: string;
  weight: number;
}

abstract class BaseTestComponent {
  @ViewChild('table', {static: false}) table: ElementRef;

  preservedValues = new FormValueContainer<PeriodicElement, {'name': string}>();

  ignoreSubmitUnlessValid = true;
  clickOutBehavior: PopoverEditClickOutBehavior = 'close';
  colspan: CdkPopoverEditColspan = {};

  onSubmit(element: PeriodicElement, form: NgForm) {
    if (!form.valid) { return; }

    element.name = form.value['name'];
  }

  triggerHoverState(rowIndex = 0) {
    const row = getRows(this.table.nativeElement)[rowIndex];
    row.dispatchEvent(new Event('mouseover', {bubbles: true}));
    row.dispatchEvent(new Event('mousemove', {bubbles: true}));

    // Wait for the mouse hover debounce in edit-event-dispatcher.
    tick(41);
  }

  getRows() {
    return getRows(this.table.nativeElement);
  }

  hoverContentStateForRow(rowIndex = 0) {
    const openButton = this.getOpenButton(rowIndex);

    if (!openButton) {
      return HoverContentState.OFF;
    }
    return (openButton.parentNode as Element).classList.contains('mat-row-hover-content-visible') ?
        HoverContentState.ON : HoverContentState.FOCUSABLE;
  }

  getEditCell(rowIndex = 0, cellIndex = 1) {
    const row = this.getRows()[rowIndex];
    return getCells(row)[cellIndex];
  }

  focusEditCell(rowIndex = 0, cellIndex = 1) {
    this.getEditCell(rowIndex, cellIndex).focus();
  }

  getOpenButton(rowIndex = 0) {
    return this.getEditCell(rowIndex).querySelector('.open') as HTMLElement|null;
  }

  clickOpenButton(rowIndex = 0) {
    this.getOpenButton(rowIndex)!.click();
  }

  openLens(rowIndex = 0, cellIndex = 1) {
    this.focusEditCell(rowIndex, cellIndex);
    this.getEditCell(rowIndex, cellIndex)
        .dispatchEvent(new KeyboardEvent('keyup', {bubbles: true, key: 'Enter'}));
    flush();
  }

  getEditPane() {
    return document.querySelector('.mat-edit-pane');
  }

  getEditBoundingBox() {
    return document.querySelector('.cdk-overlay-connected-position-bounding-box');
  }

  getInput() {
    return document.querySelector('input') as HTMLInputElement|null;
  }

  lensIsOpen() {
    return !!this.getInput();
  }

  getSubmitButton() {
    return document.querySelector('.submit') as HTMLElement|null;
  }

  clickSubmitButton() {
    this.getSubmitButton()!.click();
  }

  getRevertButton() {
    return document.querySelector('.revert') as HTMLElement|null;
  }

  clickRevertButton() {
    this.getRevertButton()!.click();
  }

  getCloseButton() {
    return document.querySelector('.close') as HTMLElement|null;
  }

  clickCloseButton() {
    this.getCloseButton()!.click();
  }
}

class ElementDataSource extends DataSource<PeriodicElement> {
  /** Stream of data that is provided to the table. */
  data = new BehaviorSubject(createElementData());

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect() {
    return this.data.asObservable();
  }

  disconnect() {}
}

@Component({
  template: `
  <div #table style="margin: 16px">
    <mat-table editable [dataSource]="dataSource">
      <ng-container matColumnDef="before">
        <mat-cell *matCellDef="let element">
          just a cell
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="name">
        <mat-cell *matCellDef="let element"
            ${POPOVER_EDIT_DIRECTIVE_NAME}>
          ${CELL_TEMPLATE}

          <ng-template #nameEdit>
            ${NAME_EDIT_TEMPLATE}
          </ng-template>

          <span *matIfRowHovered>
            <button matEditOpen>Edit</button>
          </span>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="weight">
        <mat-cell *matCellDef="let element"
            ${POPOVER_EDIT_DIRECTIVE_WEIGHT}>
          {{element.weight}}

          <ng-template #weightEdit>
            ${WEIGHT_EDIT_TEMPLATE}
          </ng-template>
        </mat-cell>
      </ng-container>

      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
  </div>
  `
})
class MatFlexTableInCell extends BaseTestComponent {
  displayedColumns = ['before', 'name', 'weight'];
  dataSource = new ElementDataSource();
}

@Component({
  template: `
  <div #table style="margin: 16px">
    <table mat-table editable [dataSource]="dataSource">
      <ng-container matColumnDef="before">
        <td mat-cell *matCellDef="let element">
          just a cell
        </td>
      </ng-container>

      <ng-container matColumnDef="name">
        <td mat-cell *matCellDef="let element"
            ${POPOVER_EDIT_DIRECTIVE_NAME}>
          ${CELL_TEMPLATE}

          <ng-template #nameEdit>
            ${NAME_EDIT_TEMPLATE}
          </ng-template>

          <span *matIfRowHovered>
            <button matEditOpen>Edit</button>
          </span>
        </td>
      </ng-container>

      <ng-container matColumnDef="weight">
        <td mat-cell *matCellDef="let element"
            ${POPOVER_EDIT_DIRECTIVE_WEIGHT}>
          {{element.weight}}

          <ng-template #weightEdit>
            ${WEIGHT_EDIT_TEMPLATE}
          </ng-template>
        </td>
      </ng-container>

      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  <div>
  `
})
class MatTableInCell extends BaseTestComponent {
  displayedColumns = ['before', 'name', 'weight'];
  dataSource = new ElementDataSource();
}

const testCases: ReadonlyArray<[Type<BaseTestComponent>, string]> = [
  [MatFlexTableInCell, 'Flex mat-table; edit defined within cell'],
  [MatTableInCell, 'Table mat-table; edit defined within cell'],
];

describe('Material Popover Edit', () => {
  for (const [componentClass, label] of testCases) {
    describe(label, () => {
      let component: BaseTestComponent;
      let fixture: ComponentFixture<BaseTestComponent>;
      let overlayContainer: OverlayContainer;

      beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
          imports: [MatTableModule, MatPopoverEditModule, CommonModule, FormsModule],
          declarations: [componentClass],
        }).compileComponents();
        inject([OverlayContainer], (oc: OverlayContainer) => {
          overlayContainer = oc;
        })();
        fixture = TestBed.createComponent(componentClass);
        component = fixture.componentInstance;
        fixture.detectChanges();
        tick(10);
      }));

      afterEach(() => {
        // The overlay container's `ngOnDestroy` won't be called between test runs so we need
        // to call it ourselves, in order to avoid leaking containers between tests and potentially
        // throwing `querySelector` calls.
        overlayContainer.ngOnDestroy();
      });

      describe('row hover content', () => {
        it('makes the first and last rows focusable but invisible', fakeAsync(() => {
          const rows = component.getRows();

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.FOCUSABLE);
          expect(component.hoverContentStateForRow(rows.length - 1))
              .toBe(HoverContentState.FOCUSABLE);
        }));
      });

      describe('triggering edit', () => {
        it('shows and hides on-hover content only after a delay', fakeAsync(() => {
          const [row0, row1] = component.getRows();
          row0.dispatchEvent(new Event('mouseover', {bubbles: true}));
          row0.dispatchEvent(new Event('mousemove', {bubbles: true}));

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.FOCUSABLE);

          tick(20);
          row0.dispatchEvent(new Event('mousemove', {bubbles: true}));
          tick(20);

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.FOCUSABLE);

          tick(31);

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.ON);

          row1.dispatchEvent(new Event('mouseover', {bubbles: true}));
          row1.dispatchEvent(new Event('mousemove', {bubbles: true}));

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.ON);
          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.OFF);

          tick(41);

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.FOCUSABLE);
          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.ON);
        }));

        it('shows hover content for the focused row and makes the rows above and below focusable',
            fakeAsync(() => {
          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(4)).toBe(HoverContentState.FOCUSABLE);

          component.focusEditCell(2);
          tick(1);

          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.ON);
          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.FOCUSABLE);
          expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.FOCUSABLE);

          component.focusEditCell(4);
          tick(1);

          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(4)).toBe(HoverContentState.ON);
          expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.FOCUSABLE);

          component.getEditCell(4).blur();
          tick(1);

          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(4)).toBe(HoverContentState.FOCUSABLE);
        }));

        it('shows hover content for the editing row and makes the rows above and below ' +
            'focusable unless focus is in a different table row in which case it takes priority',
            fakeAsync(() => {
          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(4)).toBe(HoverContentState.FOCUSABLE);

          component.openLens(2);
          tick(1);

          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.ON);
          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.FOCUSABLE);
          expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.FOCUSABLE);

          component.focusEditCell(4);
          tick(1);

          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(4)).toBe(HoverContentState.ON);
          expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.FOCUSABLE);
        }));
      });

      describe('triggering edit', () => {
        it('opens edit from on-hover button', fakeAsync(() => {
          component.triggerHoverState();
          component.clickOpenButton();

          expect(component.lensIsOpen()).toBe(true);
          clearLeftoverTimers();
        }));

        it('opens edit from Enter on focued cell', fakeAsync(() => {
          // Uses Enter to open the lens.
          component.openLens();

          expect(component.lensIsOpen()).toBe(true);
          clearLeftoverTimers();
        }));
      });

      describe('focus manipulation', () => {
        const getRowCells = () => component.getRows().map(getCells);

        describe('arrow keys', () => {
          const dispatchKey = (cell: HTMLElement, keyCode: number) =>
              dispatchKeyboardEvent(cell, 'keydown', keyCode, cell);

          it('moves focus up/down/left/right and prevents default', () => {
            const rowCells = getRowCells();

            // Focus the upper-left editable cell.
            rowCells[0][1].focus();

            const downEvent = dispatchKey(rowCells[0][1], DOWN_ARROW);
            expect(document.activeElement).toBe(rowCells[1][1]);
            expect(downEvent.defaultPrevented).toBe(true);

            const rightEvent = dispatchKey(rowCells[1][1], RIGHT_ARROW);
            expect(document.activeElement).toBe(rowCells[1][2]);
            expect(rightEvent.defaultPrevented).toBe(true);

            const upEvent = dispatchKey(rowCells[1][2], UP_ARROW);
            expect(document.activeElement).toBe(rowCells[0][2]);
            expect(upEvent.defaultPrevented).toBe(true);

            const leftEvent = dispatchKey(rowCells[0][2], LEFT_ARROW);
            expect(document.activeElement).toBe(rowCells[0][1]);
            expect(leftEvent.defaultPrevented).toBe(true);
          });

          it('wraps around when reaching start or end of a row, skipping non-editable cells',
             () => {
               const rowCells = getRowCells();

               // Focus the upper-right editable cell.
               rowCells[0][2].focus();

               dispatchKey(rowCells[0][2], RIGHT_ARROW);
               expect(document.activeElement).toBe(rowCells[1][1]);

               dispatchKey(rowCells[1][1], LEFT_ARROW);
               expect(document.activeElement).toBe(rowCells[0][2]);
             });

          it('does not fall off top or bottom of the table', () => {
            const rowCells = getRowCells();

            // Focus the upper-left editable cell.
            rowCells[0][1].focus();

            dispatchKey(rowCells[0][1], UP_ARROW);
            expect(document.activeElement).toBe(rowCells[0][1]);

            // Focus the bottom-left editable cell.
            rowCells[4][1].focus();
            dispatchKey(rowCells[4][1], DOWN_ARROW);
            expect(document.activeElement).toBe(rowCells[4][1]);
          });

          it('ignores non arrow key events', () => {
            component.focusEditCell();
            const cell = component.getEditCell();

            expect(dispatchKey(cell, TAB).defaultPrevented).toBe(false);
          });
        });

        describe('lens focus trapping behavior', () => {
          const getFocusablePaneElements = () =>
              Array.from(component.getEditBoundingBox()!.querySelectorAll(
                  'input, button, .cdk-focus-trap-anchor')) as HTMLElement[];

          it('keeps focus within the lens by default', fakeAsync(() => {
               // Open the name lens which has the default behavior.
               component.openLens();

               const focusableElements = getFocusablePaneElements();

               // Focus the last element (end focus trap anchor).
               focusableElements[focusableElements.length - 1].focus();
               flush();

               // Focus should have moved to the top of the lens.
               expect(document.activeElement).toBe(focusableElements[1]);
               expect(component.lensIsOpen()).toBe(true);
               clearLeftoverTimers();
             }));

          it('moves focus to the next cell when focus leaves end of lens with matPopoverEditTabOut',
             fakeAsync(() => {
               // Open the weight lens which has tab out behavior.
               component.openLens(0, 2);

               const focusableElements = getFocusablePaneElements();

               // Focus the last element (end focus trap anchor).
               focusableElements[focusableElements.length - 1].focus();
               flush();

               // Focus should have moved to the next editable cell.
               expect(document.activeElement).toBe(component.getEditCell(1, 1));
               expect(component.lensIsOpen()).toBe(false);
               clearLeftoverTimers();
             }));

          it(`moves focus to the previous cell when focus leaves end of lens with
matPopoverEditTabOut`, fakeAsync(() => {
               // Open the weight lens which has tab out behavior.
               component.openLens(0, 2);

               const focusableElements = getFocusablePaneElements();

               // Focus the first (start focus trap anchor).
               focusableElements[0].focus();
               flush();

               // Focus should have moved to the next editable cell.
               expect(document.activeElement).toBe(component.getEditCell(0, 1));
               expect(component.lensIsOpen()).toBe(false);
               clearLeftoverTimers();
             }));
        });
      });

      describe('edit lens', () => {
        it('shows a lens with the value from the table', fakeAsync(() => {
          component.openLens();

          expect(component.getInput()!.value).toBe('Hydrogen');
          clearLeftoverTimers();
        }));

        it('positions the lens at the top left corner and spans the full width of the cell',
           fakeAsync(() => {
             component.openLens();

             const paneRect = component.getEditPane()!.getBoundingClientRect();
             const cellRect = component.getEditCell().getBoundingClientRect();

             expect(paneRect.width).toBe(cellRect.width);
             expect(paneRect.left).toBe(cellRect.left);
             expect(paneRect.top).toBe(cellRect.top);
             clearLeftoverTimers();
           }));

        it('adjusts the positioning of the lens based on colspan', fakeAsync(() => {
             const cellRects = getCells(getRows(component.table.nativeElement)[0])
                                   .map(cell => cell.getBoundingClientRect());

             component.colspan = {before: 1};
             fixture.detectChanges();

             component.openLens();

             let paneRect = component.getEditPane()!.getBoundingClientRect();
             expect(paneRect.top).toBe(cellRects[0].top);
             expect(paneRect.left).toBe(cellRects[0].left);
             expect(paneRect.right).toBe(cellRects[1].right);

             component.colspan = {after: 1};
             fixture.detectChanges();

             paneRect = component.getEditPane()!.getBoundingClientRect();
             expect(paneRect.top).toBe(cellRects[1].top);
             expect(paneRect.left).toBe(cellRects[1].left);
             expect(paneRect.right).toBe(cellRects[2].right);

             component.colspan = {before: 1, after: 1};
             fixture.detectChanges();

             paneRect = component.getEditPane()!.getBoundingClientRect();
             expect(paneRect.top).toBe(cellRects[0].top);
             expect(paneRect.left).toBe(cellRects[0].left);
             expect(paneRect.right).toBe(cellRects[2].right);
             clearLeftoverTimers();
           }));

        it('updates the form and submits, closing the lens', fakeAsync(() => {
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickSubmitButton();
          fixture.detectChanges();

          expect(component.getEditCell().firstChild!.textContent!.trim()).toBe('Hydragon');
          expect(component.lensIsOpen()).toBe(false);
          clearLeftoverTimers();
        }));

        it('does not close the lens on submit when form is invalid', fakeAsync(() => {
          component.openLens();

          component.getInput()!.value = '';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickSubmitButton();

          expect(component.lensIsOpen()).toBe(true);
          clearLeftoverTimers();
        }));

        it('closes lens on submit when form is invalid with ' +
            'matEditControlIgnoreSubmitUnlessValid = false', fakeAsync(() => {
          component.ignoreSubmitUnlessValid = false;
          component.openLens();

          component.getInput()!.value = '';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickSubmitButton();

          expect(component.lensIsOpen()).toBe(false);
          clearLeftoverTimers();
        }));

        it('closes the lens on close', fakeAsync(() => {
          component.openLens();

          component.clickCloseButton();

          expect(component.lensIsOpen()).toBe(false);
          clearLeftoverTimers();
        }));

        it('closes and reopens a lens with modified value persisted', fakeAsync(() => {
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickCloseButton();
          fixture.detectChanges();

          expect(component.getEditCell().firstChild!.textContent!.trim()).toBe('Hydrogen');
          expect(component.lensIsOpen()).toBe(false);

          component.openLens();

          expect(component.getInput()!.value).toBe('Hydragon');
          clearLeftoverTimers();
        }));

        it('resets the lens to original value', fakeAsync(() => {
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickRevertButton();

          expect(component.getInput()!.value).toBe('Hydrogen');
          clearLeftoverTimers();
        }));

        it('resets the lens to previously submitted value', fakeAsync(() => {
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickSubmitButton();
          fixture.detectChanges();

          component.openLens();

          component.getInput()!.value = 'Hydragon X';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickRevertButton();

          expect(component.getInput()!.value).toBe('Hydragon');
          clearLeftoverTimers();
        }));

        it('closes the lens on escape', fakeAsync(() => {
          component.openLens();

          component.getInput()!.dispatchEvent(
              new KeyboardEvent('keyup', {bubbles: true, key: 'Escape'}));

          expect(component.lensIsOpen()).toBe(false);
          clearLeftoverTimers();
        }));

        it('does not close the lens on click within lens', fakeAsync(() => {
          component.openLens();

          component.getInput()!.dispatchEvent(new Event('click', {bubbles: true}));

          expect(component.lensIsOpen()).toBe(true);
          clearLeftoverTimers();
        }));

        it('closes the lens on outside click', fakeAsync(() => {
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));
          document.body.dispatchEvent(new Event('click', {bubbles: true}));
          fixture.detectChanges();

          expect(component.lensIsOpen()).toBe(false);
          expect(component.getEditCell().firstChild!.textContent!.trim()).toBe('Hydrogen');
          clearLeftoverTimers();
        }));

        it('submits the lens on outside click with ' +
            'matEditControlClickOutBehavior = "submit"', fakeAsync(() => {
          component.clickOutBehavior = 'submit';
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));
          document.body.dispatchEvent(new Event('click', {bubbles: true}));
          fixture.detectChanges();

          expect(component.lensIsOpen()).toBe(false);
          expect(component.getEditCell().firstChild!.textContent!.trim()).toBe('Hydragon');
          clearLeftoverTimers();
        }));

        it('does nothing on outside click with ' +
            'matEditControlClickOutBehavior = "noop"', fakeAsync(() => {
          component.clickOutBehavior = 'noop';
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));
          document.body.dispatchEvent(new Event('click', {bubbles: true}));
          fixture.detectChanges();

          expect(component.lensIsOpen()).toBe(true);
          expect(component.getEditCell().firstChild!.textContent!.trim()).toBe('Hydrogen');
          clearLeftoverTimers();
        }));

        it('sets focus on the first input in the lens', fakeAsync(() => {
          component.openLens();

          expect(document.activeElement).toBe(component.getInput());
          clearLeftoverTimers();
        }));

        it('returns focus to the edited cell after closing', fakeAsync(() => {
          component.openLens();

          component.clickCloseButton();

          expect(document.activeElement).toBe(component.getEditCell());
          clearLeftoverTimers();
        }));

        it('does not focus to the edited cell after closing if another element ' +
            'outside the lens is already focused', fakeAsync(() => {
          component.openLens(0);

          component.getEditCell(1).focus();
          component.getEditCell(1).dispatchEvent(new Event('click', {bubbles: true}));

          expect(document.activeElement).toBe(component.getEditCell(1));
          clearLeftoverTimers();
        }));
      });
     });
  }
});

function createElementData() {
  return [
    {name: 'Hydrogen', weight: 1.007},
    {name: 'Helium', weight: 4.0026},
    {name: 'Lithium', weight: 6.941},
    {name: 'Beryllium', weight: 9.0122},
    {name: 'Boron', weight: 10.81},
  ];
}

function getElements(element: Element, query: string): HTMLElement[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getRows(tableElement: Element): HTMLElement[] {
  return getElements(tableElement, '.mat-row, tr');
}

function getCells(row: Element): HTMLElement[] {
  if (!row) {
    return [];
  }

  return getElements(row, '.mat-cell, td');
}

// Common actions like mouse events and focus/blur cause timers to be fired off.
// When not testing this behavior directly, use this function to clear any timers that were
// created in passing.
function clearLeftoverTimers() {
  tick(100);
}
