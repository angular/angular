/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ProfilerFrame} from 'protocol';
import {Subscription} from 'rxjs';

import {Theme, ThemeService} from '../../../../theme-service';
import {BarGraphFormatter, BargraphNode} from '../record-formatter/bargraph-formatter/index';

import {formatDirectiveProfile} from './profile-formatter';
import {SelectedDirective, SelectedEntry} from './timeline-visualizer.component';

@Component({
  selector: 'ng-bargraph-visualizer',
  templateUrl: './bargraph-visualizer.component.html',
  styleUrls: ['./bargraph-visualizer.component.scss'],
})
export class BargraphVisualizerComponent implements OnInit, OnDestroy {
  barColor: string;
  profileRecords: BargraphNode[];

  @Output() nodeSelect = new EventEmitter<SelectedEntry>();

  private _formatter = new BarGraphFormatter();
  private _currentThemeSubscription: Subscription;
  currentTheme: Theme;

  @Input()
  set frame(data: ProfilerFrame) {
    this.profileRecords = this._formatter.formatFrame(data);
  }

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    this._currentThemeSubscription = this.themeService.currentTheme.subscribe((theme) => {
      this.currentTheme = theme;
      this.barColor = theme === 'dark-theme' ? '#073d69' : '#cfe8fc';
    });
  }

  ngOnDestroy(): void {
    this._currentThemeSubscription.unsubscribe();
  }

  formatEntryData(bargraphNode: BargraphNode): SelectedDirective[] {
    return formatDirectiveProfile(bargraphNode.original.directives);
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
