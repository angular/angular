/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusTrap, FocusTrapFactory} from '@angular/cdk/a11y';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'shadow-dom-demo',
  template: '<ng-content></ng-content>',
  host:     {'class': 'demo-focus-trap-shadow-root'},
  encapsulation: ViewEncapsulation.ShadowDom
})
export class FocusTrapShadowDomDemo {}

@Component({
  selector: 'focus-trap-demo',
  templateUrl: 'focus-trap-demo.html',
  styleUrls: ['focus-trap-demo.css'],
})
export class FocusTrapDemo implements AfterViewInit {

  basicFocusTrap: FocusTrap;
  @ViewChild('basicDemoRegion', {static: false}) private readonly _basicDemoRegion!: ElementRef;

  nestedOuterFocusTrap: FocusTrap;
  @ViewChild('nestedOuterDemoRegion', {static: false})
  private readonly _nestedOuterDemoRegion!: ElementRef;
  nestedInnerFocusTrap: FocusTrap;
  @ViewChild('nestedInnerDemoRegion', {static: false})
  private readonly _nestedInnerDemoRegion!: ElementRef;

  tabIndexFocusTrap: FocusTrap;
  @ViewChild('tabIndexDemoRegion', {static: false})
  private readonly _tabIndexDemoRegion!: ElementRef;

  shadowDomFocusTrap: FocusTrap;
  @ViewChild('shadowDomDemoRegion', {static: false})
  private readonly _shadowDomDemoRegion!: ElementRef;

  iframeFocusTrap: FocusTrap;
  @ViewChild('iframeDemoRegion', {static: false})
  private readonly _iframeDemoRegion!: ElementRef;

  dynamicFocusTrap: FocusTrap;
  @ViewChild('dynamicDemoRegion', {static: false})
  private readonly _dynamicDemoRegion!: ElementRef;
  @ViewChild('newElements', {static: false}) private readonly _newElements!: ElementRef;

  constructor(
    public dialog: MatDialog,
    private _focusTrapFactory: FocusTrapFactory) {}

  ngAfterViewInit() {
    this.basicFocusTrap = this._focusTrapFactory.create(this._basicDemoRegion.nativeElement);
    this.basicFocusTrap.enabled = false;

    this.nestedOuterFocusTrap = this._focusTrapFactory.create(
      this._nestedOuterDemoRegion.nativeElement);
    this.nestedOuterFocusTrap.enabled = false;

    this.nestedInnerFocusTrap = this._focusTrapFactory.create(
      this._nestedInnerDemoRegion.nativeElement);
    this.nestedInnerFocusTrap.enabled = false;

    this.tabIndexFocusTrap = this._focusTrapFactory.create(
      this._tabIndexDemoRegion.nativeElement);
    this.tabIndexFocusTrap.enabled = false;

    this.shadowDomFocusTrap = this._focusTrapFactory.create(
      this._shadowDomDemoRegion.nativeElement);
    this.shadowDomFocusTrap.enabled = false;

    this.iframeFocusTrap = this._focusTrapFactory.create(this._iframeDemoRegion.nativeElement);
    this.iframeFocusTrap.enabled = false;

    this.dynamicFocusTrap = this._focusTrapFactory.create(this._dynamicDemoRegion.nativeElement);
    this.dynamicFocusTrap.enabled = false;
  }

  toggleFocus(focusTrap: FocusTrap) {
    focusTrap.enabled = !focusTrap.enabled;
    if (focusTrap.enabled) {
      focusTrap.focusInitialElementWhenReady();
    }
  }

  addNewElement() {
    const textarea = document.createElement('textarea');
    textarea.setAttribute('placeholder', 'I am a new element!');
    this._newElements.nativeElement.appendChild(textarea);
  }

  openDialog() {
    this.dialog.open(FocusTrapDialogDemo);
  }
}

let dialogCount = 0;

@Component({
  selector: 'focus-trap-dialog-demo',
  styleUrls: ['focus-trap-dialog-demo.css'],
  templateUrl: 'focus-trap-dialog-demo.html',
})
export class FocusTrapDialogDemo {
  id = dialogCount++;
  constructor(public dialog: MatDialog) {}

  openAnotherDialog() {
    this.dialog.open(FocusTrapDialogDemo);
  }
}
