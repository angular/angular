import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <label><input type="checkbox" [checked]="showHeroes"   (change)="showHeroes=!showHeroes">Heroes</label>
    <label><input type="checkbox" [checked]="showVillains" (change)="showVillains=!showVillains">Villains</label>
    <label><input type="checkbox" [checked]="showCars"     (change)="showCars=!showCars">Cars</label>

    <h1>Hierarchical Dependency Injection</h1>

    <app-heroes-list   *ngIf="showHeroes"></app-heroes-list>
    <app-villains-list *ngIf="showVillains"></app-villains-list>
    <app-cars       *ngIf="showCars"></app-cars>
  `
})
export class AppComponent {
  showCars = true;
  showHeroes = true;
  showVillains = true;
}
