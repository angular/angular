import {Hero} from '../hero';

/** return fresh array of test heroes */
export function getTestHeroes(): Hero[] {
  return [
    {id: 41, name: 'Bob'},
    {id: 42, name: 'Carol'},
    {id: 43, name: 'Ted'},
    {id: 44, name: 'Alice'},
    {id: 45, name: 'Speedy'},
    {id: 46, name: 'Stealthy'},
  ];
}
