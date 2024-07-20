/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ProfilerFrame} from 'protocol';

import {Theme, ThemeService} from '../../../../theme-service';
import {BarGraphFormatter, BargraphNode} from '../record-formatter/bargraph-formatter/index';

import {formatDirectiveProfile} from './profile-formatter';
import {SelectedDirective, SelectedEntry} from './timeline-visualizer.component';
import {BarChartComponent} from './bar-chart.component';

@Component({
  selector: 'ng-bargraph-visualizer',
  templateUrl: './bargraph-visualizer.component.html',
  styleUrls: ['./bargraph-visualizer.component.scss'],
  standalone: true,
  imports: [BarChartComponent],
})
export class BargraphVisualizerComponent {
  barColor!: string;
  profileRecords!: BargraphNode[];

  @Output() nodeSelect = new EventEmitter<SelectedEntry>();

  private _formatter = new BarGraphFormatter();

  @Input()
  set frame(data: ProfilerFrame) {
    this.profileRecords = this._formatter.formatFrame(data);
  }

  constructor(public themeService: ThemeService) {
    this.themeService.currentTheme.pipe(takeUntilDestroyed()).subscribe((theme) => {
      this.barColor = theme === 'dark-theme' ? '#073d69' : '#cfe8fc';
    });
  }

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
