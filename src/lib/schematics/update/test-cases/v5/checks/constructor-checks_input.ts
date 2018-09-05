/*
 * Fake definitions because the property name rules can only determine the host type
 * properly by using type checking.
 */

class Platform {
  IOS: boolean;
}

interface Document {}

class NativeDateAdapter {
  constructor(_locale: string, _platform: Platform) {}
}

class MatAutocomplete {
  constructor(_changeDetector: any, _elementRef: any, _defaults: string[]) {}
}

class MatTooltip {
  constructor(
    private _overlay: any,
    private _elementRef: any,
    private _scrollDispatcher: any,
    private _viewContainerRef: any,
    private _ngZone: any,
    private _platform: any,
    private _ariaDescriber: any,
    private _focusMonitor: any,
    private _scrollStrategy: any,
    private _dir: any,
    private _defaultOptions: {opt1: string}) {}
}

class MatIconRegistry {
  constructor(_httpClient: any, _sanitizer: any, _document: Document) {}
}

class MatCalendar {
  constructor(_intl: any, _adapter: any, _formats: any, _changeDetector: any) {}
}

/* Actual test case using the previously defined definitions. */

class A extends NativeDateAdapter {
  constructor() {
    super('hardCodedLocale');
  }
}

const _A = new NativeDateAdapter('myLocale');

class B extends MatAutocomplete {
  constructor(cd: any, elementRef: any) {
    super(cd, elementRef);
  }
}

const _B = new MatAutocomplete({}, {});

class C extends MatTooltip {
  constructor(a: any, b: any, c: any, d: any, e: any, f: any, g: any, h: any, i: any, j: any) {
    super(a, b, c, d, e, f, g, h, i, j);
  }
}

const _C = new MatTooltip({}, {}, {}, {}, {}, {}, {}, {}, {}, {});

class D extends MatIconRegistry {
  constructor(httpClient: any, sanitizer: any) {
    super(httpClient, sanitizer);
  }
}

const _D = new MatIconRegistry({}, {});

class E extends MatCalendar {
  constructor(elementRef: any,
              intl: any,
              zone: any,
              adapter: any,
              formats: any,
              cd: any,
              dir: any) {
    super(elementRef, intl, zone, adapter, formats, cd, dir);
  }
}

const _E = new MatCalendar({}, {}, {}, {}, {}, {}, {});
