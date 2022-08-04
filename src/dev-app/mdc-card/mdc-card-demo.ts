/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatCardAppearance, MatCardModule} from '@angular/material/card';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'mdc-card-demo',
  templateUrl: 'mdc-card-demo.html',
  styleUrls: ['mdc-card-demo.css'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatCheckboxModule, FormsModule],
})
export class MdcCardDemo {
  appearance: MatCardAppearance = 'raised';
  longText = `Once upon a midnight dreary, while I pondered, weak and weary,
              Over many a quaint and curious volume of forgotten lore—
              While I nodded, nearly napping, suddenly there came a tapping,
              As of some one gently rapping, rapping at my chamber door.
              “’Tis some visitor,” I muttered, “tapping at my chamber door—
              Only this and nothing more.”`;
  toggleAppearance() {
    this.appearance = this.appearance == 'raised' ? 'outlined' : 'raised';
  }
}
