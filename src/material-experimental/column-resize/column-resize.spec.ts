import {Component, Directive, ElementRef, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, flushMicrotasks} from '@angular/core/testing';
import {BidiModule} from '@angular/cdk/bidi';
import {DataSource} from '@angular/cdk/collections';
import {dispatchKeyboardEvent} from '../../cdk/testing/private';
import {ESCAPE} from '@angular/cdk/keycodes';
import {MatLegacyTableModule} from '@angular/material/legacy-table';
import {BehaviorSubject} from 'rxjs';

import {ColumnSize} from '@angular/cdk-experimental/column-resize';
import {
  MatColumnResize,
  MatColumnResizeFlex,
  MatColumnResizeModule,
  MatDefaultEnabledColumnResize,
  MatDefaultEnabledColumnResizeFlex,
  MatDefaultEnabledColumnResizeModule,
} from './index';
import {AbstractMatColumnResize} from './column-resize-directives/common';

function getDefaultEnabledDirectiveStrings() {
  return {
    table: '',
    columnEnabled: '',
    columnDisabled: 'disableResize',
  };
}

function getOptInDirectiveStrings() {
  return {
    table: 'columnResize',
    columnEnabled: 'resizable',
    columnDisabled: '',
  };
}

function getTableTemplate(defaultEnabled: boolean) {
  const directives = defaultEnabled
    ? getDefaultEnabledDirectiveStrings()
    : getOptInDirectiveStrings();

  return `
      <style>
        .mat-resizable {
          box-sizing: border-box;
        }
        .mat-header-cell {
          border: 1px solid green;
        }
        table {
          width: 800px;
        }
      </style>
      <div #table [dir]="direction">
        <table ${directives.table} mat-table [dataSource]="dataSource"
            style="table-layout: fixed;">
          <!-- Position Column -->
          <ng-container matColumnDef="position" sticky>
            <th mat-header-cell *matHeaderCellDef
                ${directives.columnEnabled} [matResizableMaxWidthPx]="100"> No. </th>
            <td mat-cell *matCellDef="let element"> {{element.position}} </td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name" sticky>
            <th mat-header-cell *matHeaderCellDef
                ${directives.columnEnabled} [matResizableMinWidthPx]="150"> Name </th>
            <td mat-cell *matCellDef="let element"> {{element.name}} </td>
          </ng-container>

          <!-- Weight Column (not resizable) -->
          <ng-container matColumnDef="weight" sticky>
            <th mat-header-cell *matHeaderCellDef ${directives.columnDisabled}>
              Weight (Not resizable)
            </th>
            <td mat-cell *matCellDef="let element"> {{element.weight}} </td>
          </ng-container>

          <!-- Symbol Column -->
          <ng-container matColumnDef="symbol">
            <th mat-header-cell *matHeaderCellDef ${directives.columnEnabled}> Symbol </th>
            <td mat-cell *matCellDef="let element"> {{element.symbol}} </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
    `;
}

function getFlexTemplate(defaultEnabled: boolean) {
  const directives = defaultEnabled
    ? getDefaultEnabledDirectiveStrings()
    : getOptInDirectiveStrings();

  return `
      <style>
        .mat-header-cell,
        .mat-cell,
        .mat-resizable {
          box-sizing: border-box;
        }
        .mat-header-cell {
          border: 1px solid green;
        }
        mat-table {
          width: 800px;
        }
      </style>
      <div #table [dir]="direction">
        <mat-table ${directives.table} [dataSource]="dataSource">
          <!-- Position Column -->
          <ng-container matColumnDef="position" sticky>
            <mat-header-cell *matHeaderCellDef
                ${directives.columnEnabled} [matResizableMaxWidthPx]="100"> No. </mat-header-cell>
            <mat-cell *matCellDef="let element"> {{element.position}} </mat-cell>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name" sticky>
            <mat-header-cell *matHeaderCellDef
                ${directives.columnEnabled} [matResizableMinWidthPx]="150"> Name </mat-header-cell>
            <mat-cell *matCellDef="let element"> {{element.name}} </mat-cell>
          </ng-container>

          <!-- Weight Column (not resizable) -->
          <ng-container matColumnDef="weight" sticky>
            <mat-header-cell *matHeaderCellDef ${directives.columnDisabled}>
              Weight (Not resizable)
            </mat-header-cell>
            <mat-cell *matCellDef="let element"> {{element.weight}} </mat-cell>
          </ng-container>

          <!-- Symbol Column -->
          <ng-container matColumnDef="symbol">
            <mat-header-cell *matHeaderCellDef ${directives.columnEnabled}>
              Symbol
            </mat-header-cell>
            <mat-cell *matCellDef="let element"> {{element.symbol}} </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
          </mat-table>
        </div>
    `;
}

