import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HeroComponent } from './heroes';
import { UsersComponent } from './users';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '02-07', component: AppComponent }])
  ],
  declarations: [
    AppComponent,
    HeroComponent,
    UsersComponent
  ],
  exports: [ AppComponent ]
})
export class AppModule {}
