// #docplaster
// #docregion animation-const, trigger-const
import { animation, style, animate, trigger, transition, useAnimation } from '@angular/animations';
// #enddocregion trigger-const

export const transitionAnimation = animation([
  style({
    height: '{{ height }}',
    opacity: '{{ opacity }}',
    backgroundColor: '{{ backgroundColor }}'
  }),
  animate('{{ time }}')
]);
// #enddocregion animation-const

// #docregion trigger-const
export const triggerAnimation = trigger('openClose', [
  transition('open => closed', [
    useAnimation(transitionAnimation, {
      params: {
        height: 0,
        opacity: 1,
        backgroundColor: 'red',
        time: '1s'
      }
    })
  ])
]);
// #enddocregion trigger-const
