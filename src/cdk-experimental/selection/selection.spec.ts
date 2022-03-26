import {CdkTableModule} from '@angular/cdk/table';
import {ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {waitForAsync, ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';

import {CdkSelection} from './selection';
import {CdkSelectionModule} from './selection-module';
import {SelectionChange} from './selection-set';

describe('CdkSelection', () => {
  let fixture: ComponentFixture<ListWithMultiSelection>;
  let component: ListWithMultiSelection;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CdkSelectionModule],
      declarations: [ListWithMultiSelection],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListWithMultiSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('cdkSelection', () => {
    it('should allow toggling selection', () => {
      expect(component.cdkSelection.isSelected('apple', 0)).toBeFalsy();

      component.cdkSelection.toggleSelection('apple', 0);

      expect(component.cdkSelection.isSelected('apple', 0)).toBeTruthy();
    });

    it('should allow selecting all', () => {
      expect(component.cdkSelection.isAllSelected()).toBeFalsy();

      component.cdkSelection.toggleSelectAll();

      expect(component.cdkSelection.isAllSelected()).toBeTruthy();
    });

    it('should detect partial selection', () => {
      expect(component.cdkSelection.isPartialSelected()).toBeFalsy();

      component.cdkSelection.toggleSelectAll();

      expect(component.cdkSelection.isPartialSelected()).toBeFalsy();

      component.cdkSelection.toggleSelectAll();
      component.cdkSelection.toggleSelection('apple', 0);

      expect(component.cdkSelection.isPartialSelected()).toBeTruthy();
    });

    it('should clear selection when partial selected and toggling select-all', () => {
      component.cdkSelection.toggleSelection('apple', 0);
      component.cdkSelection.toggleSelectAll();

      expect(component.cdkSelection.isPartialSelected()).toBeFalsy();
      expect(component.cdkSelection.isAllSelected()).toBeFalsy();
    });
  });

  describe('cdkSelectAll', () => {
    it('should select all items when not all selected', fakeAsync(() => {
      expect(component.cdkSelection.isAllSelected()).toBeFalsy();
      expect(component.getSelectAll().textContent.trim()).toBe('unchecked');

      component.clickSelectAll();

      expect(component.cdkSelection.isAllSelected()).toBeTruthy();
      expect(component.getSelectAll().textContent.trim()).toBe('checked');
    }));

    it('should de-select all items when all selected', fakeAsync(() => {
      // Select all items.
      component.clickSelectAll();

      expect(component.cdkSelection.isAllSelected()).toBeTruthy();
      expect(component.getSelectAll().textContent.trim()).toBe('checked');

      component.clickSelectAll();

      expect(component.cdkSelection.isAllSelected()).toBeFalsy();
      expect(component.getSelectAll().textContent.trim()).toBe('unchecked');
    }));

    it('should de-select all items when partially selected', fakeAsync(() => {
      // make the 1st item selected.
      component.clickSelectionToggle(0);

      expect(component.cdkSelection.isPartialSelected()).toBeTruthy();
      expect(component.getSelectAll().textContent.trim()).toBe('indeterminate');

      component.clickSelectAll();

      expect(component.cdkSelection.isAllSelected()).toBeFalsy();
      expect(component.cdkSelection.isPartialSelected()).toBeFalsy();
      expect(component.getSelectAll().textContent.trim()).toBe('unchecked');
    }));

    it('should respond to selection toggle clicks', fakeAsync(() => {
      // Start with no selection.
      expect(component.cdkSelection.isAllSelected()).toBeFalsy();
      expect(component.getSelectAll().textContent.trim()).toBe('unchecked');

      // Select the 1st item.
      component.clickSelectionToggle(0);

      // Partially selected.
      expect(component.cdkSelection.isAllSelected()).toBeFalsy();
      expect(component.cdkSelection.isPartialSelected()).toBeTruthy();
      expect(component.getSelectAll().textContent.trim()).toBe('indeterminate');

      // Select the all the other items.
      component.clickSelectionToggle(1);
      component.clickSelectionToggle(2);
      component.clickSelectionToggle(3);

      // Select-all shows all selected.
      expect(component.cdkSelection.isAllSelected()).toBeTruthy();
      expect(component.cdkSelection.isPartialSelected()).toBeFalsy();
      expect(component.getSelectAll().textContent.trim()).toBe('checked');
    }));

    it('should emit the correct selection change events', fakeAsync(() => {
      component.clickSelectAll();

      expect(component.selectionChange!.before).toEqual([]);
      expect(component.selectionChange!.after).toEqual([
        {value: 'apple', index: 0},
        {value: 'banana', index: 1},
        {value: 'cherry', index: 2},
        {value: 'durian', index: 3},
      ]);

      component.clickSelectAll();

      expect(component.selectionChange!.before).toEqual([
        {value: 'apple', index: 0},
        {value: 'banana', index: 1},
        {value: 'cherry', index: 2},
        {value: 'durian', index: 3},
      ]);
      expect(component.selectionChange!.after).toEqual([]);
    }));
  });

  describe('cdkSelectionToggle', () => {
    it('should respond to select-all toggle click', fakeAsync(() => {
      // All items not unchecked.
      expect(component.getSelectionToggle(0).textContent.trim()).toBe('unchecked');
      expect(component.getSelectionToggle(1).textContent.trim()).toBe('unchecked');
      expect(component.getSelectionToggle(2).textContent.trim()).toBe('unchecked');
      expect(component.getSelectionToggle(3).textContent.trim()).toBe('unchecked');

      component.clickSelectAll();

      // Everything selected.
      expect(component.getSelectionToggle(0).textContent.trim()).toBe('checked');
      expect(component.getSelectionToggle(1).textContent.trim()).toBe('checked');
      expect(component.getSelectionToggle(2).textContent.trim()).toBe('checked');
      expect(component.getSelectionToggle(3).textContent.trim()).toBe('checked');

      component.clickSelectAll();

      // Everything unselected.
      expect(component.getSelectionToggle(0).textContent.trim()).toBe('unchecked');
      expect(component.getSelectionToggle(1).textContent.trim()).toBe('unchecked');
      expect(component.getSelectionToggle(2).textContent.trim()).toBe('unchecked');
      expect(component.getSelectionToggle(3).textContent.trim()).toBe('unchecked');
    }));

    it('should select unselected item when clicked', fakeAsync(() => {
      expect(component.cdkSelection.isSelected('apple', 0)).toBeFalsy();
      expect(component.getSelectionToggle(0).textContent.trim()).toBe('unchecked');

      component.clickSelectionToggle(0);

      expect(component.cdkSelection.isSelected('apple', 0)).toBeTruthy();
      expect(component.getSelectionToggle(0).textContent.trim()).toBe('checked');

      // And all the others are not affected.
      expect(component.cdkSelection.isSelected('banana', 1)).toBeFalsy();
      expect(component.cdkSelection.isSelected('cherry', 2)).toBeFalsy();
      expect(component.cdkSelection.isSelected('durian', 3)).toBeFalsy();
      expect(component.getSelectionToggle(1).textContent.trim()).toBe('unchecked');
      expect(component.getSelectionToggle(2).textContent.trim()).toBe('unchecked');
      expect(component.getSelectionToggle(3).textContent.trim()).toBe('unchecked');
    }));

    it('should de-selected selected item when clicked', fakeAsync(() => {
      // Make all items selected.
      component.clickSelectAll();

      component.clickSelectionToggle(1);

      expect(component.cdkSelection.isSelected('banana', 1)).toBeFalsy();
      expect(component.getSelectionToggle(1).textContent.trim()).toBe('unchecked');

      // And all the others are not affected.
      expect(component.cdkSelection.isSelected('apple', 0)).toBeTruthy();
      expect(component.cdkSelection.isSelected('cherry', 2)).toBeTruthy();
      expect(component.cdkSelection.isSelected('durian', 3)).toBeTruthy();
      expect(component.getSelectionToggle(0).textContent.trim()).toBe('checked');
      expect(component.getSelectionToggle(2).textContent.trim()).toBe('checked');
      expect(component.getSelectionToggle(3).textContent.trim()).toBe('checked');
    }));

    it('should emit the correct selection change events', fakeAsync(() => {
      component.clickSelectionToggle(1);

      expect(component.selectionChange!.before).toEqual([]);
      expect(component.selectionChange!.after).toEqual([{value: 'banana', index: 1}]);

      component.clickSelectionToggle(2);

      expect(component.selectionChange!.before).toEqual([{value: 'banana', index: 1}]);
      expect(component.selectionChange!.after).toEqual([
        {value: 'banana', index: 1},
        {value: 'cherry', index: 2},
      ]);

      component.clickSelectionToggle(2);

      expect(component.selectionChange!.before).toEqual([
        {value: 'banana', index: 1},
        {value: 'cherry', index: 2},
      ]);
      expect(component.selectionChange!.after).toEqual([{value: 'banana', index: 1}]);
    }));
  });
});

describe('CdkSelection with multiple = false', () => {
  let fixture: ComponentFixture<ListWithSingleSelection>;
  let component: ListWithSingleSelection;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CdkSelectionModule],
      declarations: [ListWithSingleSelection],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListWithSingleSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should uncheck the previous selection when selecting new item', fakeAsync(() => {
    // Everything start as unchecked.
    expect(component.getSelectionToggle(0).textContent.trim()).toBe('unchecked');
    expect(component.getSelectionToggle(1).textContent.trim()).toBe('unchecked');
    expect(component.getSelectionToggle(2).textContent.trim()).toBe('unchecked');
    expect(component.getSelectionToggle(3).textContent.trim()).toBe('unchecked');

    component.clickSelectionToggle(0);

    expect(component.getSelectionToggle(0).textContent.trim()).toBe('checked');
    expect(component.getSelectionToggle(1).textContent.trim()).toBe('unchecked');
    expect(component.getSelectionToggle(2).textContent.trim()).toBe('unchecked');
    expect(component.getSelectionToggle(3).textContent.trim()).toBe('unchecked');

    component.clickSelectionToggle(1);

    // Should uncheck the previous selection while selecting the new value.
    expect(component.getSelectionToggle(0).textContent.trim()).toBe('unchecked');
    expect(component.getSelectionToggle(1).textContent.trim()).toBe('checked');
    expect(component.getSelectionToggle(2).textContent.trim()).toBe('unchecked');
    expect(component.getSelectionToggle(3).textContent.trim()).toBe('unchecked');

    component.clickSelectionToggle(1);

    // Selecting a selected value should still uncheck it.
    expect(component.getSelectionToggle(0).textContent.trim()).toBe('unchecked');
    expect(component.getSelectionToggle(1).textContent.trim()).toBe('unchecked');
    expect(component.getSelectionToggle(2).textContent.trim()).toBe('unchecked');
    expect(component.getSelectionToggle(3).textContent.trim()).toBe('unchecked');
  }));

  it('should emit the correct selection change events', fakeAsync(() => {
    component.clickSelectionToggle(1);

    expect(component.selectionChange!.before).toEqual([]);
    expect(component.selectionChange!.after).toEqual([{value: 'banana', index: 1}]);

    component.clickSelectionToggle(2);

    expect(component.selectionChange!.before).toEqual([{value: 'banana', index: 1}]);
    expect(component.selectionChange!.after).toEqual([{value: 'cherry', index: 2}]);

    component.clickSelectionToggle(2);

    expect(component.selectionChange!.before).toEqual([{value: 'cherry', index: 2}]);
    expect(component.selectionChange!.after).toEqual([]);
  }));
});

