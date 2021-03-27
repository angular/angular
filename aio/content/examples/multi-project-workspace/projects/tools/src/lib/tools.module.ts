import { NgModule } from '@angular/core';
import { ToolsComponent } from './tools.component';
import { MyComponentComponent } from './my-component/my-component.component';
import { MyComponent2Component } from './my-component2/my-component2.component';



@NgModule({
  declarations: [ToolsComponent, MyComponentComponent, MyComponent2Component],
  imports: [
  ],
  exports: [ToolsComponent]
})
export class ToolsModule { }
