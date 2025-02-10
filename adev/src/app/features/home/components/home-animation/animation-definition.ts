/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AnimationDefinition, Styles} from '../../animation';
import {AnimationRule} from '../../animation/types';

/**
 * CONSTANTS
 */

// Represents percentage of the total.
// Avoid using large waves (the total shouldn't be too big as well).
// Check meteorShower function for more details.
const FIRST_WAVE_METEORS = 0.05;
const SECOND_WAVE_METEORS = 0.15;
const THIRD_WAVE_METEORS = 0.25;

// Use to increase or decrease the animation duration (i.e. a fine tuning parameter).
// Employed by `timeframe()` and `at()`.
const TIMING_MULTIPLIER = 1.55;

export const ANIM_TIMESTEP = 10; // In milliseconds

/**
 * SELECTORS
 */

const BANNERS_LAYER_ID = 'banners';
const ADEV_BANNER = `${BANNERS_LAYER_ID} >> .adev-banner`;
const LEARN_ANGULAR_BTN = `${BANNERS_LAYER_ID} >> .learn-angular`;

const LOGO_LAYER_ID = 'logo';
const LOGO = `${LOGO_LAYER_ID} >> .logo`;
const SHIELD = `${LOGO_LAYER_ID} >> .shield`;
const SHIELD_MIDDLE = `${LOGO_LAYER_ID} >> .shield-middle`;
const SHIELD_BOTTOM_A_ARC = `${LOGO_LAYER_ID} >> .shield-bottom-a-arc`;
const SHIELD_BOTTOM_EXTENSION = `${LOGO_LAYER_ID} >> .shield-bottom-extension`;
const CAPITAL_A_LETTER = `${LOGO_LAYER_ID} >> .capt-a-letter`;
const N_LETTER = `${LOGO_LAYER_ID} >> .n-letter`;
const G_LETTER = `${LOGO_LAYER_ID} >> .g-letter`;
const U_LETTER = `${LOGO_LAYER_ID} >> .u-letter`;
const L_LETTER = `${LOGO_LAYER_ID} >> .l-letter`;
const A_LETTER = `${LOGO_LAYER_ID} >> .a-letter`;
const R_LETTER = `${LOGO_LAYER_ID} >> .r-letter`;

const UWU_LAYER_ID = 'uwu';

const WORKS_AT_ANY_SCALE_LAYER_ID = 'works-at-any-scale';

const METEOR_FIELD_LAYER_ID = 'meteor-field';
const METEOR_FIELD = `${METEOR_FIELD_LAYER_ID} >> .field`;
const METEORS = `${METEOR_FIELD_LAYER_ID} >> .meteor`;
const METEOR_ID = (id: number) => `${METEOR_FIELD_LAYER_ID} >> .mt-${id}`;

const LOVED_BY_MILLIONS_LAYER_ID = 'loved-by-millions';

const BUILD_FOR_EVERYONE_LAYER_ID = 'build-for-everyone';
const BUILD_FOR_EVERYONE_TITLE = `${BUILD_FOR_EVERYONE_LAYER_ID} >> .title`;

/**
 * ANIMATION/HELPER FUNCTIONS
 */

// Timing functions (they employ `TIMING_MULTIPLIER`) – Use when setting the time of a rule.
const at = (at: number): number => at * TIMING_MULTIPLIER;
const timeframe = (from: number, to: number): [number, number] => [
  from * TIMING_MULTIPLIER,
  to * TIMING_MULTIPLIER,
];

/** Duration: 1 second */
function hideLetter(selector: string, startTime: number): AnimationRule<Styles> {
  return {
    selector,
    timeframe: timeframe(startTime, startTime + 1),
    from: {
      opacity: '1',
    },
    to: {
      opacity: '0',
    },
  };
}

/** Duration: 1 to 2 seconds */
function showMeteor(selector: string, startTime: number): AnimationRule<Styles> {
  const randomizedStartTime = startTime + Math.random(); // Up to +1 second (excl.)
  return {
    selector,
    timeframe: timeframe(randomizedStartTime, randomizedStartTime + 1),
    from: {
      opacity: '0',
      transform: 'translate(200%, 200%) scale(0.3)',
    },
    to: {
      opacity: '1',
      transform: 'translate(0, 0) scale(1)',
    },
  };
}

