
/// Dummy modules to satisfy Angular Language Service
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

////////

import { HeroListComponent as HeroListComponent1 } from './hero-list.component.1';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ HeroListComponent1 ],
  exports: [ HeroListComponent1 ]
})
export class DummyModule1 {}

/////////

import { HeroListComponent as HeroListComponent2 } from './hero-list.component.2';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ HeroListComponent2 ]
})
export class DummyModule2 {}

/////////

import { HeroesComponent as HeroesComponent1 } from './heroes.component.1';

@NgModule({
  imports: [ CommonModule, DummyModule1 ],
  declarations: [ HeroesComponent1 ]
})
export class DummyModule3 {}
