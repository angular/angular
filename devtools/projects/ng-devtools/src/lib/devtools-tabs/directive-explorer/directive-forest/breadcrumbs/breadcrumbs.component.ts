/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {afterRenderEffect, Component, input, output, untracked, viewChild} from '@angular/core';

import {FlatNode} from '../component-data-source';
import {HorizontalScrollerComponent} from '../../../../shared/horizontal-scroller/horizontal-scroller.component';

@Component({
  selector: 'ng-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  imports: [HorizontalScrollerComponent],
})
export class BreadcrumbsComponent {
  protected readonly scoller = viewChild<HorizontalScrollerComponent>('scroller');

  protected readonly parents = input.required<FlatNode[]>();
  protected readonly handleSelect = output<FlatNode>();
  protected readonly mouseOverNode = output<FlatNode>();
  protected readonly mouseLeaveNode = output<FlatNode>();

  constructor() {
    afterRenderEffect({
      read: () => {
        // We use the parents as a dependency to trigger a layout
        // update that would show the navigation buttons.
        this.parents();
        untracked(() => this.scoller()?.updateScrollButtonVisibility());
      },
    });
  }
}
