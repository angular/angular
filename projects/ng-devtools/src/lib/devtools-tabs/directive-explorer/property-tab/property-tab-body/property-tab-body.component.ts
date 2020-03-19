import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IndexedNode } from '../../directive-forest/index-forest';
import { ElementPropertyResolver } from '../../property-resolver/element-property-resolver';
import { DirectivePropertyResolver } from '../../property-resolver/directive-property-resolver';
import { PropertyDataSource, FlatNode } from '../../property-resolver/property-data-source';
import { TreeControl } from '@angular/cdk/tree';

@Component({
  templateUrl: './property-tab-body.component.html',
  selector: 'ng-property-tab-body',
  styleUrls: ['./property-tab-body.component.css'],
})
export class PropertyTabBodyComponent {
  @Input() currentSelectedElement: IndexedNode | null;
  @Output() copyPropData = new EventEmitter<string>();

  constructor(private _nestedProps: ElementPropertyResolver) {}

  nameTracking(_: number, item: { key: string }): string {
    return item.key;
  }

  getCurrentDirectives(): string[] {
    if (!this.currentSelectedElement) {
      return;
    }
    const directives = this.currentSelectedElement.directives.map(d => d.name);
    if (this.currentSelectedElement.component) {
      directives.push(this.currentSelectedElement.component.name);
    }
    return directives;
  }

  getController(directive: string): DirectivePropertyResolver {
    return this._nestedProps.getDirectiveController(directive);
  }

  getDataSource(directive: string): PropertyDataSource {
    return this.getController(directive).getDirectiveControls().dataSource;
  }

  getTreeControl(directive: string): TreeControl<FlatNode> {
    return this.getController(directive).getDirectiveControls().treeControl;
  }
}
