/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, input, output, ChangeDetectionStrategy} from '@angular/core';
import {ButtonComponent} from '../../shared/button/button.component';

export type RowType = 'text' | 'chip' | 'flag' | 'list';

@Component({
  selector: '[ng-route-details-row]',
  templateUrl: './route-details-row.component.html',
  styleUrls: ['./route-details-row.component.scss'],
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteDetailsRowComponent {
  readonly label = input.required<string>();
  readonly data = input<string | boolean | string[]>();
  readonly type = input<RowType>('text');

  readonly btnClick = output<string>();

  readonly dataArray = computed(() => {
    return this.data() as string[];
  });

  // Lazy and redirecting routes do not have a component associated with them.
  // We need to disable the button click event for these routes.
  readonly isRouteWithoutComponent = computed(
    () =>
      this.data()?.toString().includes('Lazy') || this.data()?.toString().includes('redirecting'),
  );
}
