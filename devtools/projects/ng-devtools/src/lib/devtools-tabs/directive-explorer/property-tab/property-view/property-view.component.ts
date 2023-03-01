/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DirectivePosition} from 'protocol';

import {DirectivePropertyResolver, DirectiveTreeData} from '../../property-resolver/directive-property-resolver';
import {ElementPropertyResolver, FlatNode} from '../../property-resolver/element-property-resolver';

@Component({
  selector: 'ng-property-view',
  templateUrl: './property-view.component.html',
  styleUrls: ['./property-view.component.scss'],
})
export class PropertyViewComponent {
  @Input() directive: string;
  @Output() inspect = new EventEmitter<{node: FlatNode; directivePosition: DirectivePosition}>();
  @Output() viewSource = new EventEmitter<void>();

  constructor(private _nestedProps: ElementPropertyResolver) {}

  get controller(): DirectivePropertyResolver|undefined {
    return this._nestedProps.getDirectiveController(this.directive);
  }

  get directiveInputControls(): DirectiveTreeData|void {
    return this.controller?.directiveInputControls;
  }

  get directiveOutputControls(): DirectiveTreeData|void {
    return this.controller?.directiveOutputControls;
  }

  get directiveStateControls(): DirectiveTreeData|void {
    return this.controller?.directiveStateControls;
  }
}
