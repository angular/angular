import { unHighlight, highlight, findComponentAndHost } from './highlighter';
import { Type } from '@angular/core';

export class ComponentInspector {
  private _selectedComponent: { component: Type<unknown>, host: HTMLElement };

  constructor() {
    this.bindMethods();
  }

  startInspecting() {
    window.addEventListener('mouseover', this.elementMouseOver, true);
    window.addEventListener('mouseout', this.cancelEvent, true);
    window.addEventListener('mouseenter', this.cancelEvent, true);
    window.addEventListener('mouseleave', this.cancelEvent, true);
    window.addEventListener('mousedown', this.cancelEvent, true);
    window.addEventListener('mouseup', this.cancelEvent, true);
  }

  /**
   * Removes event listeners
   */
  stopInspecting() {
    window.removeEventListener('mouseover', this.elementMouseOver, true);
    window.removeEventListener('mouseout', this.cancelEvent, true);
    window.removeEventListener('mouseenter', this.cancelEvent, true);
    window.removeEventListener('mouseleave', this.cancelEvent, true);
    window.removeEventListener('mousedown', this.cancelEvent, true);
    window.removeEventListener('mouseup', this.cancelEvent, true);

    unHighlight();
  }

  elementMouseOver(e: MouseEvent) {
    this.cancelEvent(e);

    const el = e.target as HTMLElement;
    if (el) {
      this._selectedComponent = findComponentAndHost(el);
    }

    unHighlight();
    if (this._selectedComponent.component) {
      highlight(this._selectedComponent.host);
    }
  }

  cancelEvent(e: MouseEvent) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }

  bindMethods() {
    this.startInspecting = this.startInspecting.bind(this);
    this.stopInspecting = this.stopInspecting.bind(this);
    this.elementMouseOver = this.elementMouseOver.bind(this);
  }
}
