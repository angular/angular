// #docplaster
// #docregion
// #docregion v1
import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { HeroListComponent }    from './hero-list/hero-list.component';
import { HeroDetailComponent }  from './hero-detail/hero-detail.component';

// #enddocregion v1
import { HeroesRoutingModule } from './heroes-routing.module';

// #docregion v1
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
// #enddocregion v1
    HeroesRoutingModule
// #docregion v1
  ],
  declarations: [
    HeroListComponent,
    HeroDetailComponent
  ]
})
export class HeroesModule {}
// #enddocregion v1
// #enddocregion
