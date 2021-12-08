import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { View1Component } from "../../../app2/src/app/view1/view1.component";
import { View2Component } from "../../../app2/src/app/view2/view2.component";

const routes: Routes = [
  { path: 'app2/one', component: View1Component },
  { path: 'app2/two', component: View2Component },
  { path: 'app2', redirectTo: 'app2/one' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
