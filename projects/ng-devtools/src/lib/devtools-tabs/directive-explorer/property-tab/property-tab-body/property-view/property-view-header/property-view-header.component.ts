import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { PropertyViewFilterOptions } from '../../../../property-resolver/directive-property-resolver';

@Component({
  selector: 'ng-property-view-header',
  templateUrl: './property-view-header.component.html',
  styleUrls: ['./property-view-header.component.css'],
})
export class PropertyViewHeaderComponent {
  @Input() directive: string;
  @Output() filter = new EventEmitter<PropertyViewFilterOptions[]>();
  @Output() copyPropData = new EventEmitter<string>();

  cmpFilterOptions = PropertyViewFilterOptions;

  filterProperties(event: MatButtonToggleChange): void {
    this.filter.emit(event.value);
  }
}
