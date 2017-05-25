import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  Input,
  QueryList,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/combineLatest';
import {CollectionViewer, DataSource} from './data-source';
import {CdkCellOutlet, CdkHeaderRowDef, CdkRowDef} from './row';
import {CdkCellDef, CdkColumnDef, CdkHeaderCellDef} from './cell';

/**
 * Provides a handle for the table to grab the view container's ng-container to insert data rows.
 * @docs-private
 */
@Directive({selector: '[rowPlaceholder]'})
export class RowPlaceholder {
  constructor(public viewContainer: ViewContainerRef) { }
}

/**
 * Provides a handle for the table to grab the view container's ng-container to insert the header.
 * @docs-private
 */
@Directive({selector: '[headerRowPlaceholder]'})
export class HeaderRowPlaceholder {
  constructor(public viewContainer: ViewContainerRef) { }
}

/**
 * A data table that connects with a data source to retrieve data and renders
 * a header row and data rows. Updates the rows when new data is provided by the data source.
 */
@Component({
  selector: 'cdk-table',
  template: `
    <ng-container headerRowPlaceholder></ng-container>
    <ng-container rowPlaceholder></ng-container>
  `,
  host: {
    'class': 'cdk-table',
    'role': 'grid' // TODO(andrewseguin): Allow the user to choose either grid or treegrid
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkTable implements CollectionViewer {
  /**
   * Provides a stream containing the latest data array to render. Influenced by the table's
   * stream of view window (what rows are currently on screen).
   */
  @Input() dataSource: DataSource<any>;

  // TODO(andrewseguin): Remove max value as the end index
  // and instead calculate the view on init and scroll.
  /**
   * Stream containing the latest information on what rows are being displayed on screen.
   * Can be used by the data source to as a heuristic of what data should be provided.
   */
  viewChanged =
      new BehaviorSubject<{start: number, end: number}>({start: 0, end: Number.MAX_VALUE});

  /**
   * Map of all the user's defined columns identified by name.
   * Contains the header and data-cell templates.
   */
  private _columnDefinitionsByName = new Map<string,  CdkColumnDef>();

  // Placeholders within the table's template where the header and data rows will be inserted.
  @ViewChild(RowPlaceholder) _rowPlaceholder: RowPlaceholder;
  @ViewChild(HeaderRowPlaceholder) _headerRowPlaceholder: HeaderRowPlaceholder;

  /**
   * The column definitions provided by the user that contain what the header and cells should
   * render for each column.
   */
  @ContentChildren(CdkColumnDef) _columnDefinitions: QueryList<CdkColumnDef>;

  /** Template used as the header container. */
  @ContentChild(CdkHeaderRowDef) _headerDefinition: CdkHeaderRowDef;

  /** Set of templates that used as the data row containers. */
  @ContentChildren(CdkRowDef) _rowDefinitions: QueryList<CdkRowDef>;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    console.warn('The data table is still in active development ' +
        'and should be considered unstable.');
  }

  ngOnDestroy() {
    // TODO(andrewseguin): Disconnect from the data source so
    // that it can unsubscribe from its streams.
  }

  ngOnInit() {
    // TODO(andrewseguin): Setup a listener for scroll events
    //   and emit the calculated view to this.viewChanged
  }

  ngAfterContentInit() {
    // TODO(andrewseguin): Throw an error if two columns share the same name
    this._columnDefinitions.forEach(columnDef => {
      this._columnDefinitionsByName.set(columnDef.name, columnDef);
    });
  }

  ngAfterViewInit() {
    // TODO(andrewseguin): Re-render the header when the header's columns change.
    this.renderHeaderRow();

    // TODO(andrewseguin): Re-render rows when their list of columns change.
    // TODO(andrewseguin): If the data source is not
    //   present after view init, connect it when it is defined.
    // TODO(andrewseguin): Unsubscribe from this on destroy.
    this.dataSource.connect(this).subscribe((rowsData: any[]) => {
      // TODO(andrewseguin): Add a differ that will check if the data has changed,
      //   rather than re-rendering all rows
      this._rowPlaceholder.viewContainer.clear();
      rowsData.forEach(rowData => this.insertRow(rowData));
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Create the embedded view for the header template and place it in the header row view container.
   */
  renderHeaderRow() {
    const cells = this.getHeaderCellTemplatesForRow(this._headerDefinition);

    // TODO(andrewseguin): add some code to enforce that exactly
    // one CdkCellOutlet was instantiated as a result
    // of `createEmbeddedView`.
    this._headerRowPlaceholder.viewContainer
        .createEmbeddedView(this._headerDefinition.template, {cells});
    CdkCellOutlet.mostRecentCellOutlet.cells = cells;
    CdkCellOutlet.mostRecentCellOutlet.context = {};
  }

  /**
   * Create the embedded view for the data row template and place it in the correct index location
   * within the data row view container.
   */
  insertRow(rowData: any) {
    // TODO(andrewseguin): Add when predicates to the row definitions
    //   to find the right template to used based on
    //   the data rather than choosing the first row definition.
    const row = this._rowDefinitions.first;

    // TODO(andrewseguin): Add more context, such as first/last/isEven/etc
    const context = {$implicit: rowData};

    // TODO(andrewseguin): add some code to enforce that exactly one
    //   CdkCellOutlet was instantiated as a result  of `createEmbeddedView`.
    this._rowPlaceholder.viewContainer.createEmbeddedView(row.template, context);

    // Insert empty cells if there is no data to improve rendering time.
    CdkCellOutlet.mostRecentCellOutlet.cells = rowData ? this.getCellTemplatesForRow(row) : [];
    CdkCellOutlet.mostRecentCellOutlet.context = context;
  }

  /**
   * Returns the cell template definitions to insert into the header
   * as defined by its list of columns to display.
   */
  getHeaderCellTemplatesForRow(headerDef: CdkHeaderRowDef): CdkHeaderCellDef[] {
    return headerDef.columns.map(columnId => {
      return this._columnDefinitionsByName.get(columnId).headerCell;
    });
  }

  /**
   * Returns the cell template definitions to insert in the provided row
   * as defined by its list of columns to display.
   */
  getCellTemplatesForRow(rowDef: CdkRowDef): CdkCellDef[] {
    return rowDef.columns.map(columnId => {
      return this._columnDefinitionsByName.get(columnId).cell;
    });
  }
}
