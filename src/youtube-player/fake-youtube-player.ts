/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// A re-creation of YT.PlayerState since enum values cannot be bound to the window object.
const playerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

// Re-creation of `YT.ModestBranding` since it was changed
// to a plain enum which we can't reference in tests.
const modestBranding = {
  Full: 0,
  Modest: 1,
};

interface FakeYtNamespace {
  playerCtorSpy: jasmine.Spy;
  playerSpy: jasmine.SpyObj<YT.Player>;
  events: Required<YT.Events>;
  namespace: typeof YT;
}

export function createFakeYtNamespace(): FakeYtNamespace {
  const playerSpy: jasmine.SpyObj<YT.Player> = jasmine.createSpyObj('Player', [
    'getPlayerState',
    'destroy',
    'cueVideoById',
    'loadVideoById',
    'pauseVideo',
    'stopVideo',
    'seekTo',
    'isMuted',
    'mute',
    'unMute',
    'getVolume',
    'getPlaybackRate',
    'getAvailablePlaybackRates',
    'getVideoLoadedFraction',
    'getPlayerState',
    'getCurrentTime',
    'getPlaybackQuality',
    'getAvailableQualityLevels',
    'getDuration',
    'getVideoUrl',
    'getVideoEmbedCode',
    'playVideo',
    'setSize',
    'setVolume',
    'setPlaybackQuality',
    'setPlaybackRate',
    'addEventListener',
    'removeEventListener',
  ]);

  let playerConfig: YT.PlayerOptions | undefined;
  const boundListeners = new Map<keyof YT.Events, Set<(event: any) => void>>();
  const playerCtorSpy = jasmine.createSpy('Player Constructor');

  // The spy target function cannot be an arrow-function as this breaks when created through `new`.
  playerCtorSpy.and.callFake(function (_el: Element, config: YT.PlayerOptions) {
    playerConfig = config;
    return playerSpy;
  });

  playerSpy.addEventListener.and.callFake((name: keyof YT.Events, listener: (e: any) => any) => {
    if (!boundListeners.has(name)) {
      boundListeners.set(name, new Set());
    }
    boundListeners.get(name)!.add(listener);
  });

  playerSpy.removeEventListener.and.callFake((name: keyof YT.Events, listener: (e: any) => any) => {
    if (boundListeners.has(name)) {
      boundListeners.get(name)!.delete(listener);
    }
  });

  function eventHandlerFactory(name: keyof YT.Events) {
    return (arg: Object = {}) => {
      if (!playerConfig) {
        throw new Error(`Player not initialized before ${name} called`);
      }

      if (boundListeners.has(name)) {
        boundListeners.get(name)!.forEach(callback => callback(arg));
      }
    };
  }

  const events: Required<YT.Events> = {
    onReady: eventHandlerFactory('onReady'),
    onStateChange: eventHandlerFactory('onStateChange'),
    onPlaybackQualityChange: eventHandlerFactory('onPlaybackQualityChange'),
    onPlaybackRateChange: eventHandlerFactory('onPlaybackRateChange'),
    onError: eventHandlerFactory('onError'),
    onApiChange: eventHandlerFactory('onApiChange'),
  };

  return {
    playerCtorSpy,
    playerSpy,
    events,
    namespace: {
      'Player': playerCtorSpy as unknown as typeof YT.Player,
      'PlayerState': playerState,
      'ModestBranding': modestBranding,
    } as typeof YT,
  };
}
