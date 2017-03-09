import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MdSelectChange} from '@angular/material';

@Component({
    moduleId: module.id,
    selector: 'select-demo',
    templateUrl: 'select-demo.html',
    styleUrls: ['select-demo.css'],
})
export class SelectDemo {
  drinksRequired = false;
  pokemonRequired = false;
  drinksDisabled = false;
  pokemonDisabled = false;
  showSelect = false;
  currentDrink: string;
  currentPokemon: string[];
  latestChangeEvent: MdSelectChange;
  floatPlaceholder: string = 'auto';
  foodControl = new FormControl('pizza-1');

  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];

  drinks = [
    {value: 'coke-0', viewValue: 'Coke'},
    {value: 'long-name-1', viewValue: 'Decaf Chocolate Brownie Vanilla Gingerbread Frappuccino'},
    {value: 'water-2', viewValue: 'Water'},
    {value: 'pepper-3', viewValue: 'Dr. Pepper'},
    {value: 'coffee-4', viewValue: 'Coffee'},
    {value: 'tea-5', viewValue: 'Tea'},
    {value: 'juice-6', viewValue: 'Orange juice'},
    {value: 'wine-7', viewValue: 'Wine'},
    {value: 'milk-8', viewValue: 'Milk'},
  ];

  pokemon = [
    {value: 'bulbasaur-0', viewValue: 'Bulbasaur'},
    {value: 'charizard-1', viewValue: 'Charizard'},
    {value: 'squirtle-2', viewValue: 'Squirtle'},
    {value: 'pikachu-3', viewValue: 'Pikachu'},
    {value: 'eevee-4', viewValue: 'Eevee'},
    {value: 'ditto-5', viewValue: 'Ditto'},
    {value: 'psyduck-6', viewValue: 'Psyduck'},
  ];

  toggleDisabled() {
    this.foodControl.enabled ? this.foodControl.disable() : this.foodControl.enable();
  }

  setPokemonValue() {
    this.currentPokemon = ['eevee-4', 'psyduck-6'];
  }
}
