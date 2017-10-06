/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Directive,
  Input,
} from '@angular/core';


/**
 * Content of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: 'mat-card-content',
  host: {'class': 'mat-card-content'}
})
export class MatCardContent {}

/**
 * Title of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: `mat-card-title, [mat-card-title], [matCardTitle]`,
  host: {
    'class': 'mat-card-title'
  }
})
export class MatCardTitle {}

/**
 * Sub-title of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: `mat-card-subtitle, [mat-card-subtitle], [matCardSubtitle]`,
  host: {
    'class': 'mat-card-subtitle'
  }
})
export class MatCardSubtitle {}

/**
 * Action section of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: 'mat-card-actions',
  exportAs: 'matCardActions',
  host: {
    'class': 'mat-card-actions',
    '[class.mat-card-actions-align-end]': 'align === "end"',
  }
})
export class MatCardActions {
  /** Position of the actions inside the card. */
  @Input() align: 'start' | 'end' = 'start';
}

/**
 * Footer of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: 'mat-card-footer',
  host: {'class': 'mat-card-footer'}
})
export class MatCardFooter {}

/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[mat-card-image], [matCardImage]',
  host: {'class': 'mat-card-image'}
})
export class MatCardImage {}

/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[mat-card-sm-image], [matCardImageSmall]',
  host: {'class': 'mat-card-sm-image'}
})
export class MatCardSmImage {}

/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[mat-card-md-image], [matCardImageMedium]',
  host: {'class': 'mat-card-md-image'}
})
export class MatCardMdImage {}

/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[mat-card-lg-image], [matCardImageLarge]',
  host: {'class': 'mat-card-lg-image'}
})
export class MatCardLgImage {}

/**
 * Large image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[mat-card-xl-image], [matCardImageXLarge]',
  host: {'class': 'mat-card-xl-image'}
})
export class MatCardXlImage {}

/**
 * Avatar image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[mat-card-avatar], [matCardAvatar]',
  host: {'class': 'mat-card-avatar'}
})
export class MatCardAvatar {}


/**
 * A basic content container component that adds the styles of a Material design card.
 *
 * While this component can be used alone, it also provides a number
 * of preset styles for common card sections, including:
 * - mat-card-title
 * - mat-card-subtitle
 * - mat-card-content
 * - mat-card-actions
 * - mat-card-footer
 */
@Component({
  moduleId: module.id,
  selector: 'mat-card',
  exportAs: 'matCard',
  templateUrl: 'card.html',
  styleUrls: ['card.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'mat-card'}
})
export class MatCard {}


/**
 * Component intended to be used within the `<mat-card>` component. It adds styles for a
 * preset header section (i.e. a title, subtitle, and avatar layout).
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'mat-card-header',
  templateUrl: 'card-header.html',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'mat-card-header'}
})
export class MatCardHeader {}


/**
 * Component intended to be used within the <mat-card> component. It adds styles for a preset
 * layout that groups an image with a title section.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'mat-card-title-group',
  templateUrl: 'card-title-group.html',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'mat-card-title-group'}
})
export class MatCardTitleGroup {}
