import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  IterableDiffer,
  IterableDiffers,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {CdkCellDef} from './cell';
import {Subject} from 'rxjs/Subject';

/**
 * Base class for the CdkHeaderRowDef and CdkRowDef that handles checking their columns inputs
 * for changes and notifying the table.
 */
export abstract class BaseRowDef {
  /** The columns to be displayed on this row. */
  columns: string[];

  /** Event stream that emits when changes are made to the columns. */
  columnsChange: Subject<void> = new Subject<void>();

  /** Differ used to check if any changes were made to the columns. */
  protected _columnsDiffer: IterableDiffer<any>;

  private viewInitialized = false;

  constructor(public template: TemplateRef<any>,
              protected _differs: IterableDiffers) { }

  ngAfterViewInit() {
    this.viewInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Create a new columns differ if one does not yet exist. Initialize it based on initial value
    // of the columns property.
    if (!this._columnsDiffer) {
      this._columnsDiffer = this._differs.find(changes['columns'].currentValue).create();
    }
  }

  ngDoCheck(): void {
    if (!this.viewInitialized || !this._columnsDiffer || !this.columns) { return; }

    // Notify the table if there are any changes to the columns.
    const changes = this._columnsDiffer.diff(this.columns);
    if (changes) { this.columnsChange.next(); }
  }
}

/**
 * Header row definition for the CDK data-table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
@Directive({
  selector: '[cdkHeaderRowDef]',
  inputs: ['columns: cdkHeaderRowDef'],
})
export class CdkHeaderRowDef extends BaseRowDef {
  constructor(template: TemplateRef<any>, _differs: IterableDiffers) {
    super(template, _differs);
  }
}

/**
 * Data row definition for the CDK data-table.
 * Captures the header row's template and other row properties such as the columns to display.
 */
@Directive({
  selector: '[cdkRowDef]',
  inputs: ['columns: cdkRowDefColumns'],
})
export class CdkRowDef extends BaseRowDef {
  // TODO(andrewseguin): Add an input for providing a switch function to determine
  //   if this template should be used.
  constructor(template: TemplateRef<any>, _differs: IterableDiffers) {
    super(template, _differs);
  }
}

/**
 * Outlet for rendering cells inside of a row or header row.
 * @docs-private
 */
@Directive({selector: '[cdkCellOutlet]'})
export class CdkCellOutlet {
  /** The ordered list of cells to render within this outlet's view container */
  cells: CdkCellDef[];

  /** The data context to be provided to each cell */
  context: any;

  /**
   * Static property containing the latest constructed instance of this class.
   * Used by the CDK data-table when each CdkHeaderRow and CdkRow component is created using
   * createEmbeddedView. After one of these components are created, this property will provide
   * a handle to provide that component's cells and context. After init, the CdkCellOutlet will
   * construct the cells with the provided context.
   */
  static mostRecentCellOutlet: CdkCellOutlet = null;

  constructor(private _viewContainer: ViewContainerRef) {
    CdkCellOutlet.mostRecentCellOutlet = this;
  }

  ngOnInit() {
    this.cells.forEach(cell => {
      this._viewContainer.createEmbeddedView(cell.template, this.context);
    });
  }
}

/** Header template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'cdk-header-row',
  template: '<ng-container cdkCellOutlet></ng-container>',
  host: {
    'class': 'cdk-header-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkHeaderRow { }

/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'cdk-row',
  template: '<ng-container cdkCellOutlet></ng-container>',
  host: {
    'class': 'cdk-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkRow { }
