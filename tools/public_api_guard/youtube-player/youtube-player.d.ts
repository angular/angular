export declare class YouTubePlayer implements AfterViewInit, OnDestroy, OnInit {
    apiChange: EventEmitter<YT.PlayerEvent>;
    endSeconds: number | undefined;
    error: EventEmitter<YT.OnErrorEvent>;
    height: number | undefined;
    playbackQualityChange: EventEmitter<YT.OnPlaybackQualityChangeEvent>;
    playbackRateChange: EventEmitter<YT.OnPlaybackRateChangeEvent>;
    ready: EventEmitter<YT.PlayerEvent>;
    showBeforeIframeApiLoads: boolean | undefined;
    startSeconds: number | undefined;
    stateChange: EventEmitter<YT.OnStateChangeEvent>;
    suggestedQuality: YT.SuggestedVideoQuality | undefined;
    videoId: string | undefined;
    width: number | undefined;
    youtubeContainer: ElementRef<HTMLElement>;
    constructor(_ngZone: NgZone);
    createEventsBoundInZone(): YT.Events;
    getAvailablePlaybackRates(): number[];
    getAvailableQualityLevels(): YT.SuggestedVideoQuality[];
    getCurrentTime(): number;
    getDuration(): number;
    getPlaybackQuality(): YT.SuggestedVideoQuality;
    getPlaybackRate(): number;
    getPlayerState(): YT.PlayerState | undefined;
    getVideoEmbedCode(): string;
    getVideoLoadedFraction(): number;
    getVideoUrl(): string;
    getVolume(): number;
    isMuted(): boolean;
    mute(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    pauseVideo(): void;
    playVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    setPlaybackRate(playbackRate: number): void;
    setVolume(volume: number): void;
    stopVideo(): void;
    unMute(): void;
}

export declare class YouTubePlayerModule {
}
