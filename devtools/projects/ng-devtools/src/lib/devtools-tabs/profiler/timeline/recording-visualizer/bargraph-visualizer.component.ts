/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {ProfilerFrame} from '../../../../../../../protocol';

import {ThemeService} from '../../../../application-services/theme_service';
import {BarGraphFormatter, BargraphNode} from '../record-formatter/bargraph-formatter/index';

import {formatDirectiveProfile} from './profile-formatter';
import {SelectedDirective, SelectedEntry} from './timeline-visualizer.component';
import {BarChartComponent} from './bar-chart.component';

@Component({
  selector: 'ng-bargraph-visualizer',
  templateUrl: './bargraph-visualizer.component.html',
  styleUrls: ['./bargraph-visualizer.component.scss'],
  imports: [BarChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BargraphVisualizerComponent {
  public themeService = inject(ThemeService);
  readonly barColor = computed(() => {
    return this.themeService.currentTheme() === 'dark-theme' ? '#073d69' : '#cfe8fc';
  });

  readonly nodeSelect = output<SelectedEntry>();

  private readonly _formatter = new BarGraphFormatter();
  frame = input.required<ProfilerFrame>();

  profileRecords = computed(() => this._formatter.formatFrame(this.frame()));

  formatEntryData(bargraphNode: BargraphNode): SelectedDirective[] {
    return formatDirectiveProfile(bargraphNode.directives ?? []);
  }

  selectNode(node: BargraphNode): void {
    this.nodeSelect.emit({
      entry: node,
      parentHierarchy: node.parents.map((element) => {
        return {name: element.directives[0].name};
      }),
      selectedDirectives: this.formatEntryData(node),
    });
  }
}
