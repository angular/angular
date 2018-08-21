/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewEncapsulation,
  TemplateRef,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {MatStepLabel} from './step-label';
import {MatStepperIntl} from './stepper-intl';
import {MatStepperIconContext} from './stepper-icon';


@Component({
  moduleId: module.id,
  selector: 'mat-step-header',
  templateUrl: 'step-header.html',
  styleUrls: ['step-header.css'],
  host: {
    'class': 'mat-step-header',
    'role': 'tab',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatStepHeader implements OnDestroy {
  private _intlSubscription: Subscription;

  /** State of the given step. */
  @Input() state: string;

  /** Label of the given step. */
  @Input() label: MatStepLabel | string;

  /** Overrides for the header icons, passed in via the stepper. */
  @Input() iconOverrides: {[key: string]: TemplateRef<MatStepperIconContext>};

  /** Index of the given step. */
  @Input() index: number;

  /** Whether the given step is selected. */
  @Input() selected: boolean;

  /** Whether the given step label is active. */
  @Input() active: boolean;

  /** Whether the given step is optional. */
  @Input() optional: boolean;

  constructor(
    public _intl: MatStepperIntl,
    private _focusMonitor: FocusMonitor,
    private _element: ElementRef,
    changeDetectorRef: ChangeDetectorRef) {
    _focusMonitor.monitor(_element, true);
    this._intlSubscription = _intl.changes.subscribe(() => changeDetectorRef.markForCheck());
  }

  ngOnDestroy() {
    this._intlSubscription.unsubscribe();
    this._focusMonitor.stopMonitoring(this._element);
  }

  /** Returns string label of given step if it is a text label. */
  _stringLabel(): string | null {
    return this.label instanceof MatStepLabel ? null : this.label;
  }

  /** Returns MatStepLabel if the label of given step is a template label. */
  _templateLabel(): MatStepLabel | null {
    return this.label instanceof MatStepLabel ? this.label : null;
  }

  /** Returns the host HTML element. */
  _getHostElement() {
    return this._element.nativeElement;
  }

  /** Template context variables that are exposed to the `matStepperIcon` instances. */
  _getIconContext(): MatStepperIconContext {
    return {
      index: this.index,
      active: this.active,
      optional: this.optional
    };
  }

  focus() {
    this._getHostElement().focus();
  }
}
