import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FooComponent} from './foo.component';

@NgModule({
  imports: [CommonModule],
  declarations: [AppComponent, FooComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
