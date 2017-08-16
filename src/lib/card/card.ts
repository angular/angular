/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
  selector: 'md-card-content, mat-card-content',
  host: {'class': 'mat-card-content'}
})
export class MdCardContent {}

/**
 * Title of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: `md-card-title, mat-card-title, [md-card-title], [mat-card-title],
             [mdCardTitle], [matCardTitle]`,
  host: {
    'class': 'mat-card-title'
  }
})
export class MdCardTitle {}

/**
 * Sub-title of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: `md-card-subtitle, mat-card-subtitle, [md-card-subtitle], [mat-card-subtitle],
             [mdCardSubtitle], [matCardSubtitle]`,
  host: {
    'class': 'mat-card-subtitle'
  }
})
export class MdCardSubtitle {}

/**
 * Action section of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: 'md-card-actions, mat-card-actions',
  host: {
    'class': 'mat-card-actions',
    '[class.mat-card-actions-align-end]': 'align === "end"',
  }
})
export class MdCardActions {
  /** Position of the actions inside the card. */
  @Input() align: 'start' | 'end' = 'start';
}

/**
 * Footer of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
@Directive({
  selector: 'md-card-footer, mat-card-footer',
  host: {'class': 'mat-card-footer'}
})
export class MdCardFooter {}

/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[md-card-image], [mat-card-image], [mdCardImage], [matCardImage]',
  host: {'class': 'mat-card-image'}
})
export class MdCardImage {}

/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[md-card-sm-image], [mat-card-sm-image], [mdCardImageSmall], [matCardImageSmall]',
  host: {'class': 'mat-card-sm-image'}
})
export class MdCardSmImage {}

/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[md-card-md-image], [mat-card-md-image], [mdCardImageMedium], [matCardImageMedium]',
  host: {'class': 'mat-card-md-image'}
})
export class MdCardMdImage {}

/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[md-card-lg-image], [mat-card-lg-image], [mdCardImageLarge], [matCardImageLarge]',
  host: {'class': 'mat-card-lg-image'}
})
export class MdCardLgImage {}

/**
 * Large image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[md-card-xl-image], [mat-card-xl-image], [mdCardImageXLarge], [matCardImageXLarge]',
  host: {'class': 'mat-card-xl-image'}
})
export class MdCardXlImage {}

/**
 * Avatar image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
@Directive({
  selector: '[md-card-avatar], [mat-card-avatar], [mdCardAvatar], [matCardAvatar]',
  host: {'class': 'mat-card-avatar'}
})
export class MdCardAvatar {}


/**
 * A basic content container component that adds the styles of a Material design card.
 *
 * While this component can be used alone, it also provides a number
 * of preset styles for common card sections, including:
 * - md-card-title
 * - md-card-subtitle
 * - md-card-content
 * - md-card-actions
 * - md-card-footer
 */
@Component({
  moduleId: module.id,
  selector: 'md-card, mat-card',
  templateUrl: 'card.html',
  styleUrls: ['card.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'mat-card'}
})
export class MdCard {}


/**
 * Component intended to be used within the `<md-card>` component. It adds styles for a
 * preset header section (i.e. a title, subtitle, and avatar layout).
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-card-header, mat-card-header',
  templateUrl: 'card-header.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'mat-card-header'}
})
export class MdCardHeader {}


/**
 * Component intended to be used within the <md-card> component. It adds styles for a preset
 * layout that groups an image with a title section.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-card-title-group, mat-card-title-group',
  templateUrl: 'card-title-group.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'mat-card-title-group'}
})
export class MdCardTitleGroup {}
