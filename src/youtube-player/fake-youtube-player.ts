// A re-creation of YT.PlayerState since enum values cannot be bound to the window
// object.
const playerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

interface FakeYtNamespace {
  playerCtorSpy: jasmine.Spy;
  playerSpy: jasmine.SpyObj<YT.Player>;
  onPlayerReady: () => void;
  namespace: typeof YT;
}

export function createFakeYtNamespace(): FakeYtNamespace {
  const playerSpy: jasmine.SpyObj<YT.Player> = jasmine.createSpyObj('Player', [
    'getPlayerState', 'destroy', 'cueVideoById', 'loadVideoById', 'pauseVideo', 'stopVideo',
    'seekTo', 'isMuted', 'mute', 'unMute', 'getVolume', 'getPlaybackRate',
    'getAvailablePlaybackRates', 'getVideoLoadedFraction', 'getPlayerState', 'getCurrentTime',
    'getPlaybackQuality', 'getAvailableQualityLevels', 'getDuration', 'getVideoUrl',
    'getVideoEmbedCode', 'playVideo', 'setSize', 'setVolume', 'setPlaybackQuality',
    'setPlaybackRate', 'addEventListener', 'removeEventListener',
  ]);

  let playerConfig: YT.PlayerOptions | undefined;
  const playerCtorSpy = jasmine.createSpy('Player Constructor');
  playerCtorSpy.and.callFake((_el: Element, config: YT.PlayerOptions) => {
    playerConfig = config;
    return playerSpy;
  });

  const onPlayerReady = () => {
    if (!playerConfig) {
      throw new Error('Player not initialized before onPlayerReady called');
    }

    if (playerConfig && playerConfig.events && playerConfig.events.onReady) {
      playerConfig.events.onReady({target: playerSpy});
    }

    for (const [event, callback] of playerSpy.addEventListener.calls.allArgs()) {
      if (event === 'onReady') {
        callback({target: playerSpy});
      }
    }
  };

  return {
    playerCtorSpy,
    playerSpy,
    onPlayerReady,
    namespace: {
      'Player': playerCtorSpy as unknown as typeof YT.Player,
      'PlayerState': playerState,
    } as typeof YT,
  };
}
