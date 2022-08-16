import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {YouTubePlayerModule} from './youtube-module';
import {YouTubePlayer, DEFAULT_PLAYER_WIDTH, DEFAULT_PLAYER_HEIGHT} from './youtube-player';
import {createFakeYtNamespace} from './fake-youtube-player';
import {Subscription} from 'rxjs';

const VIDEO_ID = 'a12345';
const YT_LOADING_STATE_MOCK = {loading: 1, loaded: 0};

describe('YoutubePlayer', () => {
  let playerCtorSpy: jasmine.Spy;
  let playerSpy: jasmine.SpyObj<YT.Player>;
  let fixture: ComponentFixture<TestApp>;
  let testComponent: TestApp;
  let events: Required<YT.Events>;

  beforeEach(waitForAsync(() => {
    const fake = createFakeYtNamespace();
    playerCtorSpy = fake.playerCtorSpy;
    playerSpy = fake.playerSpy;
    window.YT = fake.namespace;
    events = fake.events;

    TestBed.configureTestingModule({
      imports: [YouTubePlayerModule],
      declarations: [TestApp, StaticStartEndSecondsApp, NoEventsApp],
    });

    TestBed.compileComponents();
  }));

  describe('API ready', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(TestApp);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      (window as any).YT = undefined;
      window.onYouTubeIframeAPIReady = undefined;
    });

    it('initializes a youtube player', () => {
      let containerElement = fixture.nativeElement.querySelector('div');

      expect(playerCtorSpy).toHaveBeenCalledWith(
        containerElement,
        jasmine.objectContaining({
          videoId: VIDEO_ID,
          width: DEFAULT_PLAYER_WIDTH,
          height: DEFAULT_PLAYER_HEIGHT,
          playerVars: undefined,
        }),
      );
    });

    it('destroys the iframe when the component is destroyed', () => {
      events.onReady({target: playerSpy});

      testComponent.visible = false;
      fixture.detectChanges();

      expect(playerSpy.destroy).toHaveBeenCalled();
    });

    it('responds to changes in video id', () => {
      let containerElement = fixture.nativeElement.querySelector('div');

      testComponent.videoId = 'otherId';
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).not.toHaveBeenCalled();

      events.onReady({target: playerSpy});

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({videoId: 'otherId'}),
      );

      testComponent.videoId = undefined;
      fixture.detectChanges();

      expect(playerSpy.destroy).toHaveBeenCalled();

      testComponent.videoId = 'otherId2';
      fixture.detectChanges();

      expect(playerCtorSpy).toHaveBeenCalledWith(
        containerElement,
        jasmine.objectContaining({videoId: 'otherId2'}),
      );
    });

    it('responds to changes in size', () => {
      testComponent.width = 5;
      fixture.detectChanges();

      expect(playerSpy.setSize).not.toHaveBeenCalled();

      events.onReady({target: playerSpy});

      expect(playerSpy.setSize).toHaveBeenCalledWith(5, DEFAULT_PLAYER_HEIGHT);
      expect(testComponent.youtubePlayer.width).toBe(5);
      expect(testComponent.youtubePlayer.height).toBe(DEFAULT_PLAYER_HEIGHT);

      testComponent.height = 6;
      fixture.detectChanges();

      expect(playerSpy.setSize).toHaveBeenCalledWith(5, 6);
      expect(testComponent.youtubePlayer.width).toBe(5);
      expect(testComponent.youtubePlayer.height).toBe(6);

      testComponent.videoId = undefined;
      fixture.detectChanges();
      testComponent.videoId = VIDEO_ID;
      fixture.detectChanges();

      expect(playerCtorSpy).toHaveBeenCalledWith(
        jasmine.any(Element),
        jasmine.objectContaining({width: 5, height: 6}),
      );
      expect(testComponent.youtubePlayer.width).toBe(5);
      expect(testComponent.youtubePlayer.height).toBe(6);

      events.onReady({target: playerSpy});
      testComponent.width = undefined;
      fixture.detectChanges();

      expect(playerSpy.setSize).toHaveBeenCalledWith(DEFAULT_PLAYER_WIDTH, 6);
      expect(testComponent.youtubePlayer.width).toBe(DEFAULT_PLAYER_WIDTH);
      expect(testComponent.youtubePlayer.height).toBe(6);

      testComponent.height = undefined;
      fixture.detectChanges();

      expect(playerSpy.setSize).toHaveBeenCalledWith(DEFAULT_PLAYER_WIDTH, DEFAULT_PLAYER_HEIGHT);
      expect(testComponent.youtubePlayer.width).toBe(DEFAULT_PLAYER_WIDTH);
      expect(testComponent.youtubePlayer.height).toBe(DEFAULT_PLAYER_HEIGHT);
    });

    it('passes the configured playerVars to the player', () => {
      const playerVars: YT.PlayerVars = {modestbranding: YT.ModestBranding.Modest};
      fixture.componentInstance.playerVars = playerVars;
      fixture.detectChanges();

      events.onReady({target: playerSpy});
      const calls = playerCtorSpy.calls.all();

      // We expect 2 calls since the first one is run on init and the
      // second one happens after the `playerVars` have changed.
      expect(calls.length).toBe(2);
      expect(calls[0].args[1]).toEqual(jasmine.objectContaining({playerVars: undefined}));
      expect(calls[1].args[1]).toEqual(jasmine.objectContaining({playerVars}));
    });

    it('initializes the player with start and end seconds', () => {
      testComponent.startSeconds = 5;
      testComponent.endSeconds = 6;
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).not.toHaveBeenCalled();

      playerSpy.getPlayerState.and.returnValue(window.YT!.PlayerState.CUED);
      events.onReady({target: playerSpy});

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 5, endSeconds: 6}),
      );

      testComponent.endSeconds = 8;
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 5, endSeconds: 8}),
      );

      testComponent.startSeconds = 7;
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 7, endSeconds: 8}),
      );

      testComponent.startSeconds = 10;
      testComponent.endSeconds = 11;
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 10, endSeconds: 11}),
      );
    });

    it('sets the suggested quality', () => {
      testComponent.suggestedQuality = 'small';
      fixture.detectChanges();

      expect(playerSpy.setPlaybackQuality).not.toHaveBeenCalled();

      events.onReady({target: playerSpy});

      expect(playerSpy.setPlaybackQuality).toHaveBeenCalledWith('small');

      testComponent.suggestedQuality = 'large';
      fixture.detectChanges();

      expect(playerSpy.setPlaybackQuality).toHaveBeenCalledWith('large');

      testComponent.videoId = 'other';
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({suggestedQuality: 'large'}),
      );
    });

    it('proxies events as output', () => {
      events.onReady({target: playerSpy});
      expect(testComponent.onReady).toHaveBeenCalledWith({target: playerSpy});

      events.onStateChange({target: playerSpy, data: 5});
      expect(testComponent.onStateChange).toHaveBeenCalledWith({target: playerSpy, data: 5});

      events.onPlaybackQualityChange({target: playerSpy, data: 'large'});
      expect(testComponent.onPlaybackQualityChange).toHaveBeenCalledWith({
        target: playerSpy,
        data: 'large',
      });

      events.onPlaybackRateChange({target: playerSpy, data: 2});
      expect(testComponent.onPlaybackRateChange).toHaveBeenCalledWith({target: playerSpy, data: 2});

      events.onError({target: playerSpy, data: 5});
      expect(testComponent.onError).toHaveBeenCalledWith({target: playerSpy, data: 5});

      events.onApiChange({target: playerSpy});
      expect(testComponent.onApiChange).toHaveBeenCalledWith({target: playerSpy});
    });

    it('proxies methods to the player', () => {
      events.onReady({target: playerSpy});

      testComponent.youtubePlayer.playVideo();
      expect(playerSpy.playVideo).toHaveBeenCalled();

      testComponent.youtubePlayer.pauseVideo();
      expect(playerSpy.pauseVideo).toHaveBeenCalled();

      testComponent.youtubePlayer.stopVideo();
      expect(playerSpy.stopVideo).toHaveBeenCalled();

      testComponent.youtubePlayer.mute();
      expect(playerSpy.mute).toHaveBeenCalled();

      testComponent.youtubePlayer.unMute();
      expect(playerSpy.unMute).toHaveBeenCalled();

      testComponent.youtubePlayer.isMuted();
      expect(playerSpy.isMuted).toHaveBeenCalled();

      testComponent.youtubePlayer.seekTo(5, true);
      expect(playerSpy.seekTo).toHaveBeenCalledWith(5, true);

      testComponent.youtubePlayer.isMuted();
      expect(playerSpy.isMuted).toHaveBeenCalled();

      testComponent.youtubePlayer.setVolume(54);
      expect(playerSpy.setVolume).toHaveBeenCalledWith(54);

      testComponent.youtubePlayer.getVolume();
      expect(playerSpy.getVolume).toHaveBeenCalled();

      testComponent.youtubePlayer.setPlaybackRate(1.5);
      expect(playerSpy.setPlaybackRate).toHaveBeenCalledWith(1.5);

      testComponent.youtubePlayer.getPlaybackRate();
      expect(playerSpy.getPlaybackRate).toHaveBeenCalled();

      testComponent.youtubePlayer.getAvailablePlaybackRates();
      expect(playerSpy.getAvailablePlaybackRates).toHaveBeenCalled();

      testComponent.youtubePlayer.getVideoLoadedFraction();
      expect(playerSpy.getVideoLoadedFraction).toHaveBeenCalled();

      testComponent.youtubePlayer.getPlayerState();
      expect(playerSpy.getPlayerState).toHaveBeenCalled();

      testComponent.youtubePlayer.getCurrentTime();
      expect(playerSpy.getCurrentTime).toHaveBeenCalled();

      testComponent.youtubePlayer.getPlaybackQuality();
      expect(playerSpy.getPlaybackQuality).toHaveBeenCalled();

      testComponent.youtubePlayer.getAvailableQualityLevels();
      expect(playerSpy.getAvailableQualityLevels).toHaveBeenCalled();

      testComponent.youtubePlayer.getDuration();
      expect(playerSpy.getDuration).toHaveBeenCalled();

      testComponent.youtubePlayer.getVideoUrl();
      expect(playerSpy.getVideoUrl).toHaveBeenCalled();

      testComponent.youtubePlayer.getVideoEmbedCode();
      expect(playerSpy.getVideoEmbedCode).toHaveBeenCalled();
    });

    it('should play on init if playVideo was called before the API has loaded', () => {
      testComponent.youtubePlayer.playVideo();
      expect(testComponent.youtubePlayer.getPlayerState()).toBe(YT.PlayerState.PLAYING);

      events.onReady({target: playerSpy});

      expect(playerSpy.playVideo).toHaveBeenCalled();
    });

    it('should pause on init if pauseVideo was called before the API has loaded', () => {
      testComponent.youtubePlayer.pauseVideo();
      expect(testComponent.youtubePlayer.getPlayerState()).toBe(YT.PlayerState.PAUSED);

      events.onReady({target: playerSpy});

      expect(playerSpy.pauseVideo).toHaveBeenCalled();
    });

    it('should stop on init if stopVideo was called before the API has loaded', () => {
      testComponent.youtubePlayer.stopVideo();
      expect(testComponent.youtubePlayer.getPlayerState()).toBe(YT.PlayerState.CUED);

      events.onReady({target: playerSpy});

      expect(playerSpy.stopVideo).toHaveBeenCalled();
    });

    it(
      'should set the playback rate on init if setPlaybackRate was called before ' +
        'the API has loaded',
      () => {
        testComponent.youtubePlayer.setPlaybackRate(1337);
        expect(testComponent.youtubePlayer.getPlaybackRate()).toBe(1337);

        events.onReady({target: playerSpy});

        expect(playerSpy.setPlaybackRate).toHaveBeenCalledWith(1337);
      },
    );

    it('should set the volume on init if setVolume was called before the API has loaded', () => {
      testComponent.youtubePlayer.setVolume(37);
      expect(testComponent.youtubePlayer.getVolume()).toBe(37);

      events.onReady({target: playerSpy});

      expect(playerSpy.setVolume).toHaveBeenCalledWith(37);
    });

    it('should mute on init if mute was called before the API has loaded', () => {
      testComponent.youtubePlayer.mute();
      expect(testComponent.youtubePlayer.isMuted()).toBe(true);

      events.onReady({target: playerSpy});

      expect(playerSpy.mute).toHaveBeenCalled();
    });

    it('should unmute on init if umMute was called before the API has loaded', () => {
      testComponent.youtubePlayer.unMute();
      expect(testComponent.youtubePlayer.isMuted()).toBe(false);

      events.onReady({target: playerSpy});

      expect(playerSpy.unMute).toHaveBeenCalled();
    });

    it('should seek on init if seekTo was called before the API has loaded', () => {
      testComponent.youtubePlayer.seekTo(1337, true);
      expect(testComponent.youtubePlayer.getCurrentTime()).toBe(1337);

      events.onReady({target: playerSpy});

      expect(playerSpy.seekTo).toHaveBeenCalledWith(1337, true);
    });

    it('should be able to disable cookies', () => {
      const containerElement = fixture.nativeElement.querySelector('div');

      expect(playerCtorSpy).toHaveBeenCalledWith(
        containerElement,
        jasmine.objectContaining({
          host: undefined,
        }),
      );

      playerCtorSpy.calls.reset();
      fixture.componentInstance.disableCookies = true;
      fixture.detectChanges();

      expect(playerCtorSpy).toHaveBeenCalledWith(
        containerElement,
        jasmine.objectContaining({
          host: 'https://www.youtube-nocookie.com',
        }),
      );
    });
  });

  describe('API loaded asynchronously', () => {
    let api: typeof YT;

    beforeEach(() => {
      api = window.YT;
      (window as any).YT = undefined;
    });

    afterEach(() => {
      (window as any).YT = undefined;
      window.onYouTubeIframeAPIReady = undefined;
    });

    it('waits until the api is ready before initializing', () => {
      (window.YT as any) = YT_LOADING_STATE_MOCK;

      fixture = TestBed.createComponent(TestApp);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();

      expect(playerCtorSpy).not.toHaveBeenCalled();

      window.YT = api!;
      window.onYouTubeIframeAPIReady!();

      let containerElement = fixture.nativeElement.querySelector('div');

      expect(playerCtorSpy).toHaveBeenCalledWith(
        containerElement,
        jasmine.objectContaining({
          videoId: VIDEO_ID,
          width: DEFAULT_PLAYER_WIDTH,
          height: DEFAULT_PLAYER_HEIGHT,
        }),
      );
    });

    it('should not override any pre-existing API loaded callbacks', () => {
      const spy = jasmine.createSpy('other API loaded spy');
      window.onYouTubeIframeAPIReady = spy;

      fixture = TestBed.createComponent(TestApp);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();

      expect(playerCtorSpy).not.toHaveBeenCalled();

      window.YT = api!;
      window.onYouTubeIframeAPIReady!();

      expect(spy).toHaveBeenCalled();
    });
  });

  it('should pick up static startSeconds and endSeconds values', () => {
    const staticSecondsApp = TestBed.createComponent(StaticStartEndSecondsApp);
    staticSecondsApp.detectChanges();

    playerSpy.getPlayerState.and.returnValue(window.YT!.PlayerState.CUED);
    events.onReady({target: playerSpy});

    expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
      jasmine.objectContaining({startSeconds: 42, endSeconds: 1337}),
    );
  });

  it('should be able to subscribe to events after initialization', () => {
    const noEventsApp = TestBed.createComponent(NoEventsApp);
    noEventsApp.detectChanges();
    events.onReady({target: playerSpy});
    noEventsApp.detectChanges();

    const player = noEventsApp.componentInstance.player;
    const subscriptions: Subscription[] = [];
    const readySpy = jasmine.createSpy('ready spy');
    const stateChangeSpy = jasmine.createSpy('stateChange spy');
    const playbackQualityChangeSpy = jasmine.createSpy('playbackQualityChange spy');
    const playbackRateChangeSpy = jasmine.createSpy('playbackRateChange spy');
    const errorSpy = jasmine.createSpy('error spy');
    const apiChangeSpy = jasmine.createSpy('apiChange spy');

    subscriptions.push(player.ready.subscribe(readySpy));
    events.onReady({target: playerSpy});
    expect(readySpy).toHaveBeenCalledWith({target: playerSpy});

    subscriptions.push(player.stateChange.subscribe(stateChangeSpy));
    events.onStateChange({target: playerSpy, data: 5});
    expect(stateChangeSpy).toHaveBeenCalledWith({target: playerSpy, data: 5});

    subscriptions.push(player.playbackQualityChange.subscribe(playbackQualityChangeSpy));
    events.onPlaybackQualityChange({target: playerSpy, data: 'large'});
    expect(playbackQualityChangeSpy).toHaveBeenCalledWith({target: playerSpy, data: 'large'});

    subscriptions.push(player.playbackRateChange.subscribe(playbackRateChangeSpy));
    events.onPlaybackRateChange({target: playerSpy, data: 2});
    expect(playbackRateChangeSpy).toHaveBeenCalledWith({target: playerSpy, data: 2});

    subscriptions.push(player.error.subscribe(errorSpy));
    events.onError({target: playerSpy, data: 5});
    expect(errorSpy).toHaveBeenCalledWith({target: playerSpy, data: 5});

    subscriptions.push(player.apiChange.subscribe(apiChangeSpy));
    events.onApiChange({target: playerSpy});
    expect(apiChangeSpy).toHaveBeenCalledWith({target: playerSpy});

    subscriptions.forEach(subscription => subscription.unsubscribe());
  });
});

