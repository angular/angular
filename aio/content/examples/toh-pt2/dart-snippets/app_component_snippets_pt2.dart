// #docregion ng-for
<li *ngFor="let hero of heroes">
  <span class="badge">{{hero.id}}</span> {{hero.name}}
</li>
// #enddocregion ng-for

// #docregion heroes-styled
<h2>My Heroes</h2>
<ul class="heroes">
  <li *ngFor="let hero of heroes">
    <span class="badge">{{hero.id}}</span> {{hero.name}}
  </li>
</ul>
// #enddocregion heroes-styled

// #docregion selectedHero-click
<li *ngFor="let hero of heroes" (click)="onSelect(hero)">
  <span class="badge">{{hero.id}}</span> {{hero.name}}
</li>
// #enddocregion selectedHero-click

// #docregion selectedHero-details
<h2>{{selectedHero.name}} details!</h2>
<div><label>id: </label>{{selectedHero.id}}</div>
<div>
    <label>name: </label>
    <input [(ngModel)]="selectedHero.name" placeholder="name">
</div>
// #enddocregion selectedHero-details

// #docregion ng-if
<div *ngIf="selectedHero != null">
  <h2>{{selectedHero.name}} details!</h2>
  <div><label>id: </label>{{selectedHero.id}}</div>
  <div>
    <label>name: </label>
    <input [(ngModel)]="selectedHero.name" placeholder="name">
  </div>
</div>
// #enddocregion ng-if

// #docregion hero-array-1
final List<Hero> heroes = mockHeroes;
// #enddocregion hero-array-1

// #docregion heroes-template-1
<h2>My Heroes</h2>
<ul class="heroes">
  <li>
    <!-- each hero goes here -->
  </li>
</ul>
// #enddocregion heroes-template-1

// #docregion heroes-ngfor-1
<li *ngFor="let hero of heroes">
// #enddocregion heroes-ngfor-1

// #docregion class-selected-1
[class.selected]="hero == selectedHero"
// #enddocregion class-selected-1

// #docregion class-selected-2
<li *ngFor="let hero of heroes"
  [class.selected]="hero == selectedHero"
  (click)="onSelect(hero)">
  <span class="badge">{{hero.id}}</span> {{hero.name}}
</li>
// #enddocregion class-selected-2
