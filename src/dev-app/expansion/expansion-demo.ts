/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild} from '@angular/core';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {
  MatAccordion,
  MatAccordionDisplayMode,
  MatAccordionTogglePosition,
  MatExpansionModule,
} from '@angular/material/expansion';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {MatLegacySlideToggleModule} from '@angular/material/legacy-slide-toggle';

@Component({
  selector: 'expansion-demo',
  styleUrls: ['expansion-demo.css'],
  templateUrl: 'expansion-demo.html',
  standalone: true,
  imports: [
    CdkAccordionModule,
    CommonModule,
    FormsModule,
    MatLegacyButtonModule,
    MatLegacyCheckboxModule,
    MatExpansionModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacyRadioModule,
    MatLegacySlideToggleModule,
  ],
})
export class ExpansionDemo {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  displayMode: MatAccordionDisplayMode = 'default';
  multi = false;
  hideToggle = false;
  disabled = false;
  showPanel3 = true;
  togglePosition: MatAccordionTogglePosition = 'after';
  expandedHeight: string;
  collapsedHeight: string;
  events: string[] = [];

  addEvent(eventName: string) {
    this.events.push(`${eventName} - ${new Date().toISOString()}`);
  }
}
