import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  DirectivePropertyResolver,
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

  currentFilter: PropertyViewFilterOptions[] = [
    PropertyViewFilterOptions.INPUTS,
    PropertyViewFilterOptions.OUTPUTS,
    PropertyViewFilterOptions.STATE,
  ];
  allowedList: string[] | null = null;

  constructor(private _nestedProps: ElementPropertyResolver) {}

  get controller(): DirectivePropertyResolver | undefined {
    return this._nestedProps.getDirectiveController(this.directive);
  }

  get dataSource(): PropertyDataSource | void {
    if (!this.controller) {
      return;
    }
    return this.controller.getDirectiveControls().dataSource;
  }

  get treeControl(): TreeControl<FlatNode> | void {
    if (!this.controller) {
      return;
    }
    return this.controller.getDirectiveControls().treeControl;
  }

  filter(evt: PropertyViewFilterOptions[]): void {
    this.currentFilter = evt;
    this.computeAllowedList();
  }

  computeAllowedList(): void {
    if (!this.controller || !this.controller.directiveProperties) {
      return;
    }
    const inputList = this.controller.directiveInputs;
    const outputList = this.controller.directiveOutputs;
    const stateList = Object.keys(this.controller.directiveProperties).filter(
      prop => !inputList.includes(prop) && !outputList.includes(prop)
    );
    const propList = {
      [PropertyViewFilterOptions.INPUTS]: inputList,
      [PropertyViewFilterOptions.OUTPUTS]: outputList,
      [PropertyViewFilterOptions.STATE]: stateList,
    };

    this.allowedList = [].concat.apply(
      [],
      this.currentFilter.map(filterOption => propList[filterOption])
    );
  }
}
