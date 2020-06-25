import { NgModule } from '@angular/core';
import { MyLibComponent } from './my-lib.component';

import { CardComponent } from './card/card.component';
import { OptionalModule } from './optional/optional.module';
import { StuffComponent } from './stuff/stuff.component'


@NgModule({
  declarations: [MyLibComponent, CardComponent, StuffComponent],
  imports: [OptionalModule
  ],
  exports: [MyLibComponent, CardComponent, StuffComponent]
})
export class MyLibModule { }
