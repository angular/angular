// #docregion
import {Component, computed, input} from '@angular/core';
import {Hero} from './hero';

@Component({
  selector: 'app-happy-hero',
  template: 'Wow. You like {{hero().name}}. What a happy hero ... just like you.',
})
export class HappyHeroComponent {
  readonly hero = input.required<Hero>();
}

@Component({
  selector: 'app-sad-hero',
  template: 'You like {{hero().name}}? Such a sad hero. Are you sad too?',
})
export class SadHeroComponent {
  readonly hero = input.required<Hero>();
}

@Component({
  selector: 'app-confused-hero',
  template: 'Are you as confused as {{hero().name}}?',
})
export class ConfusedHeroComponent {
  readonly hero = input.required<Hero>();
}

@Component({
  selector: 'app-unknown-hero',
  template: '{{message()}}',
})
export class UnknownHeroComponent {
  readonly hero = input.required<Hero | undefined>();

  readonly message = computed(() => {
    const heroName = this.hero()?.name;
    return heroName ? `${heroName} is strange and mysterious.` : 'Are you feeling indecisive?';
  });
}

export const heroSwitchComponents = [
  HappyHeroComponent,
  SadHeroComponent,
  ConfusedHeroComponent,
  UnknownHeroComponent,
];
