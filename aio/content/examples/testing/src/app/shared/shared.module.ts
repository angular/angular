import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';

import { HighlightDirective } from './highlight.directive';
import { TitleCasePipe }      from './title-case.pipe';

@NgModule({
  imports: [ CommonModule ],
  exports: [
    CommonModule,
    // SharedModule importers won't have to import FormsModule too
    FormsModule,
    HighlightDirective,
    TitleCasePipe
  ],
  declarations: [ HighlightDirective, TitleCasePipe ]
})
export class SharedModule { }
