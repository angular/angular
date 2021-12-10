/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DirectivePosition} from 'protocol';

import {DirectivePropertyResolver, DirectiveTreeData} from '../../property-resolver/directive-property-resolver';
import {FlatNode} from '../../property-resolver/element-property-resolver';

@Component({
  selector: 'ng-property-view-body',
  templateUrl: './property-view-body.component.html',
  styleUrls: ['./property-view-body.component.scss'],
})
export class PropertyViewBodyComponent {
  @Input() controller: DirectivePropertyResolver;
  @Input() directiveInputControls: DirectiveTreeData;
  @Input() directiveOutputControls: DirectiveTreeData;
  @Input() directiveStateControls: DirectiveTreeData;

  @Output() inspect = new EventEmitter<{node: FlatNode; directivePosition: DirectivePosition}>();

  categoryOrder = [0, 1, 2];

  get panels(): {
    title: string; hidden: boolean; controls: DirectiveTreeData; documentation: string,
                                                                 class: string
  }[] {
    return [
      {
        title: '@Inputs',
        hidden: this.directiveInputControls.dataSource.data.length === 0,
        controls: this.directiveInputControls,
        documentation: 'https://angular.io/api/core/Input',
        class: 'cy-inputs'
      },
      {
        title: '@Outputs',
        hidden: this.directiveOutputControls.dataSource.data.length === 0,
        controls: this.directiveOutputControls,
        documentation: 'https://angular.io/api/core/Output',
        class: 'cy-outputs'
      },
      {
        title: 'Properties',
        hidden: this.directiveStateControls.dataSource.data.length === 0,
        controls: this.directiveStateControls,
        documentation: 'https://angular.io/guide/property-binding',
        class: 'cy-properties'
      },
    ];
  }

  get controlsLoaded(): boolean {
    return !!this.directiveStateControls && !!this.directiveOutputControls &&
        !!this.directiveInputControls;
  }

  updateValue({node, newValue}: {node: FlatNode; newValue: any}): void {
    this.controller.updateValue(node, newValue);
  }

  drop(event: CdkDragDrop<any, any>): void {
    moveItemInArray(this.categoryOrder, event.previousIndex, event.currentIndex);
  }

  handleInspect(node: FlatNode): void {
    this.inspect.emit({
      node,
      directivePosition: this.controller.directivePosition,
    });
  }
}
