import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DirectivePropertyResolver } from '../../../property-resolver/directive-property-resolver';
import { FlatNode, PropertyDataSource } from '../../../property-resolver/property-data-source';
import { TreeControl } from '@angular/cdk/tree';
import { ElementPropertyResolver } from '../../../property-resolver/element-property-resolver';

@Component({
  selector: 'ng-property-view',
  templateUrl: './property-view.component.html',
  styleUrls: ['./property-view.component.css'],
})
export class PropertyViewComponent {
  @Input() directive: string;
  @Output() copyPropData = new EventEmitter<string>();

  constructor(private _nestedProps: ElementPropertyResolver) {}

  get controller(): DirectivePropertyResolver {
    return this._nestedProps.getDirectiveController(this.directive);
  }

  get dataSource(): PropertyDataSource {
    return this.controller.getDirectiveControls().dataSource;
  }

  get treeControl(): TreeControl<FlatNode> {
    return this.controller.getDirectiveControls().treeControl;
  }
}
