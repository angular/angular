import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AnnouncementBarComponent } from './announcement-bar.component';
import { WithCustomElementComponent } from '../element-registry';

@NgModule({
  imports: [ CommonModule, HttpClientModule ],
  declarations: [ AnnouncementBarComponent ],
  entryComponents: [ AnnouncementBarComponent ],
})
export class AnnouncementBarModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = AnnouncementBarComponent;
}