describe('cdkSelectionColumn', () => {
  let fixture: ComponentFixture<MultiSelectTableWithSelectionColumn>;
  let component: MultiSelectTableWithSelectionColumn;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CdkSelectionModule, CdkTableModule],
      declarations: [MultiSelectTableWithSelectionColumn],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSelectTableWithSelectionColumn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show check boxes', () => {
    const checkboxes =
      component.elementRef.nativeElement.querySelectorAll('input[type="checkbox"]');
    // Select-all toggle + each toggle per row.
    expect(checkboxes.length).toBe(5);
  });

  it('should allow select all', fakeAsync(() => {
    expect(component.getSelectAll().checked).toBe(false);
    expect(component.getSelectionToggle(0).checked).toBe(false);
    expect(component.getSelectionToggle(1).checked).toBe(false);
    expect(component.getSelectionToggle(2).checked).toBe(false);
    expect(component.getSelectionToggle(3).checked).toBe(false);

    component.clickSelectAll();

    expect(component.getSelectAll().checked).toBe(true);
    expect(component.getSelectionToggle(0).checked).toBe(true);
    expect(component.getSelectionToggle(1).checked).toBe(true);
    expect(component.getSelectionToggle(2).checked).toBe(true);
    expect(component.getSelectionToggle(3).checked).toBe(true);
  }));

  it('should allow toggle rows', fakeAsync(() => {
    expect(component.getSelectAll().checked).toBe(false);
    expect(component.getSelectAll().indeterminate).toBe(false);
    expect(component.getSelectionToggle(0).checked).toBe(false);

    component.clickSelectionToggle(0);

    expect(component.getSelectAll().checked).toBe(false);
    expect(component.getSelectAll().indeterminate).toBe(true);
    expect(component.getSelectionToggle(0).checked).toBe(true);

    component.clickSelectionToggle(1);
    component.clickSelectionToggle(2);
    component.clickSelectionToggle(3);

    expect(component.getSelectAll().checked).toBe(true);
    expect(component.getSelectAll().indeterminate).toBe(false);
    expect(component.getSelectionToggle(1).checked).toBe(true);
    expect(component.getSelectionToggle(2).checked).toBe(true);
    expect(component.getSelectionToggle(3).checked).toBe(true);
  }));

  describe('cdkRowSelection', () => {
    it('should set .cdk-selected on selected rows', fakeAsync(() => {
      expect(component.getRow(0).classList.contains('cdk-selected')).toBeFalsy();
      expect(component.getRow(1).classList.contains('cdk-selected')).toBeFalsy();
      expect(component.getRow(2).classList.contains('cdk-selected')).toBeFalsy();
      expect(component.getRow(3).classList.contains('cdk-selected')).toBeFalsy();

      component.clickSelectionToggle(0);

      expect(component.getRow(0).classList.contains('cdk-selected')).toBeTruthy();

      component.clickSelectionToggle(0);

      expect(component.getRow(0).classList.contains('cdk-selected')).toBeFalsy();
    }));

    it('should set aria-selected on selected rows', fakeAsync(() => {
      expect(component.getRow(0).getAttribute('aria-selected')).toBe('false');
      expect(component.getRow(1).getAttribute('aria-selected')).toBe('false');
      expect(component.getRow(2).getAttribute('aria-selected')).toBe('false');
      expect(component.getRow(3).getAttribute('aria-selected')).toBe('false');

      component.clickSelectionToggle(0);

      expect(component.getRow(0).getAttribute('aria-selected')).toBe('true');

      component.clickSelectionToggle(0);

      expect(component.getRow(0).getAttribute('aria-selected')).toBe('false');
    }));
  });
});

