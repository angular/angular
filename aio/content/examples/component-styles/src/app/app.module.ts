import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HeroAppComponent } from './hero-app.component';
import { HeroAppMainComponent } from './hero-app-main.component';
import { HeroDetailsComponent } from './hero-details.component';
import { HeroControlsComponent } from './hero-controls.component';
import { QuestSummaryComponent } from './quest-summary.component';
import { HeroTeamComponent } from './hero-team.component';

@NgModule({
  imports: [ BrowserModule ],
  declarations: [
    HeroAppComponent,
    HeroAppMainComponent,
    HeroDetailsComponent,
    HeroControlsComponent,
    QuestSummaryComponent,
    HeroTeamComponent
  ],
  bootstrap: [ HeroAppComponent ]
})
export class AppModule { }
