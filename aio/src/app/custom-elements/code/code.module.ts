import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeComponent } from './code.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PrettyPrinter } from './pretty-printer.service';

@NgModule({
  imports: [ CommonModule, MatSnackBarModule ],
  declarations: [ CodeComponent ],
  entryComponents: [ CodeComponent ],
  exports: [ CodeComponent ],
  providers: [ PrettyPrinter ]
})
export class CodeModule { }
