import {
  NgModule,
  ModuleWithProviders,
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Directive
} from '@angular/core';
import {DefaultStyleCompatibilityModeModule} from '../core';


/**
 * Content of a card, needed as it's used as a selector in the API.
 */
@Directive({
  selector: 'md-card-content, mat-card-content'
})
export class MdCardContent {}

/**
 * Title of a card, needed as it's used as a selector in the API.
 */
@Directive({
  selector: 'md-card-title, mat-card-title'
})
export class MdCardTitle {}

/**
 * Sub-title of a card, needed as it's used as a selector in the API.
 */
@Directive({
  selector: 'md-card-subtitle, mat-card-subtitle'
})
export class MdCardSubtitle {}

/**
 * Action section of a card, needed as it's used as a selector in the API.
 */
@Directive({
  selector: 'md-card-actions, mat-card-actions'
})
export class MdCardActions {}

/**
 * Footer of a card, needed as it's used as a selector in the API.
 */
@Directive({
  selector: 'md-card-footer, mat-card-footer'
})
export class MdCardFooter {}


/*

<md-card> is a basic content container component that adds the styles of a material design card.

While you can use this component alone,
it also provides a number of preset styles for common card sections, including:
 - md-card-title
 - md-card-subtitle
 - md-card-content
 - md-card-actions
 - md-card-footer

 You can see some examples of cards here:
 http://embed.plnkr.co/s5O4YcyvbLhIApSrIhtj/

 TODO(kara): update link to demo site when it exists

*/

@Component({
  moduleId: module.id,
  selector: 'md-card, mat-card',
  templateUrl: 'card.html',
  styleUrls: ['card.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdCard {}


/*  The following components don't have any behavior.
 They simply use content projection to wrap user content
 for flex layout purposes in <md-card> (and thus allow a cleaner, boilerplate-free API).


<md-card-header> is a component intended to be used within the <md-card> component.
It adds styles for a preset header section (i.e. a title, subtitle, and avatar layout).

You can see an example of a card with a header here:
http://embed.plnkr.co/tvJl19z3gZTQd6WmwkIa/

TODO(kara): update link to demo site when it exists
*/

@Component({
  moduleId: module.id,
  selector: 'md-card-header, mat-card-header',
  templateUrl: 'card-header.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdCardHeader {}

/*

<md-card-title-group> is a component intended to be used within the <md-card> component.
It adds styles for a preset layout that groups an image with a title section.

You can see an example of a card with a title-group section here:
http://embed.plnkr.co/EDfgCF9eKcXjini1WODm/

TODO(kara): update link to demo site when it exists
*/

@Component({
  moduleId: module.id,
  selector: 'md-card-title-group, mat-card-title-group',
  templateUrl: 'card-title-group.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdCardTitleGroup {}


@NgModule({
  imports: [DefaultStyleCompatibilityModeModule],
  exports: [
    MdCard,
    MdCardHeader,
    MdCardTitleGroup,
    MdCardContent,
    MdCardTitle,
    MdCardSubtitle,
    MdCardActions,
    MdCardFooter,
    DefaultStyleCompatibilityModeModule,
  ],
  declarations: [
    MdCard, MdCardHeader, MdCardTitleGroup, MdCardContent, MdCardTitle, MdCardSubtitle,
    MdCardActions, MdCardFooter
  ],
})
export class MdCardModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdCardModule,
      providers: []
    };
  }
}
