/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EventEmitter} from '@angular/core';
import {AngularDevtoolsError} from '../utils/error';
import {debugLog} from '../utils/log';
import {Highlight, HighlightLabelDefinition, HighlightLabelProps, HighlightTemplate} from './types';
import {Renderer} from './rendering/renderer';

/** Provides a container of all highlight-related references and controls over the highlight. */
export class HighlightImpl<
  T extends HighlightLabelDefinition = HighlightLabelDefinition,
> implements Highlight<T> {
  public readonly targetElement: WeakRef<Element>;

  private destroyed = false;
  private propsInternal: HighlightLabelProps<T>;
  private displayed: boolean = false;

  constructor(
    targetElement: Element,
    public readonly template: HighlightTemplate<T>,
    props: HighlightLabelProps<T>,
    private readonly destroyEvents: EventEmitter<[highlight: Highlight]>,
    private readonly renderer: Renderer,
  ) {
    validateTemplateLabels(template);
    this.targetElement = new WeakRef(targetElement);
    this.propsInternal = props;
  }

  get type() {
    return this.template.type;
  }

  get props() {
    return this.propsInternal;
  }

  get isDestroyed() {
    return this.destroyed;
  }

  get isDisplayed() {
    return this.displayed;
  }

  updateLabel(labelId: keyof T, ...props: Parameters<T[keyof T]>) {
    this.props[labelId] = props;

    this.renderer.renderHighlight(this);
  }

  destroy() {
    // Since there is a chance that there are references
    // outside of `highlighter.ts`, we store the destroy state.
    // Ideally, we should clean up all references.
    // Getting the warning, means that there MIGHT be a problem
    // with the code (i.e. there is chance for a memory leak).
    // However, this could be a false positive since GC passes
    // are not guaranteed to happen immediately.
    // This is merely a warning to be diligent with references storing.
    if (this.destroyed) {
      debugLog.warn('The highlight has already been destroyed. Check references storing.');
      return;
    }
    this.destroyEvents.emit([this]);
    this.renderer.removeHighlight(this);
    this.displayed = false;
    this.destroyed = true;
  }

  display() {
    if (this.displayed) {
      return;
    }
    if (this.destroyed) {
      debugLog.warn('Cannot display a destroyed highlight.');
      return;
    }

    this.renderer.renderHighlight(this);
    this.displayed = true;
  }

  hide() {
    if (!this.displayed) {
      return;
    }
    this.renderer.removeHighlight(this);
    this.displayed = false;
  }
}

function validateTemplateLabels(template: HighlightTemplate) {
  const usedXPos = new Set<string>();

  for (const {x} of Object.values(template.labels)) {
    if (usedXPos.has(x)) {
      throw new AngularDevtoolsError(
        `The template (type: ${template.type}) has multiple labels with '${x}' X position.`,
      );
    }
    usedXPos.add(x);
  }
}
