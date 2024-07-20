import {Component, Input} from '@angular/core';
import {Item} from './item';

@Component({
  standalone: true,
  selector: 'app-stout-item',
  template: "I'm a little {{item.name}}, short and stout!",
})

// #docregion input
export class StoutItemComponent {
  @Input() item!: Item;
}
// #enddocregion input

@Component({
  standalone: true,
  selector: 'app-best-item',
  template: 'This is the brightest {{item.name}} in town.',
})
export class BestItemComponent {
  @Input() item!: Item;
}

@Component({
  standalone: true,
  selector: 'app-device-item',
  template: 'Which is the slimmest {{item.name}}?',
})
export class DeviceItemComponent {
  @Input() item!: Item;
}

@Component({
  standalone: true,
  selector: 'app-lost-item',
  template: 'Has anyone seen my {{item.name}}?',
})
export class LostItemComponent {
  @Input() item!: Item;
}

@Component({
  standalone: true,
  selector: 'app-unknown-item',
  template: '{{message}}',
})
export class UnknownItemComponent {
  @Input() item!: Item;
  get message() {
    return this.item && this.item.name
      ? `${this.item.name} is strange and mysterious.`
      : 'A mystery wrapped in a fishbowl.';
  }
}

export const ItemSwitchComponents = [
  StoutItemComponent,
  BestItemComponent,
  DeviceItemComponent,
  LostItemComponent,
  UnknownItemComponent,
];
