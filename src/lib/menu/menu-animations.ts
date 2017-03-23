import{
  trigger,
  state,
  style,
  animate,
  transition,
  AnimationTriggerMetadata,
} from '@angular/animations';

/**
 * Below are all the animations for the md-menu component.
 * Animation duration and timing values are based on AngularJS Material.
 */


/**
 * This animation controls the menu panel's entry and exit from the page.
 *
 * When the menu panel is added to the DOM, it scales in and fades in its border.
 *
 * When the menu panel is removed from the DOM, it simply fades out after a brief
 * delay to display the ripple.
 */

// TODO(kara): switch to :enter and :leave once Mobile Safari is sorted out.
export const transformMenu: AnimationTriggerMetadata = trigger('transformMenu', [
  state('showing', style({
    opacity: 1,
    transform: `scale(1)`
  })),
  transition('void => *', [
    style({
      opacity: 0,
      transform: `scale(0)`
    }),
    animate(`200ms cubic-bezier(0.25, 0.8, 0.25, 1)`)
  ]),
  transition('* => void', [
    animate('50ms 100ms linear', style({opacity: 0}))
  ])
]);

/**
 * This animation fades in the background color and content of the menu panel
 * after its containing element is scaled in.
 */
export const fadeInItems: AnimationTriggerMetadata = trigger('fadeInItems', [
  state('showing', style({opacity: 1})),
  transition('void => *', [
    style({opacity: 0}),
    animate(`200ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)`)
  ])
]);
