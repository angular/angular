import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeExampleComponent } from './code-example.component';
import { CodeModule } from './code.module';
import { WithCustomElements } from '../element-registry';

@NgModule({
  imports: [ CommonModule, CodeModule ],
  declarations: [ CodeExampleComponent ],
  exports: [ CodeExampleComponent ],
  entryComponents: [ CodeExampleComponent ]
})
export class CodeExampleModule implements WithCustomElements {
  customElements: Type<any>[] = [ CodeExampleComponent ];
}
