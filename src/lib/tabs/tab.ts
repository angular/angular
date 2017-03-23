import {TemplatePortal} from '../core/portal/portal';
import {
  ViewContainerRef, Input, TemplateRef, ViewChild, OnInit, ContentChild,
  Component
} from '@angular/core';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';

import {MdTabLabel} from './tab-label';

@Component({
  moduleId: module.id,
  selector: 'md-tab, mat-tab',
  templateUrl: 'tab.html',
})
export class MdTab implements OnInit {
  /** Content for the tab label given by <ng-template md-tab-label>. */
  @ContentChild(MdTabLabel) templateLabel: MdTabLabel;

  /** Template inside the MdTab view that contains an <ng-content>. */
  @ViewChild(TemplateRef) _content: TemplateRef<any>;

  /** The plain text label for the tab, used when there is no template label. */
  @Input('label') textLabel: string = '';

  /** The portal that will be the hosted content of the tab */
  private _contentPortal: TemplatePortal = null;
  get content(): TemplatePortal { return this._contentPortal; }

  /**
   * The relatively indexed position where 0 represents the center, negative is left, and positive
   * represents the right.
   */
  position: number = null;

  /**
   * The initial relatively index origin of the tab if it was created and selected after there
   * was already a selected tab. Provides context of what position the tab should originate from.
   */
  origin: number = null;

  private _disabled = false;

  /** Whether the tab is disabled */
  @Input()
  set disabled(value: boolean) { this._disabled = coerceBooleanProperty(value); }
  get disabled(): boolean { return this._disabled; }

  constructor(private _viewContainerRef: ViewContainerRef) { }

  ngOnInit() {
    this._contentPortal = new TemplatePortal(this._content, this._viewContainerRef);
  }
}
