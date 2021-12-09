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
