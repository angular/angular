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
  events: Required<YT.Events>;
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

  const eventHandlerFactory = (name: keyof YT.Events) => {
    return (arg: Object = {}) => {
      if (!playerConfig) {
        throw new Error(`Player not initialized before ${name} called`);
      }

      if (playerConfig && playerConfig.events && playerConfig.events[name]) {
        playerConfig.events[name]!(arg as any);
      }

      for (const [event, callback] of playerSpy.addEventListener.calls.allArgs()) {
        if (event === name) {
          callback(arg);
        }
      }
    };
  };

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
    } as typeof YT,
  };
}
