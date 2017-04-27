import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeroListComponent }    from './hero-list.component';
import { HeroCounterComponent } from './hero-counter.component';
import { HeroDetailComponent }  from './hero-detail.component';

const appRoutes: Routes = [
  { path: 'hero/counter', component: HeroCounterComponent },
  { path: 'hero/:id', component: HeroDetailComponent },
  { path: 'heroes', component: HeroListComponent },
  { path: '', redirectTo: '/heroes', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
