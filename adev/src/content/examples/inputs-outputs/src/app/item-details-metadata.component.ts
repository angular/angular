// #docplaster
// #docregion use-input-metadata-required
import {Component, Input} from '@angular/core'; // First, import Input
// #enddocregion use-input-metadata-required
// #docregion use-input-metadata-boolean-transform
import {booleanAttribute} from '@angular/core'; // First, import booleanAttribute
// #enddocregion use-input-metadata-boolean-transform
@Component({
  selector: 'app-item-detail-metadata',
  template: `
  <h2>Child component with &commat;Input() metadata configurations</h2>

  <p>
    Today's item: {{item}}
    Item's Availability: {{itemAvailability}}
  </p>
  `,
})
export class ItemDetailMetadataComponent {
  // #docregion use-input-metadata-required
  @Input({required: true}) item!: string; // Second, decorate the property with required metadata
  // #enddocregion use-input-metadata-required

  // #docregion use-input-metadata-boolean-transform
  @Input({transform: booleanAttribute}) itemAvailability!: boolean; // Second, decorate the property with transform
  // #enddocregion use-input-metadata-boolean-transform
}