describe('cdkSelectionColumn with multiple = false', () => {
  let fixture: ComponentFixture<SingleSelectTableWithSelectionColumn>;
  let component: SingleSelectTableWithSelectionColumn;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CdkSelectionModule, CdkTableModule],
      declarations: [SingleSelectTableWithSelectionColumn],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleSelectTableWithSelectionColumn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not show select all', () => {
    expect(component.elementRef.nativeElement.querySelector('input[cdkselectall]')).toBe(null);
  });

  it('should allow selecting one single row', fakeAsync(() => {
    expect(component.getSelectionToggle(0).checked).toBe(false);
    expect(component.getSelectionToggle(1).checked).toBe(false);
    expect(component.getSelectionToggle(2).checked).toBe(false);
    expect(component.getSelectionToggle(3).checked).toBe(false);

    component.clickSelectionToggle(0);

    expect(component.getSelectionToggle(0).checked).toBe(true);

    component.clickSelectionToggle(1);

    expect(component.getSelectionToggle(0).checked).toBe(false);
    expect(component.getSelectionToggle(1).checked).toBe(true);

    component.clickSelectionToggle(1);
    expect(component.getSelectionToggle(1).checked).toBe(false);
  }));
});

@Component({
  template: `
    <ul cdkSelection [dataSource]="data" [cdkSelectionMultiple]="true"
        (cdkSelectionChange)="selectionChange = $event">
      <button cdkSelectAll #toggleAll="cdkSelectAll" (click)="toggleAll.toggle($event)">
        {{selectAllState(toggleAll.indeterminate | async, toggleAll.checked | async)}}
      </button>
      <li *ngFor="let item of data; index as i">
        <button cdkSelectionToggle #toggle="cdkSelectionToggle"
            [cdkSelectionToggleValue]="item"
            [cdkSelectionToggleIndex]="i"
            (click)="toggle.toggle()">
          {{(toggle.checked | async) ? 'checked' : 'unchecked'}}
        </button>
        {{item}}
      </li>
    </ul>`,
})
class ListWithMultiSelection {
  @ViewChild(CdkSelection) cdkSelection: CdkSelection<string>;

