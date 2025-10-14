/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {moveItemInArray, CdkDropList, CdkDrag} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  ɵFramework as Framework,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {PropertyViewTreeComponent} from './property-view-tree/property-view-tree.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {DependencyViewerComponent} from './dependency-viewer/dependency-viewer.component';
import {DocsRefButtonComponent} from '../../../../../shared/docs-ref-button/docs-ref-button.component';
let PropertyViewBodyComponent = class PropertyViewBodyComponent {
  constructor() {
    this.controller = input.required();
    this.directiveInputControls = input.required();
    this.directivePropControls = input.required();
    this.directiveOutputControls = input.required();
    this.directiveStateControls = input.required();
    this.inspect = output();
    this.showSignalGraph = output();
    this.dependencies = computed(() => {
      const metadata = this.controller().directiveMetadata;
      if (!metadata) return [];
      if (!('dependencies' in metadata)) return [];
      return metadata.dependencies;
    });
    this.panels = signal([
      {
        title: () => 'Inputs',
        controls: () => this.directiveInputControls(),
      },
      {
        title: () => 'Props',
        controls: () => this.directivePropControls(),
      },
      {
        title: () => 'Outputs',
        controls: () => this.directiveOutputControls(),
      },
      {
        title: () =>
          this.controller().directiveMetadata?.framework === Framework.Wiz ? 'State' : 'Properties',
        controls: () => this.directiveStateControls(),
      },
    ]);
    this.controlsLoaded = computed(() => {
      return (
        !!this.directiveStateControls() &&
        !!this.directiveOutputControls() &&
        !!this.directiveInputControls()
      );
    });
  }
  updateValue({node, newValue}) {
    this.controller().updateValue(node, newValue);
  }
  drop(event) {
    const panels = this.panels();
    moveItemInArray(panels, event.previousIndex, event.currentIndex);
    this.panels.set(Array.from(panels)); // Clone array for immutable update.
  }
  handleInspect(node) {
    this.inspect.emit({
      node,
      directivePosition: this.controller().directivePosition,
    });
  }
};
PropertyViewBodyComponent = __decorate(
  [
    Component({
      selector: 'ng-property-view-body',
      templateUrl: './property-view-body.component.html',
      styleUrls: ['./property-view-body.component.scss'],
      imports: [
        MatExpansionModule,
        CdkDropList,
        CdkDrag,
        PropertyViewTreeComponent,
        DocsRefButtonComponent,
        DependencyViewerComponent,
      ],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  PropertyViewBodyComponent,
);
export {PropertyViewBodyComponent};
//# sourceMappingURL=property-view-body.component.js.map
