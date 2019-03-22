import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  // TODO(kyliau): Empty routes is enough for now to expose the bug in
  // https://github.com/angular/angular/issues/29454.
  // Consider adding non-lazy loaded routes.
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
