export interface Hero {
  name: string;
  canFly: boolean;
}
export const HEROES: Hero[] =  [
  {name: 'Windstorm', canFly: true},
  {name: 'Bombasto',  canFly: false},
  {name: 'Magneto',   canFly: false},
  {name: 'Tornado',   canFly: true}
];