/** Duration: 1 to 2 seconds  */
function meteorShower(
  startTime: number,
  size: number,
  total: number,
  inUse: Set<number>,
): AnimationDefinition {
  const animations: AnimationRule<Styles>[] = [];

  while (animations.length < size) {
    // We pick a random meteor ID.
    // If `inUse` is nearly full relative to `total`,
    // we might run into a excessive amount of iterations
    // until we fill `animation`. This is why we should keep
    // the wave sizes (and their total) relatively small.
    const id = Math.round(Math.random() * (total - 1) + 1);

    if (!inUse.has(id)) {
      animations.push(showMeteor(METEOR_ID(id), startTime));
      inUse.add(id);
    }
  }

  return animations;
}

/**
 * DEFINITION
 */

/** Generate the animation definition for the home page animation. */
export function generateHomeAnimationDefinition(
  isUwu: boolean,
  meteorCount: number,
): AnimationDefinition {
  // Banners and buttons layer
  // *************************
  const bannersLayerAnim: AnimationDefinition = [
    {
      selector: ADEV_BANNER,
      timeframe: timeframe(2, 3),
      from: {
        transform: 'translateY(0)',
      },
      to: {
        transform: 'translateY(-200px)',
      },
    },
    {
      selector: LEARN_ANGULAR_BTN,
      timeframe: timeframe(2.5, 3.5),
      from: {
        opacity: '1',
      },
      to: {
        opacity: '0',
      },
    },
    {
      selector: LEARN_ANGULAR_BTN,
      at: at(4),
      styles: {
        visibility: 'hidden',
      },
    },
  ];

  // Logo layer animation
  // ********************
  const logoLayerAnim: AnimationDefinition = [
    {
      selector: LOGO,
      timeframe: timeframe(0, 5),
      from: {
        transform: 'translateX(0)',
      },
      to: {
        transform: 'translateX(467px)', // Value based on the 1280x400 SVG view box
      },
    },
    hideLetter(R_LETTER, 1),
    hideLetter(A_LETTER, 1.5),
    hideLetter(L_LETTER, 2),
    hideLetter(U_LETTER, 2.5),
    hideLetter(G_LETTER, 3),
    hideLetter(N_LETTER, 3.5),
    // Make sure that the last letter disappers at the end of layer transition,
    // i.e. 4 + 1 = 5th second end time
    hideLetter(CAPITAL_A_LETTER, 4),
    {
      selector: SHIELD_MIDDLE,
      timeframe: timeframe(5.5, 5.6),
      from: {
        transform: 'scale(1)',
      },
      to: {
        transform: 'scale(0)',
      },
    },
    {
      selector: SHIELD_BOTTOM_A_ARC,
      timeframe: timeframe(5.5, 5.6),
      from: {
        transform: 'scaleY(1)',
      },
      to: {
        transform: 'scaleY(0)',
      },
    },
    {
      selector: SHIELD_BOTTOM_EXTENSION,
      timeframe: timeframe(5.5, 5.6),
      from: {
        transform: 'scale(0)',
      },
      to: {
        transform: 'scale(1)',
      },
    },
    {
      selector: SHIELD,
      timeframe: timeframe(5.5, 10),
      from: {
        transform: 'scale(1) rotate(0deg)',
      },
      to: {
        transform: 'scale(50) rotate(-360deg)',
      },
    },
  ];

  // "UwU logo" layer animation
  // **************************
  const uwuLayerAnimation: AnimationDefinition = [
    {
      selector: UWU_LAYER_ID,
      timeframe: timeframe(0, 5.5),
      from: {
        transform: 'scale(1)',
      },
      to: {
        transform: 'scale(0)',
      },
    },
    {
      selector: UWU_LAYER_ID,
      timeframe: timeframe(4, 5.5),
      from: {
        opacity: '1',
      },
      to: {
        opacity: '0',
      },
    },
  ];

  // "Works at any scale" layer animation
  // ************************************
  const waasLayerAnim: AnimationDefinition = [
    {
      selector: WORKS_AT_ANY_SCALE_LAYER_ID,
      timeframe: timeframe(5.7, 8), // Make sure it appears after SHIELD_MIDDLE disappears.
      from: {
        transform: 'scale(0.1)',
        opacity: '0',
      },
      to: {
        transform: 'scale(1)',
        opacity: '1',
      },
    },
    {
      selector: WORKS_AT_ANY_SCALE_LAYER_ID,
      timeframe: timeframe(11, 12.5),
      from: {
        transform: 'scale(1)',
        opacity: '1',
      },
      to: {
        transform: 'scale(1.5)',
        opacity: '0',
      },
    },
  ];

  // Meteor field layer animation
  // ****************************
  const firstWaveSize = meteorCount * FIRST_WAVE_METEORS;
  const secondWaveSize = meteorCount * SECOND_WAVE_METEORS;
  const thirdWaveSize = meteorCount * THIRD_WAVE_METEORS;

  const meteorsInUse = new Set<number>();
  const firstWave = meteorShower(8, firstWaveSize, meteorCount, meteorsInUse);
  const secondWave = meteorShower(10, secondWaveSize, meteorCount, meteorsInUse);
  const thirdWave = meteorShower(12, thirdWaveSize, meteorCount, meteorsInUse);
  const lastWaveStart = 16;

  // For the last wave, just use the remaining meteors (don't use `meteorShower`).
  const lastWave: AnimationRule<Styles>[] = [];
  for (let id = 1; id <= meteorCount; id++) {
    if (!meteorsInUse.has(id)) {
      lastWave.push(showMeteor(METEOR_ID(id), lastWaveStart));
    }
  }

  const meteorFieldLayerAnim: AnimationDefinition = [
    {
      selector: METEOR_FIELD,
      at: at(7),
      styles: {
        display: 'flex',
      },
    },
    {
      selector: METEOR_FIELD,
      timeframe: timeframe(8, 18),
      from: {
        transform: 'scale(1.42)',
      },
      to: {
        transform: 'scale(1)',
      },
    },
    ...firstWave,
    ...secondWave,
    ...thirdWave,
    ...lastWave,
    {
      selector: METEORS,
      timeframe: timeframe(19.5, 21),
      from: {
        transform: 'translate(0, 0) scale(1)',
      },
      to: {
        transform: 'translate(-200%, -200%) scale(0.3)',
      },
    },
    {
      selector: METEOR_FIELD,
      timeframe: timeframe(19.5, 21),
      from: {
        opacity: '1',
      },
      to: {
        opacity: '0',
      },
    },
    {
      selector: METEOR_FIELD,
      at: at(22),
      styles: {
        display: 'none',
      },
    },
  ];

  // "Loved by millions" layer animation
  // ***********************************
  const lovedByMillionsAnim: AnimationDefinition = [
    {
      selector: LOVED_BY_MILLIONS_LAYER_ID,
      timeframe: timeframe(14, 15.5),
      from: {
        transform: 'scale(0.75)',
        opacity: '0',
      },
      to: {
        transform: 'scale(1)',
        opacity: '1',
      },
    },
    {
      selector: LOVED_BY_MILLIONS_LAYER_ID,
      timeframe: timeframe(19, 20.5),
      from: {
        transform: 'scale(1)',
        opacity: '1',
      },
      to: {
        transform: 'scale(1.5)',
        opacity: '0',
      },
    },
  ];

  // "Build for everyone" layer
  // **************************
  const buildForEveryoneAnim: AnimationDefinition = [
    {
      selector: BUILD_FOR_EVERYONE_LAYER_ID,
      timeframe: timeframe(22, 25),
      from: {
        transform: 'scale(0.75)',
        opacity: '0',
      },
      to: {
        transform: 'scale(1)',
        opacity: '1',
      },
    },
    {
      selector: BUILD_FOR_EVERYONE_TITLE,
      timeframe: timeframe(23, 25),
      from: {
        'background-position-x': '100%',
      },
      to: {
        'background-position-x': '0',
      },
    },
    {
      selector: BUILD_FOR_EVERYONE_LAYER_ID,
      timeframe: timeframe(29, 31.5),
      from: {
        opacity: '1',
      },
      to: {
        opacity: '0',
      },
    },
  ];

  return [
    ...bannersLayerAnim,
    ...(!isUwu ? logoLayerAnim : uwuLayerAnimation),
    ...waasLayerAnim,
    ...meteorFieldLayerAnim,
    ...lovedByMillionsAnim,
    ...buildForEveryoneAnim,
  ];
}
