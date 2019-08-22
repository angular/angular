/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'mdc-card-demo',
  templateUrl: 'mdc-card-demo.html',
  styleUrls: ['mdc-card-demo.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MdcCardDemo {
  longText = `Once upon a midnight dreary, while I pondered, weak and weary,
              Over many a quaint and curious volume of forgotten lore—
              While I nodded, nearly napping, suddenly there came a tapping,
              As of some one gently rapping, rapping at my chamber door.
              “’Tis some visitor,” I muttered, “tapping at my chamber door—
              Only this and nothing more.”`;
}
