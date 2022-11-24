import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeComponent } from './code.component';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { PrettyPrinter } from './pretty-printer.service';

@NgModule({
  imports: [ CommonModule, MatSnackBarModule ],
  declarations: [ CodeComponent ],
  exports: [ CodeComponent ],
  providers: [ PrettyPrinter ]
})
export class CodeModule { }
