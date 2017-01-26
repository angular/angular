
// Due to a bug in the ChromeDriver, Angular keyboard events are not triggered by `sendKeys`
// during E2E tests when using dot notation such as `(keydown.rightArrow)`. To get around this,
// we are temporarily using a single (keydown) handler.
// See: https://github.com/angular/angular/issues/9419

export const UP_ARROW = 38;
export const DOWN_ARROW = 40;
export const RIGHT_ARROW = 39;
export const LEFT_ARROW = 37;

export const PAGE_UP = 33;
export const PAGE_DOWN = 34;

export const HOME = 36;
export const END = 35;

export const ENTER = 13;
export const SPACE = 32;
export const TAB = 9;

export const ESCAPE = 27;
export const BACKSPACE = 8;
export const DELETE = 46;
