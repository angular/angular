/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  templateUrl: 'table-demo.html',
})
export class TableDemo {
  examples = [
    'table-basic',
    'table-basic-flex',
    'cdk-table-basic',
    'cdk-table-basic-flex',
    'table-dynamic-columns',
    'table-filtering',
    'table-footer-row',
    'table-http',
    'table-overview',
    'table-pagination',
    'table-row-context',
    'table-selection',
    'table-sorting',
    'table-expandable-rows',
    'table-sticky-header',
    'table-sticky-columns',
    'table-sticky-footer',
    'table-sticky-complex',
    'table-sticky-complex-flex',
  ];
}
