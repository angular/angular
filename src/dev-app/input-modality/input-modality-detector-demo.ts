/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, OnDestroy, NgZone} from '@angular/core';
import {A11yModule, InputModality, InputModalityDetector} from '@angular/cdk/a11y';

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {MatLegacySelectModule} from '@angular/material/legacy-select';

@Component({
  selector: 'input-modality-detector-demo',
  templateUrl: 'input-modality-detector-demo.html',
  standalone: true,
  imports: [
    A11yModule,
    CommonModule,
    MatButtonModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacyRadioModule,
    MatLegacySelectModule,
  ],
})
export class InputModalityDetectorDemo implements OnDestroy {
  _modality: InputModality = null;
  _destroyed = new Subject<void>();

  constructor(inputModalityDetector: InputModalityDetector, ngZone: NgZone) {
    inputModalityDetector.modalityChanged.pipe(takeUntil(this._destroyed)).subscribe(modality =>
      ngZone.run(() => {
        this._modality = modality;
      }),
    );
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
