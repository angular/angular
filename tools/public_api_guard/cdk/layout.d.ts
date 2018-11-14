export declare class BreakpointObserver implements OnDestroy {
    constructor(mediaMatcher: MediaMatcher, zone: NgZone);
    isMatched(value: string | string[]): boolean;
    ngOnDestroy(): void;
    observe(value: string | string[]): Observable<BreakpointState>;
}

export declare const Breakpoints: {
    XSmall: string;
    Small: string;
    Medium: string;
    Large: string;
    XLarge: string;
    Handset: string;
    Tablet: string;
    Web: string;
    HandsetPortrait: string;
    TabletPortrait: string;
    WebPortrait: string;
    HandsetLandscape: string;
    TabletLandscape: string;
    WebLandscape: string;
};

export interface BreakpointState {
    breakpoints: {
        [key: string]: boolean;
    };
    matches: boolean;
}

export declare class LayoutModule {
}

export declare class MediaMatcher {
    constructor(platform: Platform);
    matchMedia(query: string): MediaQueryList;
}
