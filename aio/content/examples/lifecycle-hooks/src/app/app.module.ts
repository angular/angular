// #docregion
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import {
  AfterContentParentComponent,
  AfterContentComponent,
  ChildComponent
} from './after-content.component';

import {
  AfterViewParentComponent,
  AfterViewComponent,
  ChildViewComponent
} from './after-view.component';

import {
  CounterParentComponent,
  MyCounterComponent
} from './counter.component';

import {
  DoCheckParentComponent,
  DoCheckComponent
} from './do-check.component';

import {
  OnChangesParentComponent,
  OnChangesComponent
} from './on-changes.component';

import { PeekABooParentComponent } from './peek-a-boo-parent.component';
import { PeekABooComponent } from './peek-a-boo.component';

import { SpyParentComponent } from './spy.component';
import { SpyDirective } from './spy.directive';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    AfterContentParentComponent,
    AfterContentComponent,
    ChildComponent,
    AfterViewParentComponent,
    AfterViewComponent,
    ChildViewComponent,
    CounterParentComponent,
    MyCounterComponent,
    DoCheckParentComponent,
    DoCheckComponent,
    OnChangesParentComponent,
    OnChangesComponent,
    PeekABooParentComponent,
    PeekABooComponent,
    SpyParentComponent,
    SpyDirective
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
