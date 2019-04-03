import {BehaviorSubject} from 'rxjs';
import {Component, ElementRef, Type, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {DataSource} from '@angular/cdk/collections';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkPopoverEditModule, PopoverEditClickOutBehavior} from './index';

const EDIT_TEMPLATE = `
    <div style="background-color: white;">
      <form #f="ngForm"
          cdkEditControl
          (ngSubmit)="onSubmit(element, f)"
          [cdkEditControlPreservedFormValue]="preservedValues.get(element)"
          (cdkEditControlPreservedFormValueChange)="preservedValues.set(element, $event)"
          [cdkEditControlIgnoreSubmitUnlessValid]="ignoreSubmitUnlessValid"
          [cdkEditControlClickOutBehavior]="clickOutBehavior">
        <input [ngModel]="element.name" name="name" required>
        <br>
        <button class="submit" type="submit">Confirm</button>
        <button class="revert" cdkEditRevert>Revert</button>
        <button class="close" cdkEditClose>Close</button>
      </form>
    </div>
    `;

const CELL_TEMPLATE = `
    {{element.name}}

    <span *cdkRowHoverContent>
      <button class="open" cdkEditOpen>Edit</button>
    </span>
    `;

interface PeriodicElement {
  name: string;
  weight: number;
}

abstract class BaseTestComponent {
  @ViewChild('table') table: ElementRef;

  preservedValues = new Map<number, PeriodicElement>();

  ignoreSubmitUnlessValid = true;
  clickOutBehavior: PopoverEditClickOutBehavior = 'close';

  onSubmit(element: PeriodicElement, form: NgForm) {
    if (!form.valid) { return; }

    element.name = form.value['name'];
  }

  triggerHoverState(rowIndex = 0) {
    const row = getRows(this.table.nativeElement)[rowIndex];
    row.dispatchEvent(new Event('mouseover', {bubbles: true}));
    row.dispatchEvent(new Event('mousemove', {bubbles: true}));

    tick(31);
  }

  getEditCell(rowIndex = 0) {
    const row = getRows(this.table.nativeElement)[rowIndex];
    return getCells(row)[0];
  }

  focusEditCell(rowIndex = 0) {
    this.getEditCell(rowIndex).focus();
  }

  getOpenButton(rowIndex = 0) {
    return this.getEditCell(rowIndex).querySelector('.open') as HTMLElement|null;
  }

  clickOpenButton(rowIndex = 0) {
    this.getOpenButton(rowIndex)!.click();
  }

