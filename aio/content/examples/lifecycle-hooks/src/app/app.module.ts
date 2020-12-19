// #docregion
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { AfterContentParentComponent } from './after-content-parent.component';
import { AfterContentComponent } from './after-content.component';
import { ChildComponent } from './child.component';

import { AfterViewParentComponent } from './after-view-parent.component';
import { AfterViewComponent } from './after-view.component';
import { ChildViewComponent } from './child-view.component';

import { CounterParentComponent } from './counter-parent.component';
import { MyCounterComponent } from './counter.component';

import { DoCheckParentComponent } from './do-check-parent.component';
import { DoCheckComponent } from './do-check.component';

import { OnChangesParentComponent } from './on-changes-parent.component';
import { OnChangesComponent } from './on-changes.component';

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