  data = ['apple', 'banana', 'cherry', 'durian'];

  selectionChange?: SelectionChange<string>;

  constructor(private readonly _elementRef: ElementRef, private readonly _cdr: ChangeDetectorRef) {}

  selectAllState(indeterminateState: boolean | null, checkedState: boolean | null): string {
    if (indeterminateState) {
      return 'indeterminate';
    } else if (checkedState) {
      return 'checked';
    } else {
      return 'unchecked';
    }
  }

  clickSelectAll() {
    this.getSelectAll().click();
    flush();
    this._cdr.detectChanges();
  }

  clickSelectionToggle(index: number) {
    const toggle = this.getSelectionToggle(index);
    if (!toggle) {
      return;
    }

    toggle.click();
    flush();
    this._cdr.detectChanges();
  }

  getSelectAll() {
    return this._elementRef.nativeElement.querySelector('[cdkselectall]');
  }

  getSelectionToggle(index: number) {
    return this._elementRef.nativeElement.querySelectorAll('[cdkselectiontoggle]')[index];
  }
}

@Component({
  template: `
    <ul cdkSelection [dataSource]="data" [cdkSelectionMultiple]="false"
        (cdkSelectionChange)="selectionChange = $event" >
      <li *ngFor="let item of data; index as i">
        <button cdkSelectionToggle #toggle="cdkSelectionToggle"
            [cdkSelectionToggleValue]="item"
            [cdkSelectionToggleIndex]="i"
            (click)="toggle.toggle()">
          {{(toggle.checked | async) ? 'checked' : 'unchecked'}}
        </button>
        {{item}}
      </li>
    </ul>`,
})
class ListWithSingleSelection {
  @ViewChild(CdkSelection) cdkSelection: CdkSelection<string>;

