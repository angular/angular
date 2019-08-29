import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { AnnouncementBarComponent } from './announcement-bar.component';
import { WithCustomElementComponent } from '../element-registry';

@NgModule({
  imports: [ CommonModule, SharedModule, HttpClientModule ],
  declarations: [ AnnouncementBarComponent ],
  entryComponents: [ AnnouncementBarComponent ],
})
export class AnnouncementBarModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = AnnouncementBarComponent;
}
