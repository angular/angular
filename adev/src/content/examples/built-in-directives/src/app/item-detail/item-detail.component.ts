import {Component, input} from '@angular/core';

import {Item} from '../item';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.css'],
})
export class ItemDetailComponent {
  readonly item = input<Item | undefined>();
}
