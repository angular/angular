export declare class YouTubePlayer implements AfterViewInit, OnDestroy, OnInit {
    readonly apiChange: Observable<YT.PlayerEvent>;
    set endSeconds(endSeconds: number | undefined);
    readonly error: Observable<YT.OnErrorEvent>;
    get height(): number | undefined;
    set height(height: number | undefined);
    readonly playbackQualityChange: Observable<YT.OnPlaybackQualityChangeEvent>;
    readonly playbackRateChange: Observable<YT.OnPlaybackRateChangeEvent>;
    get playerVars(): YT.PlayerVars | undefined;
    set playerVars(playerVars: YT.PlayerVars | undefined);
    readonly ready: Observable<YT.PlayerEvent>;
    showBeforeIframeApiLoads: boolean | undefined;
    set startSeconds(startSeconds: number | undefined);
    readonly stateChange: Observable<YT.OnStateChangeEvent>;
    set suggestedQuality(suggestedQuality: YT.SuggestedVideoQuality | undefined);
    get videoId(): string | undefined;
    set videoId(videoId: string | undefined);
    get width(): number | undefined;
    set width(width: number | undefined);
    youtubeContainer: ElementRef<HTMLElement>;
    constructor(_ngZone: NgZone, platformId: Object);
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
    static ɵcmp: i0.ɵɵComponentDeclaration<YouTubePlayer, "youtube-player", never, { "videoId": "videoId"; "height": "height"; "width": "width"; "startSeconds": "startSeconds"; "endSeconds": "endSeconds"; "suggestedQuality": "suggestedQuality"; "playerVars": "playerVars"; "showBeforeIframeApiLoads": "showBeforeIframeApiLoads"; }, { "ready": "ready"; "stateChange": "stateChange"; "error": "error"; "apiChange": "apiChange"; "playbackQualityChange": "playbackQualityChange"; "playbackRateChange": "playbackRateChange"; }, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<YouTubePlayer, never>;
}

export declare class YouTubePlayerModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<YouTubePlayerModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<YouTubePlayerModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<YouTubePlayerModule, [typeof i1.YouTubePlayer], never, [typeof i1.YouTubePlayer]>;
}
