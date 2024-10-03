/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'app',
  template: `<form *ngFor="let copy of copies">
    <input type="text" [(ngModel)]="values[0]" name="value0" />
    <input type="text" [(ngModel)]="values[1]" name="value1" />
    <input type="text" [(ngModel)]="values[2]" name="value2" />
    <input type="text" [(ngModel)]="values[3]" name="value3" />
    <input type="text" [(ngModel)]="values[4]" name="value4" />
    <input type="text" [(ngModel)]="values[5]" name="value5" />
    <input type="text" [(ngModel)]="values[6]" name="value6" />
    <input type="text" [(ngModel)]="values[7]" name="value7" />
    <input type="text" [(ngModel)]="values[8]" name="value8" />
    <input type="text" [(ngModel)]="values[9]" name="value9" />
    <input type="text" [(ngModel)]="values[10]" name="value10" />
    <input type="text" [(ngModel)]="values[11]" name="value11" />
    <input type="text" [(ngModel)]="values[12]" name="value12" />
    <input type="text" [(ngModel)]="values[13]" name="value13" />
    <input type="text" [(ngModel)]="values[14]" name="value14" />
    <input type="text" [(ngModel)]="values[15]" name="value15" />
    <input type="text" [(ngModel)]="values[16]" name="value16" />
    <input type="text" [(ngModel)]="values[17]" name="value17" />
    <input type="text" [(ngModel)]="values[18]" name="value18" />
    <input type="text" [(ngModel)]="values[19]" name="value19" />
    <input type="text" [(ngModel)]="values[20]" name="value20" />
    <input type="text" [(ngModel)]="values[21]" name="value21" />
    <input type="text" [(ngModel)]="values[22]" name="value22" />
    <input type="text" [(ngModel)]="values[23]" name="value23" />
    <input type="text" [(ngModel)]="values[24]" name="value24" />
    <input type="text" [(ngModel)]="values[25]" name="value25" />
    <input type="text" [(ngModel)]="values[26]" name="value26" />
    <input type="text" [(ngModel)]="values[27]" name="value27" />
    <input type="text" [(ngModel)]="values[28]" name="value28" />
    <input type="text" [(ngModel)]="values[29]" name="value29" />
    <input type="text" [(ngModel)]="values[30]" name="value30" />
    <input type="text" [(ngModel)]="values[31]" name="value31" />
    <input type="text" [(ngModel)]="values[32]" name="value32" />
    <input type="text" [(ngModel)]="values[33]" name="value33" />
    <input type="text" [(ngModel)]="values[34]" name="value34" />
    <input type="text" [(ngModel)]="values[35]" name="value35" />
    <input type="text" [(ngModel)]="values[36]" name="value36" />
    <input type="text" [(ngModel)]="values[37]" name="value37" />
    <input type="text" [(ngModel)]="values[38]" name="value38" />
    <input type="text" [(ngModel)]="values[39]" name="value39" />
    <input type="text" [(ngModel)]="values[40]" name="value40" />
    <input type="text" [(ngModel)]="values[41]" name="value41" />
    <input type="text" [(ngModel)]="values[42]" name="value42" />
    <input type="text" [(ngModel)]="values[43]" name="value43" />
    <input type="text" [(ngModel)]="values[44]" name="value44" />
    <input type="text" [(ngModel)]="values[45]" name="value45" />
    <input type="text" [(ngModel)]="values[46]" name="value46" />
    <input type="text" [(ngModel)]="values[47]" name="value47" />
    <input type="text" [(ngModel)]="values[48]" name="value48" />
    <input type="text" [(ngModel)]="values[49]" name="value49" />
  </form>`,
  standalone: false,
})
export class AppComponent {
  copies: number[] = [];
  values: string[] = [];
  constructor() {
    for (let i = 0; i < 50; i++) {
      this.values[i] = `someValue${i}`;
    }
  }

  setCopies(count: number) {
    this.copies = [];
    for (let i = 0; i < count; i++) {
      this.copies.push(i);
    }
  }
}

@NgModule({
  imports: [BrowserModule, FormsModule],
  bootstrap: [AppComponent],
  declarations: [AppComponent],
})
export class AppModule {}
