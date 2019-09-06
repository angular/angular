import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {YouTubePlayerModule} from './youtube-module';
import {YouTubePlayer, DEFAULT_PLAYER_WIDTH, DEFAULT_PLAYER_HEIGHT} from './youtube-player';
import {createFakeYtNamespace} from './fake-youtube-player';

const VIDEO_ID = 'a12345';

describe('YoutubePlayer', () => {
  let playerCtorSpy: jasmine.Spy;
  let playerSpy: jasmine.SpyObj<YT.Player>;
  let fixture: ComponentFixture<TestApp>;
  let testComponent: TestApp;
  let events: Required<YT.Events>;

  beforeEach(async(() => {
    const fake = createFakeYtNamespace();
    playerCtorSpy = fake.playerCtorSpy;
    playerSpy = fake.playerSpy;
    window.YT = fake.namespace;
    events = fake.events;

    TestBed.configureTestingModule({
      imports: [YouTubePlayerModule],
      declarations: [TestApp],
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
      window.YT = undefined;
    });

    it('initializes a youtube player', () => {
      let containerElement = fixture.nativeElement.querySelector('div');

      expect(playerCtorSpy).toHaveBeenCalledWith(
        containerElement, jasmine.objectContaining({
          videoId: VIDEO_ID,
          width: DEFAULT_PLAYER_WIDTH,
          height: DEFAULT_PLAYER_HEIGHT,
        }));
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
        jasmine.objectContaining({videoId: 'otherId'}));

      testComponent.videoId = undefined;
      fixture.detectChanges();

      expect(playerSpy.destroy).toHaveBeenCalled();

      testComponent.videoId = 'otherId2';
      fixture.detectChanges();

      expect(playerCtorSpy).toHaveBeenCalledWith(
        containerElement, jasmine.objectContaining({videoId: 'otherId2'}));
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
          jasmine.any(Element), jasmine.objectContaining({width: 5, height: 6}));
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

    it('initializes the player with start and end seconds', () => {
      testComponent.startSeconds = 5;
      testComponent.endSeconds = 6;
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).not.toHaveBeenCalled();

      playerSpy.getPlayerState.and.returnValue(window.YT!.PlayerState.CUED);
      events.onReady({target: playerSpy});

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 5, endSeconds: 6}));

      testComponent.endSeconds = 8;
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 5, endSeconds: 8}));

      testComponent.startSeconds = 7;
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 7, endSeconds: 8}));

      testComponent.startSeconds = 10;
      testComponent.endSeconds = 11;
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 10, endSeconds: 11}));
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
        jasmine.objectContaining({suggestedQuality: 'large'}));
    });

    it('proxies events as output', () => {
      events.onReady({target: playerSpy});
      expect(testComponent.onReady).toHaveBeenCalledWith({target: playerSpy});

      events.onStateChange({target: playerSpy, data: 5});
      expect(testComponent.onStateChange).toHaveBeenCalledWith({target: playerSpy, data: 5});

      events.onPlaybackQualityChange({target: playerSpy, data: 'large'});
      expect(testComponent.onPlaybackQualityChange)
          .toHaveBeenCalledWith({target: playerSpy, data: 'large'});

      events.onPlaybackRateChange({target: playerSpy, data: 2});
      expect(testComponent.onPlaybackRateChange)
          .toHaveBeenCalledWith({target: playerSpy, data: 2});

      events.onError({target: playerSpy, data: 5});
      expect(testComponent.onError)
          .toHaveBeenCalledWith({target: playerSpy, data: 5});

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
  });

  describe('API loaded asynchronously', () => {
    let api: typeof YT | undefined;

    beforeEach(() => {
      api = window.YT;
      window.YT = undefined;

      fixture = TestBed.createComponent(TestApp);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      window.YT = undefined;
    });

    it('waits until the api is ready before initializing', () => {
      expect(playerCtorSpy).not.toHaveBeenCalled();

      window.YT = api;
      window.onYouTubeIframeAPIReady!();

      let containerElement = fixture.nativeElement.querySelector('div');

      expect(playerCtorSpy).toHaveBeenCalledWith(
        containerElement, jasmine.objectContaining({
          videoId: VIDEO_ID,
          width: DEFAULT_PLAYER_WIDTH,
          height: DEFAULT_PLAYER_HEIGHT,
        }));
    });
  });

});

/** Test component that contains a YouTubePlayer. */
@Component({
  selector: 'test-app',
  template: `
    <youtube-player #player [videoId]="videoId" *ngIf="visible" [width]="width" [height]="height"
      [startSeconds]="startSeconds" [endSeconds]="endSeconds" [suggestedQuality]="suggestedQuality"
      (ready)="onReady($event)"
      (stateChange)="onStateChange($event)"
      (playbackQualityChange)="onPlaybackQualityChange($event)"
      (playbackRateChange)="onPlaybackRateChange($event)"
      (error)="onError($event)"
      (apiChange)="onApiChange($event)">
    </youtube-player>
  `
})
class TestApp {
  videoId: string | undefined = VIDEO_ID;
  visible = true;
  width: number | undefined;
  height: number | undefined;
  startSeconds: number | undefined;
  endSeconds: number | undefined;
  suggestedQuality: YT.SuggestedVideoQuality | undefined;
  onReady = jasmine.createSpy('onReady');
  onStateChange = jasmine.createSpy('onStateChange');
  onPlaybackQualityChange = jasmine.createSpy('onPlaybackQualityChange');
  onPlaybackRateChange = jasmine.createSpy('onPlaybackRateChange');
  onError = jasmine.createSpy('onError');
  onApiChange = jasmine.createSpy('onApiChange');
  @ViewChild('player', {static: false}) youtubePlayer: YouTubePlayer;
}
