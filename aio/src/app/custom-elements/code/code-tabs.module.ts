import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeTabsComponent } from './code-tabs.component';
import { MatTabsModule } from '@angular/material';
import { CodeModule } from './code.module';
import { WithCustomElementComponent } from '../element-registry';

@NgModule({
  imports: [ CommonModule, MatTabsModule, CodeModule ],
  declarations: [ CodeTabsComponent ],
  exports: [ CodeTabsComponent ],
  entryComponents: [ CodeTabsComponent ]
})
export class CodeTabsModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = CodeTabsComponent;
}
