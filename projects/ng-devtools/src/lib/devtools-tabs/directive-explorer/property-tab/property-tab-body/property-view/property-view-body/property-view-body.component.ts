import { Component, Input } from '@angular/core';
import {
  DirectivePropertyResolver,
  DirectiveTreeData,
} from '../../../../property-resolver/directive-property-resolver';
import { FlatNode } from '../../../../property-resolver/element-property-resolver';

@Component({
  selector: 'ng-property-view-body',
  templateUrl: './property-view-body.component.html',
  styleUrls: ['./property-view-body.component.css'],
})
export class PropertyViewBodyComponent {
  @Input() controller: DirectivePropertyResolver;
  @Input() directiveInputControls: DirectiveTreeData;
  @Input() directiveOutputControls: DirectiveTreeData;
  @Input() directiveStateControls: DirectiveTreeData;

  updateValue({ node, newValue }: { newValue: any; node: FlatNode }): void {
    this.controller.updateValue(node, newValue);
  }
}
