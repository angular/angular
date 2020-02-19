import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisModule } from 'ngx-vis';

import { TimeTravelComponent } from './time-travel.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { PropertyViewModule } from '../../property-tab/property-tab-body/property-view/property-view.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [TimeTravelComponent],
  exports: [TimeTravelComponent],
  imports: [CommonModule, VisModule, MatProgressBarModule, MatSliderModule, PropertyViewModule, MatButtonModule],
})
export class TimeTravelModule {}