/** Test component that contains a YouTubePlayer. */
@Component({
  selector: 'test-app',
  template: `
    <youtube-player #player [videoId]="videoId" *ngIf="visible" [width]="width" [height]="height"
      [startSeconds]="startSeconds" [endSeconds]="endSeconds" [suggestedQuality]="suggestedQuality"
      [playerVars]="playerVars"
      [disableCookies]="disableCookies"
      (ready)="onReady($event)"
      (stateChange)="onStateChange($event)"
      (playbackQualityChange)="onPlaybackQualityChange($event)"
      (playbackRateChange)="onPlaybackRateChange($event)"
      (error)="onError($event)"
      (apiChange)="onApiChange($event)">
    </youtube-player>
  `,
})
class TestApp {
  videoId: string | undefined = VIDEO_ID;
  disableCookies = false;
  visible = true;
  width: number | undefined;
  height: number | undefined;
  startSeconds: number | undefined;
  endSeconds: number | undefined;
  suggestedQuality: YT.SuggestedVideoQuality | undefined;
  playerVars: YT.PlayerVars | undefined;
  onReady = jasmine.createSpy('onReady');
  onStateChange = jasmine.createSpy('onStateChange');
  onPlaybackQualityChange = jasmine.createSpy('onPlaybackQualityChange');
  onPlaybackRateChange = jasmine.createSpy('onPlaybackRateChange');
  onError = jasmine.createSpy('onError');
  onApiChange = jasmine.createSpy('onApiChange');
  @ViewChild('player') youtubePlayer: YouTubePlayer;
}

@Component({
  template: `
    <youtube-player [videoId]="videoId" [startSeconds]="42" [endSeconds]="1337"></youtube-player>
  `,
})
class StaticStartEndSecondsApp {
  videoId = VIDEO_ID;
}

@Component({
  template: `<youtube-player [videoId]="videoId"></youtube-player>`,
})
class NoEventsApp {
  @ViewChild(YouTubePlayer) player: YouTubePlayer;
  videoId = VIDEO_ID;
}
