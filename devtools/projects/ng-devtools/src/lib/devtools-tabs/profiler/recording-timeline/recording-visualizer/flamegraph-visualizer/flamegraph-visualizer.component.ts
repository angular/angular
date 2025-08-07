/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {NgxFlamegraphModule, FlamegraphColor, RawData} from 'ngx-flamegraph';
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
  readonly colors = computed<FlamegraphColor>(() => {
    // Represent `dynamic-blue-02` and `dynamic-green-01`
    return this.themeService.currentTheme() === 'dark'
      ? {
          hue: [211, 123],
          saturation: [100, 31],
          lightness: [65, 49],
        }
      : {
          hue: [214, 125],
          saturation: [85, 37],
          lightness: [50, 41],
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