const MOUSE_START_OFFSET = 1000;

@Directive()
abstract class BaseTestComponent {
  @ViewChild('table') table: ElementRef;

  abstract columnResize: AbstractMatColumnResize;

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new ElementDataSource();
  direction = 'ltr';

  getTableHeight(): number {
    return this.table.nativeElement.querySelector('.mat-table').offsetHeight;
  }

  getTableWidth(): number {
    return this.table.nativeElement.querySelector('.mat-table').offsetWidth;
  }

  getHeaderRowHeight(): number {
    return this.table.nativeElement.querySelector('.mat-header-row .mat-header-cell').offsetHeight;
  }

  getColumnElement(index: number): HTMLElement {
    return this.table.nativeElement!.querySelectorAll('.mat-header-cell')[index] as HTMLElement;
  }

  getColumnWidth(index: number): number {
    return this.getColumnElement(index).offsetWidth;
  }

  getColumnOriginPosition(index: number): number {
    return this.getColumnElement(index).offsetLeft + this.getColumnWidth(index);
  }

  triggerHoverState(): void {
    const headerCell = this.table.nativeElement.querySelector('.mat-header-cell');
    headerCell.dispatchEvent(new Event('mouseover', {bubbles: true}));
  }

  endHoverState(): void {
    const dataRow = this.table.nativeElement.querySelector('.mat-row');
    dataRow.dispatchEvent(new Event('mouseover', {bubbles: true}));
  }

  getOverlayThumbElement(index: number): HTMLElement {
    return document.querySelectorAll('.mat-column-resize-overlay-thumb')[index] as HTMLElement;
  }

  getOverlayThumbTopElement(index: number): HTMLElement {
    return document.querySelectorAll('.mat-column-resize-overlay-thumb-top')[index] as HTMLElement;
  }

  getOverlayThumbPosition(index: number): number {
    const thumbPositionElement = this.getOverlayThumbElement(index)!.parentNode as HTMLElement;
    const left = parseInt(thumbPositionElement.style.left!, 10);
    const translateX = Number(
      /translateX\((-?\d+)px\)/.exec(thumbPositionElement.style.transform)?.[1] ?? 0,
    );
    return left + translateX;
  }

  beginColumnResizeWithMouse(index: number, button = 0): void {
    const thumbElement = this.getOverlayThumbElement(index);
    this.table.nativeElement!.dispatchEvent(
      new MouseEvent('mouseleave', {bubbles: true, relatedTarget: thumbElement, button}),
    );
    thumbElement.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        screenX: MOUSE_START_OFFSET,
        button,
      } as MouseEventInit),
    );
  }

  updateResizeWithMouseInProgress(totalDelta: number): void {
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        screenX: MOUSE_START_OFFSET + totalDelta,
      } as MouseEventInit),
    );
  }

  completeResizeWithMouseInProgress(totalDelta: number): void {
    document.dispatchEvent(
      new MouseEvent('mouseup', {
        bubbles: true,
        screenX: MOUSE_START_OFFSET + totalDelta,
      } as MouseEventInit),
    );
  }

  resizeColumnWithMouse(index: number, resizeDelta: number): void {
    this.beginColumnResizeWithMouse(index);
    this.updateResizeWithMouseInProgress(resizeDelta);
    this.completeResizeWithMouseInProgress(resizeDelta);
  }
}

