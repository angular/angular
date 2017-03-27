import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <label><input type="checkbox" [checked]="showHeroes"   (change)="showHeroes=!showHeroes">Heroes</label>
    <label><input type="checkbox" [checked]="showVillains" (change)="showVillains=!showVillains">Villains</label>
    <label><input type="checkbox" [checked]="showCars"     (change)="showCars=!showCars">Cars</label>

    <h1>Hierarchical Dependency Injection</h1>

    <heroes-list   *ngIf="showHeroes"></heroes-list>
    <villains-list *ngIf="showVillains"></villains-list>
    <my-cars       *ngIf="showCars"></my-cars>
  `
})
export class AppComponent {
  showCars = true;
  showHeroes = true;
  showVillains = true;
}
