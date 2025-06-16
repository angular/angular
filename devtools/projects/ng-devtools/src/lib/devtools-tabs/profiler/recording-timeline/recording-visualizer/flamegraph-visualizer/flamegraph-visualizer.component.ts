/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {NgxFlamegraphModule} from 'ngx-flamegraph';
import {Color, RawData} from 'ngx-flamegraph/lib/utils';
import {ProfilerFrame} from '../../../../../../../../protocol';

import {ThemeService} from '../../../../../application-services/theme_service';
import {
  FlamegraphFormatter,
  FlamegraphNode,
  ROOT_LEVEL_ELEMENT_LABEL,
} from '../../record-formatter/flamegraph-formatter/flamegraph-formatter';

import {formatDirectiveProfile} from '../profile-formatter/profile-formatter';
import {SelectedDirective, SelectedEntry} from '../recording-visualizer-types';

@Component({
  selector: 'ng-flamegraph-visualizer',
  templateUrl: './flamegraph-visualizer.component.html',
  styleUrls: ['./flamegraph-visualizer.component.scss'],
  imports: [NgxFlamegraphModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlamegraphVisualizerComponent {
  public themeService = inject(ThemeService);
  readonly profilerBars = computed(() => {
    return [
      this._formatter.formatFrame(
        this.frame(),
        this.changeDetection(),
        this.themeService.currentTheme(),
      ),
    ];
  });
  view: [number, number] = [235, 200];

  private readonly _formatter = new FlamegraphFormatter();
  readonly colors = computed<Color>(() => {
    return this.themeService.currentTheme() === 'dark-theme'
      ? {
          hue: [210, 90],
          saturation: [90, 90],
          lightness: [25, 25],
        }
      : {
          hue: [50, 15],
          saturation: [100, 100],
          lightness: [75, 75],
        };
  });

  readonly nodeSelect = output<SelectedEntry>();

  readonly frame = input.required<ProfilerFrame>();

  readonly changeDetection = input.required<boolean>();

  selectFrame(frame: RawData): void {
    if (frame.label === ROOT_LEVEL_ELEMENT_LABEL) {
      return;
    }

    const flameGraphNode = frame as FlamegraphNode;
    const directiveData = this.formatEntryData(flameGraphNode);

    this.nodeSelect.emit({
      entry: flameGraphNode,
      selectedDirectives: directiveData,
    });
  }

  formatEntryData(flameGraphNode: FlamegraphNode): SelectedDirective[] {
    return formatDirectiveProfile(flameGraphNode.original.directives);
  }
}