@Directive()
abstract class BaseTestComponentRtl extends BaseTestComponent {
  override direction = 'rtl';

  override getColumnOriginPosition(index: number): number {
    return this.getColumnElement(index).offsetLeft;
  }

  override updateResizeWithMouseInProgress(totalDelta: number): void {
    super.updateResizeWithMouseInProgress(-totalDelta);
  }

  override completeResizeWithMouseInProgress(totalDelta: number): void {
    super.completeResizeWithMouseInProgress(-totalDelta);
  }
}

@Component({template: getTableTemplate(false)})
class MatResizeTest extends BaseTestComponent {
  @ViewChild(MatColumnResize) columnResize: AbstractMatColumnResize;
}

@Component({template: getTableTemplate(false), changeDetection: ChangeDetectionStrategy.OnPush})
class MatResizeOnPushTest extends MatResizeTest {}

@Component({template: getTableTemplate(true)})
class MatResizeDefaultTest extends BaseTestComponent {
  @ViewChild(MatDefaultEnabledColumnResize) columnResize: AbstractMatColumnResize;
}

@Component({template: getTableTemplate(true)})
class MatResizeDefaultRtlTest extends BaseTestComponentRtl {
  @ViewChild(MatDefaultEnabledColumnResize) columnResize: AbstractMatColumnResize;
}

@Component({template: getFlexTemplate(false)})
class MatResizeFlexTest extends BaseTestComponent {
  @ViewChild(MatColumnResizeFlex) columnResize: AbstractMatColumnResize;
}

@Component({template: getFlexTemplate(true)})
class MatResizeDefaultFlexTest extends BaseTestComponent {
  @ViewChild(MatDefaultEnabledColumnResizeFlex)
  columnResize: AbstractMatColumnResize;
}

@Component({template: getFlexTemplate(true)})
class MatResizeDefaultFlexRtlTest extends BaseTestComponentRtl {
  @ViewChild(MatDefaultEnabledColumnResizeFlex)
  columnResize: AbstractMatColumnResize;
}

interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

class ElementDataSource extends DataSource<PeriodicElement> {
  /** Stream of data that is provided to the table. */
  data = new BehaviorSubject(createElementData());

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect() {
    return this.data;
  }

  disconnect() {}
}

// There's 1px of variance between different browsers in terms of positioning.
const approximateMatcher = {
  isApproximately: () => ({
    compare: (actual: number, expected: number) => {
      const result = {
        pass: false,
        message: `Expected ${actual} to be within 1 of ${expected}`,
      };

      result.pass = actual === expected || actual === expected + 1 || actual === expected - 1;

      return result;
    },
  }),
};

const testCases = [
  [MatColumnResizeModule, MatResizeTest, 'opt-in table-based mat-table'],
  [MatColumnResizeModule, MatResizeOnPushTest, 'inside OnPush component'],
  [MatColumnResizeModule, MatResizeFlexTest, 'opt-in flex-based mat-table'],
  [
    MatDefaultEnabledColumnResizeModule,
    MatResizeDefaultTest,
    'default enabled table-based mat-table',
  ],
  [
    MatDefaultEnabledColumnResizeModule,
    MatResizeDefaultRtlTest,
    'default enabled rtl table-based mat-table',
  ],
  [
    MatDefaultEnabledColumnResizeModule,
    MatResizeDefaultFlexTest,
    'default enabled flex-based mat-table',
  ],
  [
    MatDefaultEnabledColumnResizeModule,
    MatResizeDefaultFlexRtlTest,
    'default enabled rtl flex-based mat-table',
  ],
] as const;

