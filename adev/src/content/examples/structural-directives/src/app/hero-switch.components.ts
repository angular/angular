// #docregion
import {Component, computed, input, Input} from '@angular/core';
import {Hero} from './hero';

@Component({
  selector: 'app-happy-hero',
  template: 'Wow. You like {{hero().name}}. What a happy hero ... just like you.',
})
export class HappyHeroComponent {
  hero = input.required<Hero>();
}

@Component({
  selector: 'app-sad-hero',
  template: 'You like {{hero().name}}? Such a sad hero. Are you sad too?',
})
export class SadHeroComponent {
  hero = input.required<Hero>();
}

@Component({
  selector: 'app-confused-hero',
  template: 'Are you as confused as {{hero().name}}?',
})
export class ConfusedHeroComponent {
  hero = input.required<Hero>();
}

@Component({
  selector: 'app-unknown-hero',
  template: '{{message()}}',
})
export class UnknownHeroComponent {
  hero = input.required<Hero | undefined>();

  message = computed(() => {
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
