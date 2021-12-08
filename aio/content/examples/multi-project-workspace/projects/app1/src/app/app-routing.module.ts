import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import appComponentCss from "../../../../src/app/app.component.css";
import { View1Component } from "./view1/view1.component";
import { View2Component } from "./view2/view2.component";

const routes: Routes = [
  { path: "app1/one", component: View1Component },
  { path: "app1/two", component: View2Component },
  { path: "app1", redirectTo: "app1/one" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
