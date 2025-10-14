/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {NgxFlamegraphModule} from 'ngx-flamegraph';
import {ThemeService} from '../../../../../application-services/theme_service';
import {
  FlamegraphFormatter,
  ROOT_LEVEL_ELEMENT_LABEL,
} from '../../record-formatter/flamegraph-formatter/flamegraph-formatter';
import {formatDirectiveProfile} from '../profile-formatter/profile-formatter';
let FlamegraphVisualizerComponent = class FlamegraphVisualizerComponent {
  constructor() {
    this.themeService = inject(ThemeService);
    this.profilerBars = computed(() => {
      return [
        this._formatter.formatFrame(
          this.frame(),
          this.changeDetection(),
          this.themeService.currentTheme(),
        ),
      ];
    });
    this.view = [235, 200];
    this._formatter = new FlamegraphFormatter();
    this.colors = computed(() => {
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
    this.nodeSelect = output();
    this.frame = input.required();
    this.changeDetection = input.required();
  }
  selectFrame(frame) {
    if (frame.label === ROOT_LEVEL_ELEMENT_LABEL) {
      return;
    }
    const flameGraphNode = frame;
    const directiveData = this.formatEntryData(flameGraphNode);
    this.nodeSelect.emit({
      entry: flameGraphNode,
      selectedDirectives: directiveData,
    });
  }
  formatEntryData(flameGraphNode) {
    return formatDirectiveProfile(flameGraphNode.original.directives);
  }
};
FlamegraphVisualizerComponent = __decorate(
  [
    Component({
      selector: 'ng-flamegraph-visualizer',
      templateUrl: './flamegraph-visualizer.component.html',
      styleUrls: ['./flamegraph-visualizer.component.scss'],
      imports: [NgxFlamegraphModule],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  FlamegraphVisualizerComponent,
);
export {FlamegraphVisualizerComponent};
//# sourceMappingURL=flamegraph-visualizer.component.js.map
