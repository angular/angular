/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AUTO_STYLE, AnimationMetadata, AnimationMetadataType, animate, group, keyframes, sequence, style, ɵStyleData} from '@angular/animations';

import {Animation} from '../../src/dsl/animation';
import {AnimationTimelineInstruction} from '../../src/dsl/animation_timeline_instruction';
import {validateAnimationSequence} from '../../src/dsl/animation_validator_visitor';

export function main() {
  describe('Animation', () => {
    describe('validation', () => {
      it('should throw an error if one or more but not all keyframes() styles contain offsets',
         () => {
           const steps = animate(1000, keyframes([
                                   style({opacity: 0}),
                                   style({opacity: 1, offset: 1}),
                                 ]));

           expect(() => { validateAndThrowAnimationSequence(steps); })
               .toThrowError(
                   /Not all style\(\) steps within the declared keyframes\(\) contain offsets/);
         });

      it('should throw an error if not all offsets are between 0 and 1', () => {
        let steps = animate(1000, keyframes([
                              style({opacity: 0, offset: -1}),
                              style({opacity: 1, offset: 1}),
                            ]));

        expect(() => {
          validateAndThrowAnimationSequence(steps);
        }).toThrowError(/Please ensure that all keyframe offsets are between 0 and 1/);

        steps = animate(1000, keyframes([
                          style({opacity: 0, offset: 0}),
                          style({opacity: 1, offset: 1.1}),
                        ]));

        expect(() => {
          validateAndThrowAnimationSequence(steps);
        }).toThrowError(/Please ensure that all keyframe offsets are between 0 and 1/);
      });

      it('should throw an error if a smaller offset shows up after a bigger one', () => {
        let steps = animate(1000, keyframes([
                              style({opacity: 0, offset: 1}),
                              style({opacity: 1, offset: 0}),
                            ]));

        expect(() => {
          validateAndThrowAnimationSequence(steps);
        }).toThrowError(/Please ensure that all keyframe offsets are in order/);
      });

      it('should throw an error if any styles overlap during parallel animations', () => {
        const steps = group([
          sequence([
            // 0 -> 2000ms
            style({opacity: 0}), animate('500ms', style({opacity: .25})),
            animate('500ms', style({opacity: .5})), animate('500ms', style({opacity: .75})),
            animate('500ms', style({opacity: 1}))
          ]),
          animate('1s 500ms', keyframes([
                    // 0 -> 1500ms
                    style({width: 0}),
                    style({opacity: 1, width: 1000}),
                  ]))
        ]);

        expect(() => { validateAndThrowAnimationSequence(steps); })
            .toThrowError(
                /The CSS property "opacity" that exists between the times of "0ms" and "2000ms" is also being animated in a parallel animation between the times of "0ms" and "1500ms"/);
      });

      it('should throw an error if an animation time is invalid', () => {
        const steps = [animate('500xs', style({opacity: 1}))];

        expect(() => {
          validateAndThrowAnimationSequence(steps);
        }).toThrowError(/The provided timing value "500xs" is invalid/);

        const steps2 = [animate('500ms 500ms 500ms ease-out', style({opacity: 1}))];

        expect(() => {
          validateAndThrowAnimationSequence(steps2);
        }).toThrowError(/The provided timing value "500ms 500ms 500ms ease-out" is invalid/);
      });
    });

    describe('keyframe building', () => {
      describe('style() / animate()', () => {
        it('should produce a balanced series of keyframes given a sequence of animate steps',
           () => {
             const steps = [
               style({width: 0}), animate(1000, style({height: 50})),
               animate(1000, style({width: 100})), animate(1000, style({height: 150})),
               animate(1000, style({width: 200}))
             ];

             const players = invokeAnimationSequence(steps);
             expect(players[0].keyframes).toEqual([
               {height: AUTO_STYLE, width: 0, offset: 0},
               {height: 50, width: 0, offset: .25},
               {height: 50, width: 100, offset: .5},
               {height: 150, width: 100, offset: .75},
               {height: 150, width: 200, offset: 1},
             ]);
           });

        it('should fill in missing starting steps when a starting `style()` value is not used',
           () => {
             const steps = [animate(1000, style({width: 999}))];

             const players = invokeAnimationSequence(steps);
             expect(players[0].keyframes).toEqual([
               {width: AUTO_STYLE, offset: 0}, {width: 999, offset: 1}
             ]);
           });

        it('should merge successive style() calls together before an animate() call', () => {
          const steps = [
            style({width: 0}), style({height: 0}), style({width: 200}), style({opacity: 0}),
            animate(1000, style({width: 100, height: 400, opacity: 1}))
          ];

          const players = invokeAnimationSequence(steps);
          expect(players[0].keyframes).toEqual([
            {width: 200, height: 0, opacity: 0, offset: 0},
            {width: 100, height: 400, opacity: 1, offset: 1}
          ]);
        });

        it('should not merge in successive style() calls to the previous animate() keyframe',
           () => {
             const steps = [
               style({opacity: 0}), animate(1000, style({opacity: .5})), style({opacity: .6}),
               animate(1000, style({opacity: 1}))
             ];

             const players = invokeAnimationSequence(steps);
             const keyframes = humanizeOffsets(players[0].keyframes, 4);

             expect(keyframes).toEqual([
               {opacity: 0, offset: 0},
               {opacity: .5, offset: .4998},
               {opacity: .6, offset: .5002},
               {opacity: 1, offset: 1},
             ]);
           });

        it('should support an easing value that uses cubic-bezier(...)', () => {
          const steps = [
            style({opacity: 0}),
            animate('1s cubic-bezier(.29, .55 ,.53 ,1.53)', style({opacity: 1}))
          ];

          const player = invokeAnimationSequence(steps)[0];
          const firstKeyframe = player.keyframes[0];
          const firstKeyframeEasing = firstKeyframe['easing'] as string;
          expect(firstKeyframeEasing.replace(/\s+/g, '')).toEqual('cubic-bezier(.29,.55,.53,1.53)');
        });
      });

      describe('sequence()', () => {
        it('should not produce extra timelines when multiple sequences are used within each other',
           () => {
             const steps = [
               style({width: 0}), animate(1000, style({width: 100})), sequence([
                 animate(1000, style({width: 200})),
                 sequence([animate(1000, style({width: 300}))])
               ]),
               animate(1000, style({width: 400})), sequence([animate(1000, style({width: 500}))])
             ];

             const players = invokeAnimationSequence(steps);
             expect(players[0].keyframes).toEqual([
               {width: 0, offset: 0}, {width: 100, offset: .2}, {width: 200, offset: .4},
               {width: 300, offset: .6}, {width: 400, offset: .8}, {width: 500, offset: 1}
             ]);
           });

        it('should produce a 1ms animation step if a style call exists before sequence within a call to animate()',
           () => {
             const steps = [
               style({width: 100}), sequence([
                 animate(1000, style({width: 200})),
               ])
             ];

             const players = invokeAnimationSequence(steps);
             expect(humanizeOffsets(players[0].keyframes, 4)).toEqual([
               {width: 100, offset: 0}, {width: 100, offset: .001}, {width: 200, offset: 1}
             ]);
           });

        it('should create a new timeline after a sequence if group() or keyframe() commands are used within',
           () => {
             const steps = [
               style({width: 100, height: 100}), animate(1000, style({width: 150, height: 150})),
               sequence([
                 group([
                   animate(1000, style({height: 200})),
                 ]),
                 animate(1000, keyframes([style({width: 180}), style({width: 200})]))
               ]),
               animate(1000, style({width: 500, height: 500}))
             ];

             const players = invokeAnimationSequence(steps);
             expect(players.length).toEqual(4);

             const finalPlayer = players[players.length - 1];
             expect(finalPlayer.keyframes).toEqual([
               {width: 200, height: 200, offset: 0}, {width: 500, height: 500, offset: 1}
             ]);
           });
      });

      describe('keyframes()', () => {
        it('should produce a sub timeline when `keyframes()` is used within a sequence', () => {
          const steps = [
            animate(1000, style({opacity: .5})), animate(1000, style({opacity: 1})),
            animate(
                1000, keyframes([style({height: 0}), style({height: 100}), style({height: 50})])),
            animate(1000, style({height: 0, opacity: 0}))
          ];

          const players = invokeAnimationSequence(steps);
          expect(players.length).toEqual(3);

          const player0 = players[0];
          expect(player0.delay).toEqual(0);
          expect(player0.keyframes).toEqual([
            {opacity: AUTO_STYLE, offset: 0},
            {opacity: .5, offset: .5},
            {opacity: 1, offset: 1},
          ]);

          const subPlayer = players[1];
          expect(subPlayer.delay).toEqual(2000);
          expect(subPlayer.keyframes).toEqual([
            {height: 0, offset: 0},
            {height: 100, offset: .5},
            {height: 50, offset: 1},
          ]);

          const player1 = players[2];
          expect(player1.delay).toEqual(3000);
          expect(player1.keyframes).toEqual([
            {opacity: 1, height: 50, offset: 0}, {opacity: 0, height: 0, offset: 1}
          ]);
        });

        it('should propagate inner keyframe style data to the parent timeline if used afterwards',
           () => {
             const steps = [
               style({opacity: 0}), animate(1000, style({opacity: .5})),
               animate(1000, style({opacity: 1})), animate(1000, keyframes([
                                                             style({color: 'red'}),
                                                             style({color: 'blue'}),
                                                           ])),
               animate(1000, style({color: 'green', opacity: 0}))
             ];

             const players = invokeAnimationSequence(steps);
             const finalPlayer = players[players.length - 1];
             expect(finalPlayer.keyframes).toEqual([
               {opacity: 1, color: 'blue', offset: 0}, {opacity: 0, color: 'green', offset: 1}
             ]);
           });

        it('should feed in starting data into inner keyframes if used in an style step beforehand',
           () => {
             const steps = [
               animate(1000, style({opacity: .5})), animate(1000, keyframes([
                                                              style({opacity: .8, offset: .5}),
                                                              style({opacity: 1, offset: 1}),
                                                            ]))
             ];

             const players = invokeAnimationSequence(steps);
             expect(players.length).toEqual(2);

             const topPlayer = players[0];
             expect(topPlayer.keyframes).toEqual([
               {opacity: AUTO_STYLE, offset: 0}, {opacity: .5, offset: 1}
             ]);

             const subPlayer = players[1];
             expect(subPlayer.keyframes).toEqual([
               {opacity: .5, offset: 0}, {opacity: .8, offset: 0.5}, {opacity: 1, offset: 1}
             ]);
           });

        it('should set the easing value as an easing value for the entire timeline', () => {
          const steps = [
            style({opacity: 0}), animate(1000, style({opacity: .5})),
            animate(
                '1s ease-out',
                keyframes([style({opacity: .8, offset: .5}), style({opacity: 1, offset: 1})]))
          ];

          const player = invokeAnimationSequence(steps)[1];
          expect(player.easing).toEqual('ease-out');
        });

        it('should combine the starting time + the given delay as the delay value for the animated keyframes',
           () => {
             const steps = [
               style({opacity: 0}), animate(500, style({opacity: .5})),
               animate(
                   '1s 2s ease-out',
                   keyframes([style({opacity: .8, offset: .5}), style({opacity: 1, offset: 1})]))
             ];

             const player = invokeAnimationSequence(steps)[1];
             expect(player.delay).toEqual(2500);
           });

        it('should not leak in additional styles used later on after keyframe styles have already been declared',
           () => {
             const steps = [
               animate(1000, style({height: '50px'})),
               animate(
                   2000, keyframes([
                     style({left: '0', transform: 'rotate(0deg)', offset: 0}),
                     style({
                       left: '40%',
                       transform: 'rotate(250deg) translateY(-200px)',
                       offset: .33
                     }),
                     style(
                         {left: '60%', transform: 'rotate(180deg) translateY(200px)', offset: .66}),
                     style({left: 'calc(100% - 100px)', transform: 'rotate(0deg)', offset: 1}),
                   ])),
               group([animate('2s', style({width: '200px'}))]),
               animate('2s', style({height: '300px'})),
               group([animate('2s', style({height: '500px', width: '500px'}))])
             ];

             const players = invokeAnimationSequence(steps);
             expect(players.length).toEqual(5);

             const firstPlayerKeyframes = players[0].keyframes;
             expect(firstPlayerKeyframes[0]['width']).toBeFalsy();
             expect(firstPlayerKeyframes[1]['width']).toBeFalsy();
             expect(firstPlayerKeyframes[0]['height']).toEqual(AUTO_STYLE);
             expect(firstPlayerKeyframes[1]['height']).toEqual('50px');

             const keyframePlayerKeyframes = players[1].keyframes;
             expect(keyframePlayerKeyframes[0]['width']).toBeFalsy();
             expect(keyframePlayerKeyframes[0]['height']).toBeFalsy();

             const groupPlayerKeyframes = players[2].keyframes;
             expect(groupPlayerKeyframes[0]['width']).toEqual(AUTO_STYLE);
             expect(groupPlayerKeyframes[1]['width']).toEqual('200px');
             expect(groupPlayerKeyframes[0]['height']).toBeFalsy();
             expect(groupPlayerKeyframes[1]['height']).toBeFalsy();

             const secondToFinalAnimatePlayerKeyframes = players[3].keyframes;
             expect(secondToFinalAnimatePlayerKeyframes[0]['width']).toBeFalsy();
             expect(secondToFinalAnimatePlayerKeyframes[1]['width']).toBeFalsy();
             expect(secondToFinalAnimatePlayerKeyframes[0]['height']).toEqual('50px');
             expect(secondToFinalAnimatePlayerKeyframes[1]['height']).toEqual('300px');

             const finalAnimatePlayerKeyframes = players[4].keyframes;
             expect(finalAnimatePlayerKeyframes[0]['width']).toEqual('200px');
             expect(finalAnimatePlayerKeyframes[1]['width']).toEqual('500px');
             expect(finalAnimatePlayerKeyframes[0]['height']).toEqual('300px');
             expect(finalAnimatePlayerKeyframes[1]['height']).toEqual('500px');
           });

        it('should respect offsets if provided directly within the style data', () => {
          const steps = animate(1000, keyframes([
                                  style({opacity: 0, offset: 0}), style({opacity: .6, offset: .6}),
                                  style({opacity: 1, offset: 1})
                                ]));

          const players = invokeAnimationSequence(steps);
          expect(players.length).toEqual(1);
          const player = players[0];

          expect(player.keyframes).toEqual([
            {opacity: 0, offset: 0}, {opacity: .6, offset: .6}, {opacity: 1, offset: 1}
          ]);
        });

        it('should respect offsets if provided directly within the style metadata type', () => {
          const steps =
              animate(1000, keyframes([
                        {type: AnimationMetadataType.Style, offset: 0, styles: {opacity: 0}},
                        {type: AnimationMetadataType.Style, offset: .4, styles: {opacity: .4}},
                        {type: AnimationMetadataType.Style, offset: 1, styles: {opacity: 1}},
                      ]));

          const players = invokeAnimationSequence(steps);
          expect(players.length).toEqual(1);
          const player = players[0];

          expect(player.keyframes).toEqual([
            {opacity: 0, offset: 0}, {opacity: .4, offset: .4}, {opacity: 1, offset: 1}
          ]);
        });
      });

      describe('group()', () => {
        it('should properly tally style data within a group() for use in a follow-up animate() step',
           () => {
             const steps = [
               style({width: 0, height: 0}), animate(1000, style({width: 20, height: 50})),
               group([animate('1s 1s', style({width: 200})), animate('1s', style({height: 500}))]),
               animate(1000, style({width: 1000, height: 1000}))
             ];

             const players = invokeAnimationSequence(steps);
             expect(players.length).toEqual(4);

             const player0 = players[0];
             expect(player0.duration).toEqual(1000);
             expect(player0.keyframes).toEqual([
               {width: 0, height: 0, offset: 0}, {width: 20, height: 50, offset: 1}
             ]);

             const gPlayer1 = players[1];
             expect(gPlayer1.duration).toEqual(2000);
             expect(gPlayer1.delay).toEqual(1000);
             expect(gPlayer1.keyframes).toEqual([
               {width: 20, offset: 0}, {width: 20, offset: .5}, {width: 200, offset: 1}
             ]);

             const gPlayer2 = players[2];
             expect(gPlayer2.duration).toEqual(1000);
             expect(gPlayer2.delay).toEqual(1000);
             expect(gPlayer2.keyframes).toEqual([
               {height: 50, offset: 0}, {height: 500, offset: 1}
             ]);

             const player1 = players[3];
             expect(player1.duration).toEqual(1000);
             expect(player1.delay).toEqual(3000);
             expect(player1.keyframes).toEqual([
               {width: 200, height: 500, offset: 0}, {width: 1000, height: 1000, offset: 1}
             ]);
           });

        it('should support groups with nested sequences', () => {
          const steps = [group([
            sequence([
              style({opacity: 0}),
              animate(1000, style({opacity: 1})),
            ]),
            sequence([
              style({width: 0}),
              animate(1000, style({width: 200})),
            ])
          ])];

          const players = invokeAnimationSequence(steps);
          expect(players.length).toEqual(2);

          const gPlayer1 = players[0];
          expect(gPlayer1.delay).toEqual(0);
          expect(gPlayer1.keyframes).toEqual([
            {opacity: 0, offset: 0},
            {opacity: 1, offset: 1},
          ]);

          const gPlayer2 = players[1];
          expect(gPlayer1.delay).toEqual(0);
          expect(gPlayer2.keyframes).toEqual([{width: 0, offset: 0}, {width: 200, offset: 1}]);
        });

        it('should respect delays after group entries', () => {
          const steps = [
            style({width: 0, height: 0}), animate(1000, style({width: 50, height: 50})), group([
              animate(1000, style({width: 100})),
              animate(1000, style({height: 100})),
            ]),
            animate('1s 1s', style({height: 200, width: 200}))
          ];

          const players = invokeAnimationSequence(steps);
          expect(players.length).toEqual(4);

          const finalPlayer = players[players.length - 1];
          expect(finalPlayer.delay).toEqual(2000);
          expect(finalPlayer.duration).toEqual(2000);
          expect(finalPlayer.keyframes).toEqual([
            {width: 100, height: 100, offset: 0},
            {width: 100, height: 100, offset: .5},
            {width: 200, height: 200, offset: 1},
          ]);
        });

        it('should respect delays after multiple calls to group()', () => {
          const steps = [
            group([animate('2s', style({opacity: 1})), animate('2s', style({width: '100px'}))]),
            animate(2000, style({width: 0, opacity: 0})),
            group([animate('2s', style({opacity: 1})), animate('2s', style({width: '200px'}))]),
            animate(2000, style({width: 0, opacity: 0}))
          ];

          const players = invokeAnimationSequence(steps);
          const middlePlayer = players[2];
          expect(middlePlayer.delay).toEqual(2000);
          expect(middlePlayer.duration).toEqual(2000);

          const finalPlayer = players[players.length - 1];
          expect(finalPlayer.delay).toEqual(6000);
          expect(finalPlayer.duration).toEqual(2000);
        });
      });

      describe('timing values', () => {
        it('should properly combine an easing value with a delay into a set of three keyframes',
           () => {
             const steps: AnimationMetadata[] =
                 [style({opacity: 0}), animate('3s 1s ease-out', style({opacity: 1}))];

             const player = invokeAnimationSequence(steps)[0];
             expect(player.keyframes).toEqual([
               {opacity: 0, offset: 0}, {opacity: 0, offset: .25, easing: 'ease-out'},
               {opacity: 1, offset: 1}
             ]);
           });

        it('should allow easing values to exist for each animate() step', () => {
          const steps: AnimationMetadata[] = [
            style({width: 0}), animate('1s linear', style({width: 10})),
            animate('2s ease-out', style({width: 20})), animate('1s ease-in', style({width: 30}))
          ];

          const players = invokeAnimationSequence(steps);
          expect(players.length).toEqual(1);

          const player = players[0];
          expect(player.keyframes).toEqual([
            {width: 0, offset: 0, easing: 'linear'}, {width: 10, offset: .25, easing: 'ease-out'},
            {width: 20, offset: .75, easing: 'ease-in'}, {width: 30, offset: 1}
          ]);
        });

        it('should produce a top-level timeline only for the duration that is set as before a group kicks in',
           () => {
             const steps: AnimationMetadata[] = [
               style({width: 0, height: 0, opacity: 0}),
               animate('1s', style({width: 100, height: 100, opacity: .2})), group([
                 animate('500ms 1s', style({width: 500})), animate('1s', style({height: 500})),
                 sequence([
                   animate(500, style({opacity: .5})),
                   animate(500, style({opacity: .6})),
                   animate(500, style({opacity: .7})),
                   animate(500, style({opacity: 1})),
                 ])
               ])
             ];

             const player = invokeAnimationSequence(steps)[0];
             expect(player.duration).toEqual(1000);
             expect(player.delay).toEqual(0);
           });

        it('should offset group() and keyframe() timelines with a delay which is the current time of the previous player when called',
           () => {
             const steps: AnimationMetadata[] = [
               style({width: 0, height: 0}),
               animate('1500ms linear', style({width: 10, height: 10})), group([
                 animate(1000, style({width: 500, height: 500})),
                 animate(2000, style({width: 500, height: 500}))
               ]),
               animate(1000, keyframes([
                         style({width: 200}),
                         style({width: 500}),
                       ]))
             ];

             const players = invokeAnimationSequence(steps);
             expect(players[0].delay).toEqual(0);     // top-level animation
             expect(players[1].delay).toEqual(1500);  // first entry in group()
             expect(players[2].delay).toEqual(1500);  // second entry in group()
             expect(players[3].delay).toEqual(3500);  // animate(...keyframes())
           });
      });

      describe('state based data', () => {
        it('should create an empty animation if there are zero animation steps', () => {
          const steps: AnimationMetadata[] = [];

          const fromStyles: ɵStyleData[] = [{background: 'blue', height: 100}];

          const toStyles: ɵStyleData[] = [{background: 'red'}];

          const player = invokeAnimationSequence(steps, fromStyles, toStyles)[0];
          expect(player.duration).toEqual(0);
          expect(player.keyframes).toEqual([]);
        });

        it('should produce an animation from start to end between the to and from styles if there are animate steps in between',
           () => {
             const steps: AnimationMetadata[] = [animate(1000)];

             const fromStyles: ɵStyleData[] = [{background: 'blue', height: 100}];

             const toStyles: ɵStyleData[] = [{background: 'red'}];

             const players = invokeAnimationSequence(steps, fromStyles, toStyles);
             expect(players[0].keyframes).toEqual([
               {background: 'blue', height: 100, offset: 0},
               {background: 'red', height: AUTO_STYLE, offset: 1}
             ]);
           });

        it('should produce an animation from start to end between the to and from styles if there are animate steps in between with an easing value',
           () => {
             const steps: AnimationMetadata[] = [animate('1s ease-out')];

             const fromStyles: ɵStyleData[] = [{background: 'blue'}];

             const toStyles: ɵStyleData[] = [{background: 'red'}];

             const players = invokeAnimationSequence(steps, fromStyles, toStyles);
             expect(players[0].keyframes).toEqual([
               {background: 'blue', offset: 0, easing: 'ease-out'},
               {background: 'red', offset: 1}
             ]);
           });
      });
    });
  });
}

function humanizeOffsets(keyframes: ɵStyleData[], digits: number = 3): ɵStyleData[] {
  return keyframes.map(keyframe => {
    keyframe['offset'] = Number(parseFloat(<any>keyframe['offset']).toFixed(digits));
    return keyframe;
  });
}

function invokeAnimationSequence(
    steps: AnimationMetadata | AnimationMetadata[], startingStyles: ɵStyleData[] = [],
    destinationStyles: ɵStyleData[] = []): AnimationTimelineInstruction[] {
  return new Animation(steps).buildTimelines(startingStyles, destinationStyles);
}

function validateAndThrowAnimationSequence(steps: AnimationMetadata | AnimationMetadata[]) {
  const ast =
      Array.isArray(steps) ? sequence(<AnimationMetadata[]>steps) : <AnimationMetadata>steps;
  const errors = validateAnimationSequence(ast);
  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}
