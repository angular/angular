import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {PostModule} from 'post';

import {AppComponent} from './app.component';
import {FooComponent} from './foo.component';
import {HighlightDirective} from './highlight.directive';

@NgModule({
  imports: [CommonModule, PostModule],
  declarations: [AppComponent, FooComponent, HighlightDirective],
  bootstrap: [AppComponent],
})
export class AppModule {}
