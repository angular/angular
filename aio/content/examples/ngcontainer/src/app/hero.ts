// #docregion
export class Hero {
  id: number;
  name: string;
  emotion?: string;
}

export const heroes: Hero[] = [
  { id: 1, name: 'Mr. Nice', emotion: 'happy' },
  { id: 2, name: 'Narco', emotion: 'sad' },
  { id: 3, name: 'Windstorm', emotion: 'confused' },
  { id: 4, name: 'Magneta' }
];
