import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {CdkCellDef} from './cell';

/**
 * Header row definition for the CDK data-table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
@Directive({selector: '[cdkHeaderRowDef]'})
export class CdkHeaderRowDef {
  @Input('cdkHeaderRowDef') columns: string[];

  constructor(public template: TemplateRef<any>) { }
}

/**
 * Data row definition for the CDK data-table.
 * Captures the header row's template and other row properties such as the columns to display.
 */
@Directive({selector: '[cdkRowDef]'})
export class CdkRowDef {
  @Input('cdkRowDefColumns') columns: string[];

  // TODO(andrewseguin): Add an input for providing a switch function to determine
  //   if this template should be used.

  constructor(public template: TemplateRef<any>) { }
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