  openLens(rowIndex = 0) {
    this.focusEditCell(rowIndex);
    this.getEditCell(rowIndex).dispatchEvent(
        new KeyboardEvent('keyup', {bubbles: true, key: 'Enter'}));
    flush();
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

@Component({
  template: `
  <table #table editable>
    <ng-template #nameEdit let-element>
      ${EDIT_TEMPLATE}
    </ng-template>

    <tr *ngFor="let element of elements">
      <td [cdkPopoverEdit]="nameEdit" [cdkPopoverEditContext]="element">
        ${CELL_TEMPLATE}
      </td>

      <td> {{element.weight}} </td>
    </tr>
  </table>
  `
})
class VanillaTableOutOfCell extends BaseTestComponent {
  elements = createElementData();
}

@Component({
  template: `
  <table #table editable>
    <tr *ngFor="let element of elements">
      <td [cdkPopoverEdit]="nameEdit">
        ${CELL_TEMPLATE}

        <ng-template #nameEdit>
          ${EDIT_TEMPLATE}
        </ng-template>
      </td>

      <td> {{element.weight}} </td>
    </tr>
  </table>
  `
})
class VanillaTableInCell extends BaseTestComponent {
  elements = createElementData();
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
  <div #table>
    <cdk-table cdk-table editable [dataSource]="dataSource">
      <ng-container cdkColumnDef="name">
        <cdk-cell *cdkCellDef="let element"
            [cdkPopoverEdit]="nameEdit">
          ${CELL_TEMPLATE}

          <ng-template #nameEdit>
            ${EDIT_TEMPLATE}
          </ng-template>

          <span *cdkIfRowHovered>
            <button cdkEditOpen>Edit</button>
          </span>
        </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="weight">
        <cdk-cell *cdkCellDef="let element">
          {{element.weight}}
        </cdk-cell>
      </ng-container>

      <cdk-row *cdkRowDef="let row; columns: displayedColumns;"></cdk-row>
    </cdk-table>
  </div>
  `
})
class CdkFlexTableInCell extends BaseTestComponent {
  displayedColumns = ['name', 'weight'];
  dataSource = new ElementDataSource();
}

@Component({
  template: `
  <div #table>
    <table cdk-table editable [dataSource]="dataSource">
      <ng-container cdkColumnDef="name">
        <td cdk-cell *cdkCellDef="let element"
            [cdkPopoverEdit]="nameEdit">
          ${CELL_TEMPLATE}

          <ng-template #nameEdit>
            ${EDIT_TEMPLATE}
          </ng-template>

          <span *cdkIfRowHovered>
            <button cdkEditOpen>Edit</button>
          </span>
        </td>
      </ng-container>

      <ng-container cdkColumnDef="weight">
        <td cdk-cell *cdkCellDef="let element">
          {{element.weight}}
        </td>
      </ng-container>

      <tr cdk-row *cdkRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  <div>
  `
})
class CdkTableInCell extends BaseTestComponent {
  displayedColumns = ['name', 'weight'];
  dataSource = new ElementDataSource();
}

const testCases: ReadonlyArray<[Type<BaseTestComponent>, string]> = [
  [VanillaTableOutOfCell, 'Vanilla HTML table; edit defined outside of cell'],
  [VanillaTableInCell, 'Vanilla HTML table; edit defined within cell'],
  [CdkFlexTableInCell, 'Flex cdk-table; edit defined within cell'],
  [CdkTableInCell, 'Table cdk-table; edit defined within cell'],
];

describe('CDK Popover Edit', () => {
  for (const [componentClass, label] of testCases) {
    describe(label, () => {
      let component: BaseTestComponent;
      let fixture: ComponentFixture<BaseTestComponent>;

      beforeEach(() => {
        TestBed.configureTestingModule({
          imports: [CdkTableModule, CdkPopoverEditModule, CommonModule, FormsModule],
          declarations: [componentClass],
        }).compileComponents();
        fixture = TestBed.createComponent(componentClass);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      describe('triggering edit', () => {
        it('shows and hides on-hover content only after a delay', fakeAsync(() => {
          const [row0, row1] = getRows(component.table.nativeElement);
          row0.dispatchEvent(new Event('mouseover', {bubbles: true}));
          row0.dispatchEvent(new Event('mousemove', {bubbles: true}));

          expect(component.getOpenButton(0)).toBe(null);

          tick(20);
          row0.dispatchEvent(new Event('mousemove', {bubbles: true}));
          tick(20);

          expect(component.getOpenButton(0)).toBe(null);

          tick(11);

          expect(component.getOpenButton(0)).toEqual(jasmine.any(HTMLElement));

          row1.dispatchEvent(new Event('mouseover', {bubbles: true}));
          row1.dispatchEvent(new Event('mousemove', {bubbles: true}));

          expect(component.getOpenButton(0)).toEqual(jasmine.any(HTMLElement));
          expect(component.getOpenButton(1)).toBe(null);

          tick(31);

          expect(component.getOpenButton(0)).toBe(null);
          expect(component.getOpenButton(1)).toEqual(jasmine.any(HTMLElement));
        }));

        it('opens edit from on-hover button', fakeAsync(() => {
          component.triggerHoverState();
          component.clickOpenButton();

          expect(component.lensIsOpen()).toBe(true);
        }));

        it('opens edit from Enter on focued cell', fakeAsync(() => {
          // Uses Enter to open the lens.
          component.openLens();

          expect(component.lensIsOpen()).toBe(true);
        }));
      });

      describe('edit lens', () => {
        it('shows a lens with the value from the table', fakeAsync(() => {
          component.openLens();

          expect(component.getInput()!.value).toBe('Hydrogen');
        }));

        it('updates the form and submits, closing the lens', fakeAsync(() => {
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickSubmitButton();
          fixture.detectChanges();

          expect(component.getEditCell().textContent!.trim()).toBe('Hydragon');
          expect(component.lensIsOpen()).toBe(false);
        }));

        it('does not close the lens on submit when form is invalid', fakeAsync(() => {
          component.openLens();

          component.getInput()!.value = '';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickSubmitButton();

          expect(component.lensIsOpen()).toBe(true);
        }));

        it('closes lens on submit when form is invalid with ' +
            'cdkEditControlIgnoreSubmitUnlessValid = false', fakeAsync(() => {
          component.ignoreSubmitUnlessValid = false;
          component.openLens();

          component.getInput()!.value = '';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickSubmitButton();

          expect(component.lensIsOpen()).toBe(false);
        }));

        it('closes the lens on close', fakeAsync(() => {
          component.openLens();

          component.clickCloseButton();

          expect(component.lensIsOpen()).toBe(false);
        }));

        it('closes and reopens a lens with modified value persisted', fakeAsync(() => {
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickCloseButton();
          fixture.detectChanges();

          expect(component.getEditCell().textContent!.trim()).toBe('Hydrogen');
          expect(component.lensIsOpen()).toBe(false);

          component.openLens();

          expect(component.getInput()!.value).toBe('Hydragon');
        }));

        it('resets the lens to original value', fakeAsync(() => {
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));

          component.clickRevertButton();

          expect(component.getInput()!.value).toBe('Hydrogen');
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
        }));

        it('closes the lens on escape', fakeAsync(() => {
          component.openLens();

          component.getInput()!.dispatchEvent(
              new KeyboardEvent('keyup', {bubbles: true, key: 'Escape'}));

          expect(component.lensIsOpen()).toBe(false);
        }));

        it('does not close the lens on click within lens', fakeAsync(() => {
          component.openLens();

          component.getInput()!.dispatchEvent(new Event('click', {bubbles: true}));

          expect(component.lensIsOpen()).toBe(true);
        }));

        it('closes the lens on outside click', fakeAsync(() => {
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));
          document.body.dispatchEvent(new Event('click', {bubbles: true}));
          fixture.detectChanges();

          expect(component.lensIsOpen()).toBe(false);
          expect(component.getEditCell().textContent!.trim()).toBe('Hydrogen');

        }));

        it('submits the lens on outside click with ' +
            'cdkEditControlClickOutBehavior = "submit"', fakeAsync(() => {
          component.clickOutBehavior = 'submit';
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));
          document.body.dispatchEvent(new Event('click', {bubbles: true}));
          fixture.detectChanges();

          expect(component.lensIsOpen()).toBe(false);
          expect(component.getEditCell().textContent!.trim()).toBe('Hydragon');
        }));

        it('does nothing on outside click with ' +
            'cdkEditControlClickOutBehavior = "noop"', fakeAsync(() => {
          component.clickOutBehavior = 'noop';
          component.openLens();

          component.getInput()!.value = 'Hydragon';
          component.getInput()!.dispatchEvent(new Event('input'));
          document.body.dispatchEvent(new Event('click', {bubbles: true}));
          fixture.detectChanges();

          expect(component.lensIsOpen()).toBe(true);
          expect(component.getEditCell().textContent!.trim()).toBe('Hydrogen');
        }));

        it('sets focus on the first input in the lens', fakeAsync(() => {
          component.openLens();

          expect(document.activeElement).toBe(component.getInput());
        }));

        it('returns focus to the edited cell after closing', fakeAsync(() => {
          component.openLens();

          component.clickCloseButton();

          expect(document.activeElement).toBe(component.getEditCell());
        }));

        it('does not focus to the edited cell after closing if another element ' +
            'outside the lens is already focused', fakeAsync(() => {
          component.openLens(0);

          component.getEditCell(1).focus();
          component.getEditCell(1).dispatchEvent(new Event('click', {bubbles: true}));

          expect(document.activeElement).toBe(component.getEditCell(1));
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
  return getElements(tableElement, '.cdk-row, tr');
}

function getCells(row: Element): HTMLElement[] {
  if (!row) {
    return [];
  }

  return getElements(row, '.cdk-cell, td');
}
