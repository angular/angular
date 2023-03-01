import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HighlightDirective } from './highlight.directive';
import { TitleCasePipe } from './title-case.pipe';
import { CanvasComponent } from './canvas.component';

@NgModule({
  imports: [ CommonModule ],
  exports: [
    CommonModule,
    // SharedModule importers won't have to import FormsModule too
    FormsModule,
    HighlightDirective,
    TitleCasePipe,
    CanvasComponent
  ],
  declarations: [ HighlightDirective, TitleCasePipe, CanvasComponent ]
})
export class SharedModule { }
