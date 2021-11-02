import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// #docregion imports
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
// #enddocregion imports
import { HeroDetailComponent } from './hero-detail.component';
import { HeroListComponent } from './hero-list.component';
import { SalesTaxComponent } from './sales-tax.component';
import { HeroService } from './hero.service';
import { BackendService } from './backend.service';
import { Logger } from './logger.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    HeroDetailComponent,
    HeroListComponent,
    SalesTaxComponent
  ],
  providers: [
    BackendService,
    HeroService,
    Logger
  ],
  bootstrap: [ AppComponent ]
})
// #docregion export
export class AppModule { }
// #enddocregion export
