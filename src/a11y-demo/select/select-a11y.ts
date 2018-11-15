/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'select-a11y',
  templateUrl: 'select-a11y.html',
  styleUrls: ['select-a11y.css'],
})
export class SelectAccessibilityDemo {
  selectedColor: string;
  selectedTopping: string[];
  selectedPokemon: string;

  colors = [
    {value: 'red', label: 'Red'},
    {value: 'green', label: 'Green'},
    {value: 'blue', label: 'Blue'},
    {value: 'cyan', label: 'Cyan'},
    {value: 'magenta', label: 'Magenta'},
    {value: 'yellow', label: 'Yellow'},
    {value: 'black', label: 'Black'},
  ];

  toppings = [
    {value: 'pepperoni', label: 'Pepperoni'},
    {value: 'mushrooms', label: 'Mushrooms'},
    {value: 'onions', label: 'Onions'},
    {value: 'sausage', label: 'Sausage'},
    {value: 'bacon', label: 'Bacon'},
    {value: 'cheese', label: 'Cheese'},
    {value: 'olives', label: 'Olives'},
    {value: 'peppers', label: 'Peppers'},
    {value: 'pineapple', label: 'Pineapple'},
    {value: 'spinach', label: 'Spinach'},
  ];

  pokemon = [
    {
      label: 'Grass',
      pokemon: [
        {value: 'bulbasaur', label: 'Bulbasaur'},
        {value: 'oddish', label: 'Oddish'},
        {value: 'bellsprout', label: 'Bellsprout'}
      ]
    },
    {
      label: 'Water',
      pokemon: [
        {value: 'squirtle', label: 'Squirtle'},
        {value: 'psyduck', label: 'Psyduck'},
        {value: 'horsea', label: 'Horsea'}
      ]
    },
    {
      label: 'Fire',
      disabled: true,
      pokemon: [
        {value: 'charmander', label: 'Charmander'},
        {value: 'vulpix', label: 'Vulpix'},
        {value: 'flareon', label: 'Flareon'}
      ]
    },
    {
      label: 'Psychic',
      pokemon: [
        {value: 'mew', label: 'Mew'},
        {value: 'mewtwo', label: 'Mewtwo'}
      ]
    }
  ];
}
