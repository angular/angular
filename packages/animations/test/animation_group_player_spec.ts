/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {fakeAsync} from '@angular/core/testing';
import {NoopAnimationPlayer} from '../src/animations';
import {AnimationGroupPlayer} from '../src/players/animation_group_player';


describe('AnimationGroupPlayer', () => {
  it('should getPosition of an empty group', fakeAsync(() => {
       const players: NoopAnimationPlayer[] = [];
       const groupPlayer = new AnimationGroupPlayer(players);
       expect(groupPlayer.getPosition()).toBe(0);
     }));

  it('should getPosition of a single player in a group', fakeAsync(() => {
       const player = new NoopAnimationPlayer(5, 5);
       player.setPosition(0.2);
       const players = [player];
       const groupPlayer = new AnimationGroupPlayer(players);
       expect(groupPlayer.getPosition()).toBe(0.2);
     }));

  it('should getPosition based on the longest player in the group', fakeAsync(() => {
       const longestPlayer = new NoopAnimationPlayer(5, 5);
       longestPlayer.setPosition(0.2);
       const players = [
         new NoopAnimationPlayer(1, 4),
         new NoopAnimationPlayer(4, 1),
         new NoopAnimationPlayer(7, 0),
         longestPlayer,
         new NoopAnimationPlayer(1, 1),
       ];
       const groupPlayer = new AnimationGroupPlayer(players);
       expect(groupPlayer.getPosition()).toBe(0.2);
     }));
});
