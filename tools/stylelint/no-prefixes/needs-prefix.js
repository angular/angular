const autoprefixer = require('autoprefixer');
const Browsers = require('autoprefixer/lib/browsers');
const Prefixes = require('autoprefixer/lib/prefixes');

/**
 * Utility to be used when checking whether a CSS declaration needs to be prefixed. Based on
 * Stylelint's `no-vendor-prefix` rule, but instead of checking whether a rule has a prefix,
 * we check whether it needs one.
 * Reference https://github.com/stylelint/stylelint/blob/master/lib/utils/isAutoprefixable.js
 */
module.exports = class NeedsPrefix {
  constructor(browsers) {
    this._prefixes = new Prefixes(
      autoprefixer.data.prefixes,
      new Browsers(autoprefixer.data.browsers, browsers)
    );
  }

  /** Checks whether an @-rule needs to be prefixed. */
  atRule(identifier) {
    return this._prefixes.add[`@${identifier.toLowerCase()}`];
  }

  /** Checks whether a selector needs to be prefixed. */
  selector(identifier) {
    return this._prefixes.add.selectors.some(selectorObj => {
      return identifier.toLowerCase() === selectorObj.name;
    });
  }

  /** Checks whether a media query value needs to be prefixed. */
  mediaFeature(identifier) {
    return identifier.toLowerCase().indexOf('device-pixel-ratio') > -1;
  }

  /** Checks whether a property needs to be prefixed. */
  property(identifier) {
    // `fill` is an edge case since it was part of a proposal that got renamed to `stretch`.
    // see: https://www.w3.org/TR/css-sizing-3/#changes
    if (!identifier || identifier === 'fill') return false;

    const needsPrefix = autoprefixer.data.prefixes[identifier.toLowerCase()];
    const browsersThatNeedPrefix = needsPrefix ? needsPrefix.browsers : null;

    return !!browsersThatNeedPrefix && !!this._prefixes.browsers.selected.find(browser => {
      return browsersThatNeedPrefix.indexOf(browser) > -1;
    });
  }

  /** Checks whether a CSS property value needs to be prefixed. */
  value(prop, value) {
    if (!prop || !value) return false;

    const possiblePrefixableValues = this._prefixes.add[prop.toLowerCase()] &&
        this._prefixes.add[prop.toLowerCase()].values;

    return !!possiblePrefixableValues && possiblePrefixableValues.some(valueObj => {
      return value.toLowerCase() === valueObj.name;
    });
  }
};
