/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Inject,
  InjectionToken,
  Input,
  Optional,
  ViewEncapsulation,
} from '@angular/core';

export type MatCardAppearance = 'outlined' | 'raised';

/** Object that can be used to configure the default options for the card module. */
export interface MatCardConfig {
  /** Default appearance for cards. */
  appearance?: MatCardAppearance;
}

/** Injection token that can be used to provide the default options the card module. */
export const MAT_CARD_CONFIG = new InjectionToken<MatCardConfig>('MAT_CARD_CONFIG');

/**
 * Material Design card component. Cards contain content and actions about a single subject.
 * See https://material.io/design/components/cards.html
 *
 * MatCard provides no behaviors, instead serving as a purely visual treatment.
 */
@Component({
  selector: 'mat-card',
  templateUrl: 'card.html',
  styleUrls: ['card.css'],
  host: {
    'class': 'mat-mdc-card mdc-card',
    '[class.mat-mdc-card-outlined]': 'appearance === "outlined"',
    '[class.mdc-card--outlined]': 'appearance === "outlined"',
  },
  exportAs: 'matCard',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCard {
  @Input() appearance: MatCardAppearance;

  constructor(@Inject(MAT_CARD_CONFIG) @Optional() config?: MatCardConfig) {
    this.appearance = config?.appearance || 'raised';
  }
}

// TODO(jelbourn): add `MatActionCard`, which is a card that acts like a button (and has a ripple).
// Supported in MDC with `.mdc-card__primary-action`. Will require additional a11y docs for users.

/**
 * Title of a card, intended for use within `<mat-card>`. This component is an optional
 * convenience for one variety of card title; any custom title element may be used in its place.
 *
 * MatCardTitle provides no behaviors, instead serving as a purely visual treatment.
 */
@Directive({
  selector: `mat-card-title, [mat-card-title], [matCardTitle]`,
  host: {'class': 'mat-mdc-card-title'},
})
export class MatCardTitle {}

/**
 * Container intended to be used within the `<mat-card>` component. Can contain exactly one
 * `<mat-card-title>`, one `<mat-card-subtitle>` and one content image of any size
 * (e.g. `<img matCardLgImage>`).
 */
@Component({
  selector: 'mat-card-title-group',
  templateUrl: 'card-title-group.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'mat-mdc-card-title-group'},
})
export class MatCardTitleGroup {}

/**
 * Content of a card, intended for use within `<mat-card>`. This component is an optional
 * convenience for use with other convenience elements, such as `<mat-card-title>`; any custom
 * content block element may be used in its place.
 *
 * MatCardContent provides no behaviors, instead serving as a purely visual treatment.
 */
@Directive({
  selector: 'mat-card-content',
  host: {'class': 'mat-mdc-card-content'},
})
export class MatCardContent {}

/**
 * Sub-title of a card, intended for use within `<mat-card>` beneath a `<mat-card-title>`. This
 * component is an optional convenience for use with other convenience elements, such as
 * `<mat-card-title>`.
 *
 * MatCardSubtitle provides no behaviors, instead serving as a purely visual treatment.
 */
@Directive({
  selector: `mat-card-subtitle, [mat-card-subtitle], [matCardSubtitle]`,
  host: {'class': 'mat-mdc-card-subtitle'},
})
export class MatCardSubtitle {}

/**
 * Bottom area of a card that contains action buttons, intended for use within `<mat-card>`.
 * This component is an optional convenience for use with other convenience elements, such as
 * `<mat-card-content>`; any custom action block element may be used in its place.
 *
 * MatCardActions provides no behaviors, instead serving as a purely visual treatment.
 */
@Directive({
  selector: 'mat-card-actions',
  exportAs: 'matCardActions',
  host: {
    'class': 'mat-mdc-card-actions mdc-card__actions',
    '[class.mat-mdc-card-actions-align-end]': 'align === "end"',
  },
})
export class MatCardActions {
  // TODO(jelbourn): deprecate `align` in favor of `actionPosition` or `actionAlignment`
  // as to not conflict with the native `align` attribute.

  /** Position of the actions inside the card. */
  @Input() align: 'start' | 'end' = 'start';

  // TODO(jelbourn): support `.mdc-card__actions--full-bleed`.

  // TODO(jelbourn): support  `.mdc-card__action-buttons` and `.mdc-card__action-icons`.

  // TODO(jelbourn): figure out how to use `.mdc-card__action`, `.mdc-card__action--button`, and
  // `mdc-card__action--icon`. They're used primarily for positioning, which we might be able to
  // do implicitly.
}

/**
 * Header region of a card, intended for use within `<mat-card>`. This header captures
 * a card title, subtitle, and avatar.  This component is an optional convenience for use with
 * other convenience elements, such as `<mat-card-footer>`; any custom header block element may be
 * used in its place.
 *
 * MatCardHeader provides no behaviors, instead serving as a purely visual treatment.
 */
@Component({
  selector: 'mat-card-header',
  templateUrl: 'card-header.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'mat-mdc-card-header'},
})
export class MatCardHeader {}

/**
 * Footer area a card, intended for use within `<mat-card>`.
 * This component is an optional convenience for use with other convenience elements, such as
 * `<mat-card-content>`; any custom footer block element may be used in its place.
 *
 * MatCardFooter provides no behaviors, instead serving as a purely visual treatment.
 */
@Directive({
  selector: 'mat-card-footer',
  host: {'class': 'mat-mdc-card-footer'},
})
export class MatCardFooter {}

// TODO(jelbourn): deprecate the "image" selectors to replace with "media".

// TODO(jelbourn): support `.mdc-card__media-content`.

/**
 * Primary image content for a card, intended for use within `<mat-card>`. Can be applied to
 * any media element, such as `<img>` or `<picture>`.
 *
 * This component is an optional convenience for use with other convenience elements, such as
 * `<mat-card-content>`; any custom media element may be used in its place.
 *
 * MatCardImage provides no behaviors, instead serving as a purely visual treatment.
 */
@Directive({
  selector: '[mat-card-image], [matCardImage]',
  host: {'class': 'mat-mdc-card-image mdc-card__media'},
})
export class MatCardImage {
  // TODO(jelbourn): support `.mdc-card__media--square` and `.mdc-card__media--16-9`.
}

/** Same as `MatCardImage`, but small. */
@Directive({
  selector: '[mat-card-sm-image], [matCardImageSmall]',
  host: {'class': 'mat-mdc-card-sm-image mdc-card__media'},
})
export class MatCardSmImage {}

/** Same as `MatCardImage`, but medium. */
@Directive({
  selector: '[mat-card-md-image], [matCardImageMedium]',
  host: {'class': 'mat-mdc-card-md-image mdc-card__media'},
})
export class MatCardMdImage {}

/** Same as `MatCardImage`, but large. */
@Directive({
  selector: '[mat-card-lg-image], [matCardImageLarge]',
  host: {'class': 'mat-mdc-card-lg-image mdc-card__media'},
})
export class MatCardLgImage {}

/** Same as `MatCardImage`, but extra-large. */
@Directive({
  selector: '[mat-card-xl-image], [matCardImageXLarge]',
  host: {'class': 'mat-mdc-card-xl-image mdc-card__media'},
})
export class MatCardXlImage {}

/**
 * Avatar image content for a card, intended for use within `<mat-card>`. Can be applied to
 * any media element, such as `<img>` or `<picture>`.
 *
 * This component is an optional convenience for use with other convenience elements, such as
 * `<mat-card-title>`; any custom media element may be used in its place.
 *
 * MatCardAvatar provides no behaviors, instead serving as a purely visual treatment.
 */
@Directive({
  selector: '[mat-card-avatar], [matCardAvatar]',
  host: {'class': 'mat-mdc-card-avatar'},
})
export class MatCardAvatar {}
