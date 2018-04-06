/* tslint:disable component-selector */
import {Component, Input} from '@angular/core';

/** Custom element wrapper for the material expansion panel with a title input. */
@Component({
  selector: 'aio-expandable-section',
  templateUrl: 'expandable-section.component.html',
})
export class ExpandableSectionComponent {
  @Input() title;
}
