// #docregion
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { heroSwitchComponents } from './hero-switch.components';
import { HeroComponent } from './hero.component';
import { IfLoadedDirective } from './if-loaded.directive';
import { UnlessDirective } from './unless.directive';
import { TrigonometryDirective } from './trigonometry.directive';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [
    AppComponent,
    heroSwitchComponents,
    HeroComponent,
    IfLoadedDirective,
    UnlessDirective,
    TrigonometryDirective,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
