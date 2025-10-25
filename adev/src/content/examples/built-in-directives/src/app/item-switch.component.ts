import {Component, computed, input} from '@angular/core';
import {Item} from './item';

@Component({
  selector: 'app-stout-item',
  template: "I'm a little {{item().name}}, short and stout!",
})

// #docregion input
export class StoutItemComponent {
  item = input.required<Item>();
}
// #enddocregion input

@Component({
  selector: 'app-best-item',
  template: 'This is the brightest {{item().name}} in town.',
})
export class BestItemComponent {
  item = input.required<Item>();
}

@Component({
  selector: 'app-device-item',
  template: 'Which is the slimmest {{item().name}}?',
})
export class DeviceItemComponent {
  item = input.required<Item>();
}

@Component({
  selector: 'app-lost-item',
  template: 'Has anyone seen my {{item().name}}?',
})
export class LostItemComponent {
  item = input.required<Item>();
}

@Component({
  selector: 'app-unknown-item',
  template: '{{message()}}',
})
export class UnknownItemComponent {
  readonly item = input<Item | undefined>(undefined);
  readonly message = computed(() => {
    const itemName = this.item()?.name;
    return itemName ? `${itemName} is strange and mysterious.` : 'A mystery wrapped in a fishbowl.';
  });
}

export const ItemSwitchComponents = [
  StoutItemComponent,
  BestItemComponent,
  DeviceItemComponent,
  LostItemComponent,
  UnknownItemComponent,
];