  data = ['apple', 'banana', 'cherry', 'durian'];
  selectionChange?: SelectionChange<string>;

  clickSelectionToggle(index: number) {
    const toggle = this.getSelectionToggle(index);
    if (!toggle) {
      return;
    }

    toggle.click();
    flush();
    this._cdr.detectChanges();
  }

  constructor(private readonly _elementRef: ElementRef, private readonly _cdr: ChangeDetectorRef) {}

  getSelectionToggle(index: number) {
    return this._elementRef.nativeElement.querySelectorAll('[cdkselectiontoggle]')[index];
  }
}

@Component({
  template: `
    <table cdk-table cdkSelection [dataSource]="data" [cdkSelectionMultiple]="true">
      <cdk-selection-column cdkSelectionColumnName="select"></cdk-selection-column>
      <ng-container cdkColumnDef="name">
        <th cdk-header-cell *cdkHeaderCellDef>Name</th>
        <td cdk-cell *cdkCellDef="let element">{{element}}</td>
      </ng-container>

      <tr cdk-header-row *cdkHeaderRowDef="columns"></tr>
      <tr cdk-row *cdkRowDef="let row; columns: columns;"
          cdkRowSelection [cdkRowSelectionValue]="row"></tr>
    </table>
    `,
})
class MultiSelectTableWithSelectionColumn {
  @ViewChild(CdkSelection) cdkSelection: CdkSelection<string>;

