import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  DirectivePropertyResolver,
  DirectiveTreeData,
  PropertyViewFilterOptions,
} from '../../../property-resolver/directive-property-resolver';
import { PropertyDataSource } from '../../../property-resolver/property-data-source';
import { TreeControl } from '@angular/cdk/tree';
import { ElementPropertyResolver, FlatNode } from '../../../property-resolver/element-property-resolver';

@Component({
  selector: 'ng-property-view',
  templateUrl: './property-view.component.html',
  styleUrls: ['./property-view.component.css'],
})
export class PropertyViewComponent {
  @Input() directive: string;
  @Output() copyPropData = new EventEmitter<string>();

  constructor(private _nestedProps: ElementPropertyResolver) {}

  get controller(): DirectivePropertyResolver | undefined {
    return this._nestedProps.getDirectiveController(this.directive);
  }

  get directiveInputControls(): DirectiveTreeData | void {
    return this.controller?.directiveInputControls;
  }

  get directiveOutputControls(): DirectiveTreeData | void {
    return this.controller?.directiveOutputControls;
  }

  get directiveStateControls(): DirectiveTreeData | void {
    return this.controller?.directiveStateControls;
  }
}
