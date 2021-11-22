import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';

import { RouterTreeComponent } from './router-tree.component';

@NgModule({
  declarations: [RouterTreeComponent],
  imports: [CommonModule, MatDialogModule, MatSelectModule],
  exports: [RouterTreeComponent],
  entryComponents: [],
})
export class RouterTreeModule {}
