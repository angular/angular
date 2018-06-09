import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

import { OpenCloseComponent } from './open-close.component';
import { OpenClosePageComponent } from './open-close-page.component';

import { OpenCloseChildComponent } from './open-close.component.4';
import { ToggleAnimationsPageComponent } from './toggle-animations-page.component';

import { StatusSliderComponent } from './status-slider.component';
import { StatusSliderPageComponent } from './status-slider-page.component';
import { HeroListPageComponent } from './hero-list-page.component';
import { HeroListGroupPageComponent } from './hero-list-group-page.component';
import { HeroListGroupsComponent } from './hero-list-groups.component';
import { HeroListEnterLeavePageComponent } from './hero-list-enter-leave-page.component';
import { HeroListEnterLeaveComponent } from './hero-list-enter-leave.component';
import { HeroListAutoCalcPageComponent } from './hero-list-auto-page.component';
import { HeroListAutoComponent } from './hero-list-auto.component';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', redirectTo: '/enter-leave' },
      { path: 'open-close', component: OpenClosePageComponent },
      { path: 'status', component: StatusSliderPageComponent },
      { path: 'toggle', component: ToggleAnimationsPageComponent },
      { path: 'heroes', component: HeroListPageComponent },
      { path: 'hero-groups', component: HeroListGroupPageComponent },
      { path: 'enter-leave', component: HeroListEnterLeavePageComponent },
      { path: 'auto', component: HeroListAutoCalcPageComponent },
    ])
  ],
  declarations: [
    AppComponent,
    StatusSliderComponent,
    OpenCloseComponent,
    OpenCloseChildComponent,
    OpenClosePageComponent,
    StatusSliderPageComponent,
    ToggleAnimationsPageComponent,
    HeroListPageComponent,
    HeroListGroupsComponent,
    HeroListGroupPageComponent,
    HeroListEnterLeavePageComponent,
    HeroListEnterLeaveComponent,
    HeroListAutoCalcPageComponent,
    HeroListAutoComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
