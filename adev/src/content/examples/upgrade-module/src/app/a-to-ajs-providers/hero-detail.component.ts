import { Heroes } from './heroes';

// #docregion
export const heroDetailComponent = {
  template: `
    <h2>{{$ctrl.hero.id}}: {{$ctrl.hero.name}}</h2>
  `,
  controller: ['heroes', function(heroes: Heroes) {
    this.hero = heroes.get()[0];
  }]
};
