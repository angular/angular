import { NgModule, Component } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

@Component({
  selector: 'home-view',
  template: 'home!'
})
export class HomeView {}


@NgModule({
  declarations: [
    AppComponent,
    HomeView
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {path: 'lazy', loadChildren: './lazy.module#LazyModule'},
      {path: 'feature2', loadChildren: 'feature2/feature2.module#Feature2Module'},
      {path: '', component: HomeView}
    ])
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
