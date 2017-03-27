// #docregion
import { Hero } from './hero';

describe('Hero', () => {
  it('has name', () => {
    const hero = new Hero(1, 'Super Cat');
    expect(hero.name).toBe('Super Cat');
  });

  it('has id', () => {
    const hero = new Hero(1, 'Super Cat');
    expect(hero.id).toBe(1);
  });

  it('can clone itself', () => {
    const hero = new Hero(1, 'Super Cat');
    const clone = hero.clone();
    expect(hero).toEqual(clone);
  });
});
