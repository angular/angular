/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export const expanding_row_css = `
  ::ng-deep [cfcExpandingRowHost] {
    display: block;
    margin-bottom: 2;
  }

  :host(cfc-expanding-row),
  :host(cfc-expanding-row-summary),
  :host(cfc-expanding-row-details-caption),
  :host(cfc-expanding-row-details-content) {
    display: block;
  }

  .cfc-expanding-row {
    background: white;
    border-top: 1 solid black;
    box-shadow: 0 1 1 gray;
    transition: margin 1 1;
    will-change: margin;
  }

  .cfc-expanding-row.cfc-expanding-row-is-expanded {
    margin: 1 (-1);
  }

  .cfc-expanding-row:focus {
    outline: none;
  }

  .cfc-expanding-row-summary {

    display: flex;
    border-left: 6 solid transparent;
    cursor: pointer;
    padding: 6 2;

  }

  .cfc-expanding-row-summary:focus {
    outline: none;
    border-left-color: $cfc-color-active;
  }

  // Adjust icons to be positioned correctly in the row.
  .cfc-expanding-row-summary::ng-deep cfc-icon {
    margin-top: 3;
  }

  .cfc-expanding-row-details-caption {
    display: flex;
    cursor: pointer;
    padding: 4 2;

  }

  .cfc-expanding-row-details-caption::ng-deep a,
  .cfc-expanding-row-details-caption::ng-deep a:visited,
  .cfc-expanding-row-details-caption::ng-deep a .cfc-external-link-content {
    border-color: $cfc-color-text-primary-inverse;
    color: $cfc-color-text-primary-inverse;
  }

  // Adjust icons to be positioned correctly in the row.
  ::ng-deep cfc-icon {
    margin-top: 3;
  }

  .cfc-expanding-row-details-content {
    padding: 2;
  }

  .cfc-expanding-row-details-content::ng-deep .ace-kv-list.cfc-full-bleed {
    width: 200px;
  }


  .cfc-expanding-row-accessibility-text {
    display: none;
  }`;
