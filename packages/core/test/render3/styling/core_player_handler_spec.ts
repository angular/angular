/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PlayState} from '../../../src/render3/interfaces/player';
import {CorePlayerHandler} from '../../../src/render3/styling/core_player_handler';

import {MockPlayer} from './mock_player';

describe('CorePlayerHandler', () => {
  it('should kick off any animation players that have been queued once flushed', () => {
    const handler = new CorePlayerHandler();
    const p1 = new MockPlayer();
    const p2 = new MockPlayer();

    expect(p1.state).toEqual(PlayState.Pending);
    expect(p2.state).toEqual(PlayState.Pending);

    handler.queuePlayer(p1);
    handler.queuePlayer(p2);

    expect(p1.state).toEqual(PlayState.Pending);
    expect(p2.state).toEqual(PlayState.Pending);

    handler.flushPlayers();

    expect(p1.state).toEqual(PlayState.Running);
    expect(p2.state).toEqual(PlayState.Running);
  });

  it('should only kick off animation players that have not been adopted by a parent player once flushed',
     () => {
       const handler = new CorePlayerHandler();
       const pRoot = new MockPlayer();
       const p1 = new MockPlayer();
       const p2 = new MockPlayer();

       expect(pRoot.state).toEqual(PlayState.Pending);
       expect(p1.state).toEqual(PlayState.Pending);
       expect(p2.state).toEqual(PlayState.Pending);

       handler.queuePlayer(pRoot);
       handler.queuePlayer(p1);
       handler.queuePlayer(p2);

       expect(pRoot.state).toEqual(PlayState.Pending);
       expect(p1.state).toEqual(PlayState.Pending);
       expect(p2.state).toEqual(PlayState.Pending);

       p1.parent = pRoot;

       handler.flushPlayers();

       expect(pRoot.state).toEqual(PlayState.Running);
       expect(p1.state).toEqual(PlayState.Pending);
       expect(p2.state).toEqual(PlayState.Running);
     });
});
