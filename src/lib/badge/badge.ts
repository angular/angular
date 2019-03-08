/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AriaDescriber} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {DOCUMENT} from '@angular/common';
import {
  Directive,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Renderer2,
} from '@angular/core';
import {ThemePalette, mixinDisabled, CanDisableCtor, CanDisable} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';


let nextId = 0;

// Boilerplate for applying mixins to MatBadge.
/** @docs-private */
export class MatBadgeBase {}

export const _MatBadgeMixinBase:
    CanDisableCtor & typeof MatBadgeBase = mixinDisabled(MatBadgeBase);

export type MatBadgePosition = 'above after' | 'above before' | 'below before' | 'below after';
export type MatBadgeSize = 'small' | 'medium' | 'large';

/** Directive to display a text badge. */
@Directive({
  selector: '[matBadge]',
  inputs: ['disabled: matBadgeDisabled'],
  host: {
    'class': 'mat-badge',
    '[class.mat-badge-overlap]': 'overlap',
    '[class.mat-badge-above]': 'isAbove()',
    '[class.mat-badge-below]': '!isAbove()',
    '[class.mat-badge-before]': '!isAfter()',
    '[class.mat-badge-after]': 'isAfter()',
    '[class.mat-badge-small]': 'size === "small"',
    '[class.mat-badge-medium]': 'size === "medium"',
    '[class.mat-badge-large]': 'size === "large"',
    '[class.mat-badge-hidden]': 'hidden || !_hasContent',
    '[class.mat-badge-disabled]': 'disabled',
  },
})
export class MatBadge extends _MatBadgeMixinBase implements OnDestroy, CanDisable {
  /** Whether the badge has any content. */
  _hasContent = false;

  /** The color of the badge. Can be `primary`, `accent`, or `warn`. */
  @Input('matBadgeColor')
  get color(): ThemePalette { return this._color; }
  set color(value: ThemePalette) {
    this._setColor(value);
    this._color = value;
  }
  private _color: ThemePalette = 'primary';

  /** Whether the badge should overlap its contents or not */
  @Input('matBadgeOverlap')
  get overlap(): boolean { return this._overlap; }
  set overlap(val: boolean) {
    this._overlap = coerceBooleanProperty(val);
  }
  private _overlap: boolean = true;

  /**
   * Position the badge should reside.
   * Accepts any combination of 'above'|'below' and 'before'|'after'
   */
  @Input('matBadgePosition') position: MatBadgePosition = 'above after';

  /** The content for the badge */
  @Input('matBadge')
  get content(): string { return this._content; }
  set content(value: string) {
    this._content = value;
    this._hasContent = value != null && `${value}`.trim().length > 0;
    this._updateTextContent();
  }
  private _content: string;

  /** Message used to describe the decorated element via aria-describedby */
  @Input('matBadgeDescription')
  get description(): string { return this._description; }
  set description(newDescription: string) {
    if (newDescription !== this._description) {
      const badgeElement = this._badgeElement;
      this._updateHostAriaDescription(newDescription, this._description);
      this._description = newDescription;

      if (badgeElement) {
        newDescription ? badgeElement.setAttribute('aria-label', newDescription) :
            badgeElement.removeAttribute('aria-label');
      }
    }
  }
  private _description: string;

  /** Size of the badge. Can be 'small', 'medium', or 'large'. */
  @Input('matBadgeSize') size: MatBadgeSize = 'medium';

  /** Whether the badge is hidden. */
  @Input('matBadgeHidden')
  get hidden(): boolean { return this._hidden; }
  set hidden(val: boolean) {
    this._hidden = coerceBooleanProperty(val);
  }
  private _hidden: boolean;

  /** Unique id for the badge */
  _id: number = nextId++;

  private _badgeElement: HTMLElement;

  constructor(
      @Optional() @Inject(DOCUMENT) private _document: any,
      private _ngZone: NgZone,
      private _elementRef: ElementRef<HTMLElement>,
      private _ariaDescriber: AriaDescriber,
      /** @breaking-change 8.0.0 Make _renderer a required param and remove _document. */
      private _renderer?: Renderer2,
      @Optional() @Inject(ANIMATION_MODULE_TYPE) private _animationMode?: string) {
      super();
    }

  /** Whether the badge is above the host or not */
  isAbove(): boolean {
    return this.position.indexOf('below') === -1;
  }

  /** Whether the badge is after the host or not */
  isAfter(): boolean {
    return this.position.indexOf('before') === -1;
  }

  ngOnDestroy() {
    const badgeElement = this._badgeElement;

    if (badgeElement) {
      if (this.description) {
        this._ariaDescriber.removeDescription(badgeElement, this.description);
      }

      // When creating a badge through the Renderer, Angular will keep it in an index.
      // We have to destroy it ourselves, otherwise it'll be retained in memory.
      // @breaking-change 8.0.0 remove _renderer from null.
      if (this._renderer && this._renderer.destroyNode) {
        this._renderer.destroyNode(badgeElement);
      }
    }
  }

  /** Injects a span element into the DOM with the content. */
  private _updateTextContent(): HTMLSpanElement {
    if (!this._badgeElement) {
      this._badgeElement = this._createBadgeElement();
    } else {
      this._badgeElement.textContent = this.content;
    }
    return this._badgeElement;
  }

  /** Creates the badge element */
  private _createBadgeElement(): HTMLElement {
    // @breaking-change 8.0.0 Remove null check for _renderer
    const rootNode = this._renderer || this._document;
    const badgeElement = rootNode.createElement('span');
    const activeClass = 'mat-badge-active';
    const contentClass = 'mat-badge-content';

    // Clear any existing badges which may have persisted from a server-side render.
    this._clearExistingBadges(contentClass);
    badgeElement.setAttribute('id', `mat-badge-content-${this._id}`);
    badgeElement.classList.add(contentClass);
    badgeElement.textContent = this.content;

    if (this._animationMode === 'NoopAnimations') {
      badgeElement.classList.add('_mat-animation-noopable');
    }

    if (this.description) {
      badgeElement.setAttribute('aria-label', this.description);
    }

    this._elementRef.nativeElement.appendChild(badgeElement);

    // animate in after insertion
    if (typeof requestAnimationFrame === 'function' && this._animationMode !== 'NoopAnimations') {
      this._ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          badgeElement.classList.add(activeClass);
        });
      });
    } else {
      badgeElement.classList.add(activeClass);
    }

    return badgeElement;
  }

  /** Sets the aria-label property on the element */
  private _updateHostAriaDescription(newDescription: string, oldDescription: string): void {
    // ensure content available before setting label
    const content = this._updateTextContent();

    if (oldDescription) {
      this._ariaDescriber.removeDescription(content, oldDescription);
    }

    if (newDescription) {
      this._ariaDescriber.describe(content, newDescription);
    }
  }

  /** Adds css theme class given the color to the component host */
  private _setColor(colorPalette: ThemePalette) {
    if (colorPalette !== this._color) {
      if (this._color) {
        this._elementRef.nativeElement.classList.remove(`mat-badge-${this._color}`);
      }
      if (colorPalette) {
        this._elementRef.nativeElement.classList.add(`mat-badge-${colorPalette}`);
      }
    }
  }

  /** Clears any existing badges that might be left over from server-side rendering. */
  private _clearExistingBadges(cssClass: string) {
    const element = this._elementRef.nativeElement;
    let childCount = element.children.length;

    // Use a reverse while, because we'll be removing elements from the list as we're iterating.
    while (childCount--) {
      const currentChild = element.children[childCount];

      if (currentChild.classList.contains(cssClass)) {
        element.removeChild(currentChild);
      }
    }
  }
}
