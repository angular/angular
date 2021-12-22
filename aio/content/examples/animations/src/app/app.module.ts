// #docregion route-animation-data
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
import { HomeComponent } from './home.component';
import { AboutComponent } from './about.component';
import { InsertRemoveComponent } from './insert-remove.component';
import { QueryingComponent } from './querying.component';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', redirectTo: '/enter-leave' },
      {
        path: 'open-close',
        component: OpenClosePageComponent,
        data: { animation: 'openClosePage' }
      },
      {
        path: 'status',
        component: StatusSliderPageComponent,
        data: { animation: 'statusPage' }
      },
      {
        path: 'toggle',
        component: ToggleAnimationsPageComponent,
        data: { animation: 'togglePage' }
      },
      {
        path: 'heroes',
        component: HeroListPageComponent,
        data: { animation: 'filterPage' }
      },
      {
        path: 'hero-groups',
        component: HeroListGroupPageComponent,
        data: { animation: 'heroGroupPage' }
      },
      {
        path: 'enter-leave',
        component: HeroListEnterLeavePageComponent,
        data: { animation: 'enterLeavePage' }
      },
      {
        path: 'auto',
        component: HeroListAutoCalcPageComponent,
        data: { animation: 'autoPage' }
      },
      {
        path: 'insert-remove',
        component: InsertRemoveComponent,
        data: { animation: 'insertRemovePage' }
      },
      {
        path: 'querying',
        component: QueryingComponent,
        data: { animation: 'queryingPage' }
      },
      {
        path: 'home',
        component: HomeComponent,
        data: { animation: 'HomePage' }
      },
      {
        path: 'about',
        component: AboutComponent,
        data: { animation: 'AboutPage' }
      },
    ])
  ],
  // #enddocregion route-animation-data
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
    HeroListAutoComponent,
    HomeComponent,
    InsertRemoveComponent,
    QueryingComponent,
    AboutComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