describe('Material Popover Edit', () => {
  for (const [resizeModule, componentClass, label] of testCases) {
    describe(label, () => {
      let component: BaseTestComponent;
      let fixture: ComponentFixture<BaseTestComponent>;

      beforeEach(fakeAsync(() => {
        jasmine.addMatchers(approximateMatcher);

        TestBed.configureTestingModule({
          imports: [BidiModule, MatLegacyTableModule, resizeModule],
          declarations: [componentClass],
        }).compileComponents();
        fixture = TestBed.createComponent(componentClass);
        component = fixture.componentInstance;
        fixture.detectChanges();
        flushMicrotasks();
      }));

      it('shows resize handle overlays on header row hover and while a resize handle is in use', fakeAsync(() => {
        expect(component.getOverlayThumbElement(0)).toBeUndefined();

        const headerRowHeight = component.getHeaderRowHeight();
        const tableHeight = component.getTableHeight();

        component.triggerHoverState();
        fixture.detectChanges();

        expect(
          component.getOverlayThumbElement(0).classList.contains('mat-column-resize-overlay-thumb'),
        ).toBe(true);
        expect(
          component.getOverlayThumbElement(2).classList.contains('mat-column-resize-overlay-thumb'),
        ).toBe(true);

        (expect(component.getOverlayThumbElement(0).offsetHeight) as any).isApproximately(
          headerRowHeight,
        );
        (expect(component.getOverlayThumbElement(2).offsetHeight) as any).isApproximately(
          headerRowHeight,
        );

        component.beginColumnResizeWithMouse(0);

        expect(
          component.getOverlayThumbElement(0).classList.contains('mat-column-resize-overlay-thumb'),
        ).toBe(true);
        expect(
          component.getOverlayThumbElement(2).classList.contains('mat-column-resize-overlay-thumb'),
        ).toBe(true);

        (expect(component.getOverlayThumbElement(0).offsetHeight) as any).isApproximately(
          tableHeight,
        );
        (expect(component.getOverlayThumbTopElement(0).offsetHeight) as any).isApproximately(
          headerRowHeight,
        );
        (expect(component.getOverlayThumbElement(2).offsetHeight) as any).isApproximately(
          headerRowHeight,
        );

        component.completeResizeWithMouseInProgress(0);
        component.endHoverState();
        fixture.detectChanges();
        flushMicrotasks();

        expect(component.getOverlayThumbElement(0)).toBeUndefined();
      }));

      it('resizes the target column via mouse input', fakeAsync(() => {
        const initialTableWidth = component.getTableWidth();
        const initialColumnWidth = component.getColumnWidth(1);
        const initialColumnPosition = component.getColumnOriginPosition(1);
        const initialNextColumnPosition = component.getColumnOriginPosition(2);

        component.triggerHoverState();
        fixture.detectChanges();
        component.beginColumnResizeWithMouse(1);

        const initialThumbPosition = component.getOverlayThumbPosition(1);
        component.updateResizeWithMouseInProgress(5);
        flushMicrotasks();

        let thumbPositionDelta = component.getOverlayThumbPosition(1) - initialThumbPosition;
        let columnPositionDelta = component.getColumnOriginPosition(1) - initialColumnPosition;
        let nextColumnPositionDelta =
          component.getColumnOriginPosition(2) - initialNextColumnPosition;
        (expect(thumbPositionDelta) as any).isApproximately(columnPositionDelta);
        (expect(nextColumnPositionDelta) as any).isApproximately(columnPositionDelta);

        (expect(component.getTableWidth()) as any).isApproximately(initialTableWidth + 5);
        (expect(component.getColumnWidth(1)) as any).isApproximately(initialColumnWidth + 5);

        component.updateResizeWithMouseInProgress(1);
        flushMicrotasks();

        thumbPositionDelta = component.getOverlayThumbPosition(1) - initialThumbPosition;
        columnPositionDelta = component.getColumnOriginPosition(1) - initialColumnPosition;
        (expect(thumbPositionDelta) as any).isApproximately(columnPositionDelta);

        (expect(component.getTableWidth()) as any).isApproximately(initialTableWidth + 1);
        (expect(component.getColumnWidth(1)) as any).isApproximately(initialColumnWidth + 1);

        component.completeResizeWithMouseInProgress(1);
        flushMicrotasks();

        (expect(component.getColumnWidth(1)) as any).isApproximately(initialColumnWidth + 1);

        component.endHoverState();
        fixture.detectChanges();
      }));

      it('should not start dragging using the right mouse button', fakeAsync(() => {
        const initialColumnWidth = component.getColumnWidth(1);

        component.triggerHoverState();
        fixture.detectChanges();
        component.beginColumnResizeWithMouse(1, 2);

        const initialPosition = component.getOverlayThumbPosition(1);

        component.updateResizeWithMouseInProgress(5);

        expect(component.getOverlayThumbPosition(1)).toBe(initialPosition);
        expect(component.getColumnWidth(1)).toBe(initialColumnWidth);
      }));

      it('cancels an active mouse resize with the escape key', fakeAsync(() => {
        const initialTableWidth = component.getTableWidth();
        const initialColumnWidth = component.getColumnWidth(1);
        const initialColumnPosition = component.getColumnOriginPosition(1);

        component.triggerHoverState();
        fixture.detectChanges();
        component.beginColumnResizeWithMouse(1);

        const initialThumbPosition = component.getOverlayThumbPosition(1);

        component.updateResizeWithMouseInProgress(5);
        flushMicrotasks();

        let thumbPositionDelta = component.getOverlayThumbPosition(1) - initialThumbPosition;
        let columnPositionDelta = component.getColumnOriginPosition(1) - initialColumnPosition;
        (expect(thumbPositionDelta) as any).isApproximately(columnPositionDelta);

        (expect(component.getColumnWidth(1)) as any).isApproximately(initialColumnWidth + 5);
        (expect(component.getTableWidth()) as any).isApproximately(initialTableWidth + 5);

        dispatchKeyboardEvent(document, 'keyup', ESCAPE);
        flushMicrotasks();

        (expect(component.getColumnWidth(1)) as any).isApproximately(initialColumnWidth);
        (expect(component.getTableWidth()) as any).isApproximately(initialTableWidth);

        component.endHoverState();
        fixture.detectChanges();
      }));

      it('notifies subscribers of a completed resize via ColumnResizeNotifier', fakeAsync(() => {
        const initialColumnWidth = component.getColumnWidth(1);

        let resize: ColumnSize | null = null;
        component.columnResize.columnResizeNotifier.resizeCompleted.subscribe(size => {
          resize = size;
        });

        component.triggerHoverState();
        fixture.detectChanges();

        expect(resize).toBe(null);

        component.resizeColumnWithMouse(1, 5);
        flushMicrotasks();

        expect(resize).toEqual({columnId: 'name', size: initialColumnWidth + 5} as any);

        component.endHoverState();
        fixture.detectChanges();
      }));

      it('does not notify subscribers of a canceled resize', fakeAsync(() => {
        let resize: ColumnSize | null = null;
        component.columnResize.columnResizeNotifier.resizeCompleted.subscribe(size => {
          resize = size;
        });

        component.triggerHoverState();
        fixture.detectChanges();
        component.beginColumnResizeWithMouse(0);

        component.updateResizeWithMouseInProgress(5);
        flushMicrotasks();

        dispatchKeyboardEvent(document, 'keyup', ESCAPE);
        flushMicrotasks();

        component.endHoverState();
        fixture.detectChanges();

        expect(resize).toBe(null);
      }));

      it('performs a column resize triggered via ColumnResizeNotifier', fakeAsync(() => {
        // Pre-verify that we are not updating the size to the initial size.
        (expect(component.getColumnWidth(1)) as any).not.isApproximately(173);

        component.columnResize.columnResizeNotifier.resize('name', 173);
        flushMicrotasks();

        (expect(component.getColumnWidth(1)) as any).isApproximately(173);
      }));
    });
  }
});

function createElementData() {
  return [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  ];
}
