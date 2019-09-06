import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
  OnInit,
} from '@angular/core';

import {
  combineLatest,
  of as observableOf,
  Observable,
  ConnectableObservable,
  pipe,
  MonoTypeOperatorFunction,
  merge,
  OperatorFunction,
  Subject,
} from 'rxjs';

import {
  combineLatest as combineLatestOp,
  map,
  scan,
  withLatestFrom,
  flatMap,
  filter,
  startWith,
  publish,
  first,
  distinctUntilChanged,
  takeUntil,
  take,
  skipWhile,
} from 'rxjs/operators';

declare global {
  interface Window {
    YT: typeof YT | undefined;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export const DEFAULT_PLAYER_WIDTH = 640;
export const DEFAULT_PLAYER_HEIGHT = 390;

// The native YT.Player doesn't expose the set videoId, but we need it for
// convenience.
interface Player extends YT.Player {
  videoId?: string | undefined;
}

// The player isn't fully initialized when it's constructed.
// The only field available is destroy and addEventListener.
type UninitializedPlayer = Pick<Player, 'videoId' | 'destroy' | 'addEventListener'>;

/**
 * Angular component that renders a YouTube player via the YouTube player
 * iframe API.
 * @see https://developers.google.com/youtube/iframe_api_reference
 */
@Component({
  selector: 'youtube-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // This div is *replaced* by the YouTube player embed.
  template: '<div #youtube_container></div>',
})
export class YouTubePlayer implements AfterViewInit, OnDestroy, OnInit {
  /** YouTube Video ID to view */
  @Input()
  get videoId(): string | undefined { return this._videoId; }
  set videoId(videoId: string | undefined) {
    this._videoId = videoId;
    this._videoIdObs.emit(videoId);
  }
  private _videoId: string | undefined;
  private _videoIdObs = new EventEmitter<string | undefined>();

  /** Height of video player */
  @Input()
  get height(): number | undefined { return this._height; }
  set height(height: number | undefined) {
    this._height = height || DEFAULT_PLAYER_HEIGHT;
    this._heightObs.emit(this._height);
  }
  private _height = DEFAULT_PLAYER_HEIGHT;
  private _heightObs = new EventEmitter<number>();

  /** Width of video player */
  @Input()
  get width(): number | undefined { return this._width; }
  set width(width: number | undefined) {
    this._width = width || DEFAULT_PLAYER_WIDTH;
    this._widthObs.emit(this._width);
  }
  private _width = DEFAULT_PLAYER_WIDTH;
  private _widthObs = new EventEmitter<number>();

  /** The moment when the player is supposed to start playing */
  @Input() set startSeconds(startSeconds: number | undefined) {
    this._startSeconds.emit(startSeconds);
  }
  private _startSeconds = new EventEmitter<number | undefined>();

  /** The moment when the player is supposed to stop playing */
  @Input() set endSeconds(endSeconds: number | undefined) {
    this._endSeconds.emit(endSeconds);
  }
  private _endSeconds = new EventEmitter<number | undefined>();

  /** The suggested quality of the player */
  @Input() set suggestedQuality(suggestedQuality: YT.SuggestedVideoQuality | undefined) {
    this._suggestedQuality.emit(suggestedQuality);
  }
  private _suggestedQuality = new EventEmitter<YT.SuggestedVideoQuality | undefined>();

  /**
   * Whether the iframe will attempt to load regardless of the status of the api on the
   * page. Set this to true if you don't want the `onYouTubeIframeAPIReady` field to be
   * set on the global window.
   */
  @Input() showBeforeIframeApiLoads: boolean | undefined;

  /** Outputs are direct proxies from the player itself. */
  @Output() ready = new EventEmitter<YT.PlayerEvent>();
  @Output() stateChange = new EventEmitter<YT.OnStateChangeEvent>();
  @Output() error = new EventEmitter<YT.OnErrorEvent>();
  @Output() apiChange = new EventEmitter<YT.PlayerEvent>();
  @Output() playbackQualityChange = new EventEmitter<YT.OnPlaybackQualityChangeEvent>();
  @Output() playbackRateChange = new EventEmitter<YT.OnPlaybackRateChangeEvent>();

  /** The element that will be replaced by the iframe. */
  @ViewChild('youtube_container', {static: false}) youtubeContainer: ElementRef | undefined;
  private _youtubeContainer = new EventEmitter<HTMLElement>();
  private _destroyed = new EventEmitter<undefined>();

  private _player: Player | undefined;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    let iframeApiAvailableObs: Observable<boolean> = observableOf(true);
    if (!window.YT) {
      if (this.showBeforeIframeApiLoads) {
        throw new Error('Namespace YT not found, cannot construct embedded youtube player. ' +
            'Please install the YouTube Player API Reference for iframe Embeds: ' +
            'https://developers.google.com/youtube/iframe_api_reference');
      }

      const iframeApiAvailableSubject = new Subject<boolean>();
      window.onYouTubeIframeAPIReady = () => {
        this._ngZone.run(() => iframeApiAvailableSubject.next(true));
      };
      iframeApiAvailableObs = iframeApiAvailableSubject.pipe(take(1), startWith(false));
    }

    // Add initial values to all of the inputs.
    const videoIdObs = this._videoIdObs.pipe(startWith(this._videoId));
    const widthObs = this._widthObs.pipe(startWith(this._width));
    const heightObs = this._heightObs.pipe(startWith(this._height));

    const startSecondsObs = this._startSeconds.pipe(startWith(undefined));
    const endSecondsObs = this._endSeconds.pipe(startWith(undefined));
    const suggestedQualityObs = this._suggestedQuality.pipe(startWith(undefined));

    /** An observable of the currently loaded player. */
    const playerObs =
      createPlayerObservable(
        this._youtubeContainer,
        videoIdObs,
        iframeApiAvailableObs,
        widthObs,
        heightObs,
        this.createEventsBoundInZone(),
      ).pipe(waitUntilReady(), takeUntil(this._destroyed), publish());

    /** Set up side effects to bind inputs to the player. */
    playerObs.subscribe(player => this._player = player);

    bindSizeToPlayer(playerObs, widthObs, heightObs);

    bindSuggestedQualityToPlayer(playerObs, suggestedQualityObs);

    bindCueVideoCall(
      playerObs,
      videoIdObs,
      startSecondsObs,
      endSecondsObs,
      suggestedQualityObs,
      this._destroyed);

    // After all of the subscriptions are set up, connect the observable.
    (playerObs as ConnectableObservable<Player>).connect();
  }

  createEventsBoundInZone(): YT.Events {
    return {
      onReady: this._runInZone((event) => this.ready.emit(event)),
      onStateChange: this._runInZone((event) => this.stateChange.emit(event)),
      onPlaybackQualityChange:
          this._runInZone((event) => this.playbackQualityChange.emit(event)),
      onPlaybackRateChange: this._runInZone((event) => this.playbackRateChange.emit(event)),
      onError: this._runInZone((event) => this.error.emit(event)),
      onApiChange: this._runInZone((event) => this.apiChange.emit(event)),
    };
  }

  ngAfterViewInit() {
    if (!this.youtubeContainer) {
      return;
    }
    this._youtubeContainer.emit(this.youtubeContainer.nativeElement);
  }

  ngOnDestroy() {
    if (!this._player) {
      return;
    }
    this._player.destroy();
    window.onYouTubeIframeAPIReady = undefined;
    this._destroyed.emit();
  }

  private _runInZone<T extends (...args: any[]) => void>(callback: T):
      (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      this._ngZone.run(() => callback(...args));
    };
  }

  /** Proxied methods. */

  /** See https://developers.google.com/youtube/iframe_api_reference#playVideo */
  playVideo() {
    if (!this._player) {
      return;
    }
    this._player.playVideo();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#pauseVideo */
  pauseVideo() {
    if (!this._player) {
      return;
    }
    this._player.pauseVideo();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#stopVideo */
  stopVideo() {
    if (!this._player) {
      return;
    }
    this._player.stopVideo();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#seekTo */
  seekTo(seconds: number, allowSeekAhead: boolean) {
    if (!this._player) {
      return;
    }
    this._player.seekTo(seconds, allowSeekAhead);
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#mute */
  mute() {
    if (!this._player) {
      return;
    }
    this._player.mute();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#unMute */
  unMute() {
    if (!this._player) {
      return;
    }
    this._player.unMute();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#isMuted */
  isMuted(): boolean {
    if (!this._player) {
      return false;
    }
    return this._player.isMuted();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#setVolume */
  setVolume(volume: number) {
    if (!this._player) {
      return;
    }
    this._player.setVolume(volume);
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVolume */
  getVolume(): number {
    if (!this._player) {
      return 0;
    }
    return this._player.getVolume();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#setPlaybackRate */
  setPlaybackRate(playbackRate: number) {
    if (!this._player) {
      return;
    }
    return this._player.setPlaybackRate(playbackRate);
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getPlaybackRate */
  getPlaybackRate(): number {
    if (!this._player) {
      return 0;
    }
    return this._player.getPlaybackRate();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getAvailablePlaybackRates */
  getAvailablePlaybackRates(): number[] {
    if (!this._player) {
      return [];
    }
    return this._player.getAvailablePlaybackRates();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoLoadedFraction */
  getVideoLoadedFraction(): number {
    if (!this._player) {
      return 0;
    }
    return this._player.getVideoLoadedFraction();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getPlayerState */
  getPlayerState(): YT.PlayerState | undefined {
    if (!window.YT) {
      return undefined;
    }

    if (!this._player) {
      return YT.PlayerState.UNSTARTED;
    }
    return this._player.getPlayerState();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getCurrentTime */
  getCurrentTime(): number {
    if (!this._player) {
      return 0;
    }
    return this._player.getCurrentTime();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getPlaybackQuality */
  getPlaybackQuality(): YT.SuggestedVideoQuality {
    if (!this._player) {
      return 'default';
    }
    return this._player.getPlaybackQuality();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getAvailableQualityLevels */
  getAvailableQualityLevels(): YT.SuggestedVideoQuality[] {
    if (!this._player) {
      return [];
    }
    return this._player.getAvailableQualityLevels();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getDuration */
  getDuration(): number {
    if (!this._player) {
      return 0;
    }
    return this._player.getDuration();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoUrl */
  getVideoUrl(): string {
    if (!this._player) {
      return '';
    }
    return this._player.getVideoUrl();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoEmbedCode */
  getVideoEmbedCode(): string {
    if (!this._player) {
      return '';
    }
    return this._player.getVideoEmbedCode();
  }
}

/** Listens to changes to the given width and height and sets it on the player. */
function bindSizeToPlayer(
  playerObs: Observable<YT.Player | undefined>,
  widthObs: Observable<number>,
  heightObs: Observable<number>
) {
  return combineLatest(playerObs, widthObs, heightObs)
      .subscribe(([player, width, height]) => player && player.setSize(width, height));
}

/** Listens to changes from the suggested quality and sets it on the given player. */
function bindSuggestedQualityToPlayer(
  playerObs: Observable<YT.Player | undefined>,
  suggestedQualityObs: Observable<YT.SuggestedVideoQuality | undefined>
) {
  return combineLatest(
    playerObs,
    suggestedQualityObs
  ).subscribe(
    ([player, suggestedQuality]) =>
        player && suggestedQuality && player.setPlaybackQuality(suggestedQuality));
}

/**
 * Returns an observable that emits the loaded player once it's ready. Certain properties/methods
 * won't be available until the iframe finishes loading.
 */
function waitUntilReady()
    : OperatorFunction<UninitializedPlayer | undefined, Player | undefined> {
  return flatMap(player => {
      if (!player) {
        return observableOf<Player|undefined>(undefined);
      }
      if ('getPlayerStatus' in player) {
        return observableOf(player as Player);
      }
      // The player is not initialized fully until the ready is called.
      return fromPlayerOnReady(player)
          .pipe(first(), startWith(undefined));
    });
}

/** Since removeEventListener is not on Player when it's initialized, we can't use fromEvent. */
function fromPlayerOnReady(player: UninitializedPlayer): Observable<Player> {
  return new Observable<Player>(emitter => {
    let aborted = false;

    const onReady = (event: YT.PlayerEvent) => {
      if (aborted) {
        return;
      }
      event.target.removeEventListener('onReady', onReady);
      emitter.next(event.target);
    };

    player.addEventListener('onReady', onReady);

    return () => {
      aborted = true;
    };
  });
}

/** Create an observable for the player based on the given options. */
function createPlayerObservable(
  youtubeContainer: Observable<HTMLElement>,
  videoIdObs: Observable<string | undefined>,
  iframeApiAvailableObs: Observable<boolean>,
  widthObs: Observable<number>,
  heightObs: Observable<number>,
  events: YT.Events,
): Observable<UninitializedPlayer | undefined> {

  const playerOptions =
    videoIdObs
    .pipe(
      withLatestFrom(combineLatest(widthObs, heightObs)),
      map(([videoId, [width, height]]) => videoId ? ({videoId, width, height, events}) : undefined),
    );

  return combineLatest(youtubeContainer, playerOptions)
      .pipe(
        skipUntilRememberLatest(iframeApiAvailableObs),
        scan(syncPlayerState, undefined),
        distinctUntilChanged());
}

/** Skips the given observable until the other observable emits true, then emit the latest. */
function skipUntilRememberLatest<T>(notifier: Observable<boolean>): MonoTypeOperatorFunction<T> {
  return pipe(
    combineLatestOp(notifier),
    skipWhile(([_, doneSkipping]) => !doneSkipping),
    map(([value]) => value));
}

/** Destroy the player if there are no options, or create the player if there are options. */
function syncPlayerState(
  player: UninitializedPlayer | undefined,
  [container, videoOptions]: [HTMLElement, YT.PlayerOptions | undefined],
): UninitializedPlayer | undefined {
  if (!videoOptions) {
    if (player) {
      player.destroy();
    }
    return;
  }
  if (player) {
    return player;
  }

  const newPlayer: UninitializedPlayer = new YT.Player(container, videoOptions);
  // Bind videoId for future use.
  newPlayer.videoId = videoOptions.videoId;
  return newPlayer;
}

/**
 * Call cueVideoById if the videoId changes, or when start or end seconds change. cueVideoById will
 * change the loaded video id to the given videoId, and set the start and end times to the given
 * start/end seconds.
 */
function bindCueVideoCall(
  playerObs: Observable<Player | undefined>,
  videoIdObs: Observable<string | undefined>,
  startSecondsObs: Observable<number | undefined>,
  endSecondsObs: Observable<number | undefined>,
  suggestedQualityObs: Observable<YT.SuggestedVideoQuality | undefined>,
  destroyed: Observable<undefined>,
) {
  const cueOptionsObs = combineLatest(startSecondsObs, endSecondsObs)
    .pipe(map(([startSeconds, endSeconds]) => ({startSeconds, endSeconds})));

  // Only respond to changes in cue options if the player is not running.
  const filteredCueOptions = cueOptionsObs
    .pipe(filterOnOther(playerObs, player => !!player && !hasPlayerStarted(player)));

  // If the video id changed, there's no reason to run 'cue' unless the player
  // was initialized with a different video id.
  const changedVideoId = videoIdObs
      .pipe(filterOnOther(playerObs, (player, videoId) => !!player && player.videoId !== videoId));

  // If the player changed, there's no reason to run 'cue' unless there are cue options.
  const changedPlayer = playerObs.pipe(
    filterOnOther(
      combineLatest(videoIdObs, cueOptionsObs),
      ([videoId, cueOptions], player) =>
          !!player &&
            (videoId != player.videoId || !!cueOptions.startSeconds || !!cueOptions.endSeconds)));

  merge(changedPlayer, changedVideoId, filteredCueOptions)
    .pipe(
      withLatestFrom(combineLatest(playerObs, videoIdObs, cueOptionsObs, suggestedQualityObs)),
      map(([_, values]) => values),
      takeUntil(destroyed),
    )
    .subscribe(([player, videoId, cueOptions, suggestedQuality]) => {
      if (!videoId || !player) {
        return;
      }
      player.videoId = videoId;
      player.cueVideoById({
        videoId,
        suggestedQuality,
        ...cueOptions,
      });
    });
}

function hasPlayerStarted(player: YT.Player): boolean {
  return [YT.PlayerState.UNSTARTED, YT.PlayerState.CUED].indexOf(player.getPlayerState()) === -1;
}

/** Combines the two observables temporarily for the filter function. */
function filterOnOther<R, T>(
  otherObs: Observable<T>,
  filterFn: (t: T, r?: R) => boolean,
): MonoTypeOperatorFunction<R> {
  return pipe(
    withLatestFrom(otherObs),
    filter(([value, other]) => filterFn(other, value)),
    map(([value]) => value),
  );
}
