import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WithCustomElementComponent } from '../element-registry';
import { TocComponent } from './toc.component';

@NgModule({
  imports: [ CommonModule, MatIconModule ],
  declarations: [ TocComponent ],
})
export class TocModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = TocComponent;
}
