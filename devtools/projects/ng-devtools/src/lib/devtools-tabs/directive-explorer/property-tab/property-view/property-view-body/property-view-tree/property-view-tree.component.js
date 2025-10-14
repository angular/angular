/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, inject, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {PropertyEditorComponent} from './property-editor/property-editor.component';
import {PropertyPreviewComponent} from './property-preview/property-preview.component';
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding} from '@angular/material/tree';
import {SUPPORTED_APIS} from '../../../../../../application-providers/supported_apis';
import {SignalGraphManager} from '../../../../signal-graph/signal-graph-manager';
import {Settings} from '../../../../../../application-services/settings';
let PropertyViewTreeComponent = class PropertyViewTreeComponent {
  constructor() {
    this.supportedApis = inject(SUPPORTED_APIS);
    this.signalGraph = inject(SignalGraphManager);
    this.settings = inject(Settings);
    this.dataSource = input.required();
    this.treeControl = input.required();
    this.updateValue = output();
    this.inspect = output();
    this.showSignalGraph = output();
    this.signalGraphEnabled = this.settings.signalGraphEnabled;
    this.hasChild = (_, node) => node.expandable;
  }
  toggle(node) {
    if (this.treeControl().isExpanded(node)) {
      this.treeControl().collapse(node);
      return;
    }
    this.expand(node);
  }
  expand(node) {
    const {prop} = node;
    if (!prop.descriptor.expandable) {
      return;
    }
    this.treeControl().expand(node);
  }
  handleUpdate(node, newValue) {
    this.updateValue.emit({
      node,
      newValue,
    });
  }
  getSignalNode(node) {
    if (node.prop.descriptor.containerType?.includes('Signal')) {
      return this.signalGraph.graph()?.nodes.find((sn) => sn.label === node.prop.name) ?? null;
    }
    return null;
  }
  showGraph(event, node) {
    event.stopPropagation();
    this.showSignalGraph.emit(node);
  }
};
PropertyViewTreeComponent = __decorate(
  [
    Component({
      selector: 'ng-property-view-tree',
      templateUrl: './property-view-tree.component.html',
      styleUrls: ['./property-view-tree.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [
        CommonModule,
        MatTree,
        MatTreeNode,
        MatTreeNodeDef,
        MatTreeNodePadding,
        PropertyPreviewComponent,
        PropertyEditorComponent,
        MatIcon,
        MatTooltip,
      ],
    }),
  ],
  PropertyViewTreeComponent,
);
export {PropertyViewTreeComponent};
//# sourceMappingURL=property-view-tree.component.js.map
