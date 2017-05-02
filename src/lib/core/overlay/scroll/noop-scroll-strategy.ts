import {ScrollStrategy} from './scroll-strategy';

/**
 * Scroll strategy that doesn't do anything.
 */
export class NoopScrollStrategy implements ScrollStrategy {
  enable() { }
  disable() { }
  attach() { }
}
