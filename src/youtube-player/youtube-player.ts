import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  ViewChild,
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
} from 'rxjs';

import {
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
} from 'rxjs/operators';

declare global {
  interface Window { YT: typeof YT | undefined; }
}

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
export class YouTubePlayer implements AfterViewInit, OnDestroy {
  /** YouTube Video ID to view */
  get videoId(): string | undefined {
    return this._player && this._player.videoId;
  }

  @Input()
  set videoId(videoId: string | undefined) {
    this._videoId.emit(videoId);
  }

  private _videoId = new EventEmitter<string | undefined>();

  /** The element that will be replaced by the iframe. */
  @ViewChild('youtube_container', {static: false}) youtubeContainer: ElementRef | undefined;
  private _youtubeContainer = new EventEmitter<HTMLElement>();
  private _destroyed = new EventEmitter<undefined>();

  private _player: Player | undefined;

  constructor() {
    if (!window.YT) {
      throw new Error('Namespace YT not found, cannot construct embedded youtube player. ' +
          'Please install the YouTube Player API Reference for iframe Embeds: ' +
          'https://developers.google.com/youtube/iframe_api_reference');
    }

    /** An observable of the currently loaded player. */
    const playerObs =
      createPlayerObservable(
        this._youtubeContainer,
        this._videoId,
      ).pipe(waitUntilReady(), takeUntil(this._destroyed), publish());

    /** Set up side effects to bind inputs to the player. */
    playerObs.subscribe(player => this._player = player);

    bindCueVideoCall(playerObs, this._videoId, this._destroyed);

    // After all of the subscriptions are set up, connect the observable.
    (playerObs as ConnectableObservable<Player>).connect();
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
    this._destroyed.emit();
  }
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
): Observable<UninitializedPlayer | undefined> {

  const playerOptions =
    videoIdObs
    .pipe(
      map((videoId) => videoId ? {videoId} : undefined),
    );

  return combineLatest(youtubeContainer, playerOptions)
      .pipe(scan(syncPlayerState, undefined), distinctUntilChanged());
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
  destroyed: Observable<undefined>,
) {

  // If the video id changed, there's no reason to run 'cue' unless the player
  // was initialized with a different video id.
  const changedVideoId = videoIdObs
      .pipe(filterOnOther(playerObs, (player, videoId) => !!player && player.videoId !== videoId));

  // If the player changed, there's no reason to run 'cue' unless there are cue options.
  const changedPlayer = playerObs.pipe(
    filterOnOther(videoIdObs, (videoId, player) => !!player && videoId != player.videoId));

  merge(changedPlayer, changedVideoId)
      .pipe(
        withLatestFrom(combineLatest(playerObs, videoIdObs)),
        map(([_, values]) => values),
        takeUntil(destroyed),
      )
      .subscribe(([player, videoId]) => {
        if (!videoId || !player) {
          return;
        }
        player.videoId = videoId;
        player.cueVideoById({videoId});
      });
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
