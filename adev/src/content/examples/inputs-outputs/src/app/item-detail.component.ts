// #docplaster
// #docregion use-input
import {Component, Input} from '@angular/core'; // First, import Input
// #enddocregion use-input

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
})

// #docregion use-input
export class ItemDetailComponent {
  @Input() item = ''; // decorate the property with @Input()
}
// #enddocregion use-input