  columns = ['select', 'name'];
  data = ['apple', 'banana', 'cherry', 'durian'];

  selectAllState(indeterminateState: boolean | null, checkedState: boolean | null): string {
    if (indeterminateState) {
      return 'indeterminate';
    } else if (checkedState) {
      return 'checked';
    } else {
      return 'unchecked';
    }
  }

  clickSelectAll() {
    this.getSelectAll().click();
    flush();
    this._cdr.detectChanges();
  }

  clickSelectionToggle(index: number) {
    const toggle = this.getSelectionToggle(index);
    if (!toggle) {
      return;
    }

    toggle.click();
    flush();
    this._cdr.detectChanges();
  }

  constructor(readonly elementRef: ElementRef, private readonly _cdr: ChangeDetectorRef) {}

  getSelectAll(): HTMLInputElement {
    return this.elementRef.nativeElement.querySelector('input[cdkselectall]');
  }

  getSelectionToggle(index: number): HTMLInputElement {
    return this.elementRef.nativeElement.querySelectorAll('input[cdkselectiontoggle]')[index];
  }

  getRow(index: number): HTMLElement {
    return this.elementRef.nativeElement.querySelectorAll('tr[cdkrowselection]')[index];
  }
}

@Component({
  template: `
    <table cdk-table cdkSelection [dataSource]="data" [cdkSelectionMultiple]="false">
      <cdk-selection-column cdkSelectionColumnName="select"></cdk-selection-column>
      <ng-container cdkColumnDef="name">
        <th cdk-header-cell *cdkHeaderCellDef>Name</th>
        <td cdk-cell *cdkCellDef="let element">{{element}}</td>
      </ng-container>

      <tr cdk-header-row *cdkHeaderRowDef="columns"></tr>
      <tr cdk-row *cdkRowDef="let row; columns: columns;"
          cdkRowSelection [cdkRowSelectionValue]="row"></tr>
    </table>
    `,
})
class SingleSelectTableWithSelectionColumn {
  @ViewChild(CdkSelection) cdkSelection: CdkSelection<string>;

  columns = ['select', 'name'];
  data = ['apple', 'banana', 'cherry', 'durian'];

  clickSelectionToggle(index: number) {
    const toggle = this.getSelectionToggle(index);
    if (!toggle) {
      return;
    }

    toggle.click();
    flush();
    this._cdr.detectChanges();
  }

  constructor(readonly elementRef: ElementRef, private readonly _cdr: ChangeDetectorRef) {}

  getSelectionToggle(index: number): HTMLInputElement {
    return this.elementRef.nativeElement.querySelectorAll('input[cdkselectiontoggle]')[index];
  }

  getRow(index: number): HTMLElement {
    return this.elementRef.nativeElement.querySelectorAll('tr[cdkrowselection]')[index];
  }
}
