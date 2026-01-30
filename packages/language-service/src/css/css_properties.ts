/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  isValidCSSPropertyVSCode,
  isObsoleteCSSPropertyVSCode,
  findSimilarCSSProperties,
  isUnitlessNumericProperty,
} from './css_language_service';

// Re-export for external consumers
export {findSimilarCSSProperties} from './css_language_service';

// Note: This module provides Angular-specific CSS utilities for style bindings.
// It uses vscode-css-languageservice (via css_language_service.ts) for comprehensive
// CSS property validation (2000+ properties from W3C/MDN data).
//
// Reference: https://github.com/microsoft/vscode-css-languageservice

/**
 * Unit suffixes that can be appended to CSS property bindings.
 * When a unit suffix is present, the binding expects a number instead of a string.
 * For example: [style.width.px]="100" expects a number.
 *
 * This is Angular-specific - not available in vscode-css-languageservice.
 */
export const CSS_UNIT_SUFFIXES = [
  'px',
  'em',
  'rem',
  '%',
  'vh',
  'vw',
  'vmin',
  'vmax',
  's',
  'ms',
  'deg',
  'rad',
  'turn',
  'grad',
  'fr',
  'ch',
  'ex',
  'cm',
  'mm',
  'in',
  'pt',
  'pc',
  'dpi',
  'dpcm',
  'dppx',
] as const;

export type CSSUnitSuffix = (typeof CSS_UNIT_SUFFIXES)[number];

/**
 * Information about an obsolete CSS property.
 */
export interface ObsoleteCSSProperty {
  /** The obsolete property name (camelCase). */
  name: string;
  /** The MDN documentation URL. */
  mdnUrl: string;
  /** Brief deprecation message. */
  message: string;
  /** The modern replacement property, if any. */
  replacement?: string;
  /** Whether this is an obsolete vendor-prefixed property. */
  isVendorPrefixed?: boolean;
}

/**
 * Map of obsolete CSS properties with their MDN links and replacements.
 * Based on csstype's ObsoleteProperties interface.
 *
 * @see https://github.com/frenic/csstype
 */
const OBSOLETE_CSS_PROPERTIES: ReadonlyMap<string, ObsoleteCSSProperty> = new Map([
  // Old Flexbox (display: box)
  [
    'boxAlign',
    {
      name: 'boxAlign',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/box-align',
      message: 'Use Flexbox `align-items` instead',
      replacement: 'alignItems',
    },
  ],
  [
    'boxDirection',
    {
      name: 'boxDirection',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/box-direction',
      message: 'Use Flexbox `flex-direction` instead',
      replacement: 'flexDirection',
    },
  ],
  [
    'boxFlex',
    {
      name: 'boxFlex',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/box-flex',
      message: 'Use Flexbox `flex` instead',
      replacement: 'flex',
    },
  ],
  [
    'boxFlexGroup',
    {
      name: 'boxFlexGroup',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/box-flex-group',
      message: 'Use Flexbox instead',
    },
  ],
  [
    'boxLines',
    {
      name: 'boxLines',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/box-lines',
      message: 'Use Flexbox `flex-wrap` instead',
      replacement: 'flexWrap',
    },
  ],
  [
    'boxOrdinalGroup',
    {
      name: 'boxOrdinalGroup',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/box-ordinal-group',
      message: 'Use Flexbox `order` instead',
      replacement: 'order',
    },
  ],
  [
    'boxOrient',
    {
      name: 'boxOrient',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/box-orient',
      message: 'Use Flexbox `flex-direction` instead',
      replacement: 'flexDirection',
    },
  ],
  [
    'boxPack',
    {
      name: 'boxPack',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/box-pack',
      message: 'Use Flexbox `justify-content` instead',
      replacement: 'justifyContent',
    },
  ],

  // Grid gap properties (replaced by gap, row-gap, column-gap)
  [
    'gridColumnGap',
    {
      name: 'gridColumnGap',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/column-gap',
      message: 'Use `column-gap` instead',
      replacement: 'columnGap',
    },
  ],
  [
    'gridRowGap',
    {
      name: 'gridRowGap',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/row-gap',
      message: 'Use `row-gap` instead',
      replacement: 'rowGap',
    },
  ],
  [
    'gridGap',
    {
      name: 'gridGap',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/gap',
      message: 'Use `gap` instead',
      replacement: 'gap',
    },
  ],

  // Page break properties (replaced by break-*)
  [
    'pageBreakAfter',
    {
      name: 'pageBreakAfter',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/page-break-after',
      message: 'Use `break-after` instead',
      replacement: 'breakAfter',
    },
  ],
  [
    'pageBreakBefore',
    {
      name: 'pageBreakBefore',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/page-break-before',
      message: 'Use `break-before` instead',
      replacement: 'breakBefore',
    },
  ],
  [
    'pageBreakInside',
    {
      name: 'pageBreakInside',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/page-break-inside',
      message: 'Use `break-inside` instead',
      replacement: 'breakInside',
    },
  ],

  // Old scroll snap properties
  [
    'scrollSnapCoordinate',
    {
      name: 'scrollSnapCoordinate',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/scroll-snap-coordinate',
      message: 'Use `scroll-snap-align` instead',
      replacement: 'scrollSnapAlign',
    },
  ],
  [
    'scrollSnapDestination',
    {
      name: 'scrollSnapDestination',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/scroll-snap-destination',
      message: 'Use CSS Scroll Snap Module Level 1 properties instead',
    },
  ],
  [
    'scrollSnapPointsX',
    {
      name: 'scrollSnapPointsX',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/scroll-snap-points-x',
      message: 'Use `scroll-snap-type` and `scroll-snap-align` instead',
      replacement: 'scrollSnapType',
    },
  ],
  [
    'scrollSnapPointsY',
    {
      name: 'scrollSnapPointsY',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/scroll-snap-points-y',
      message: 'Use `scroll-snap-type` and `scroll-snap-align` instead',
      replacement: 'scrollSnapType',
    },
  ],
  [
    'scrollSnapTypeX',
    {
      name: 'scrollSnapTypeX',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type-x',
      message: 'Use `scroll-snap-type` instead',
      replacement: 'scrollSnapType',
    },
  ],
  [
    'scrollSnapTypeY',
    {
      name: 'scrollSnapTypeY',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type-y',
      message: 'Use `scroll-snap-type` instead',
      replacement: 'scrollSnapType',
    },
  ],

  // IME mode (deprecated)
  [
    'imeMode',
    {
      name: 'imeMode',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/ime-mode',
      message: 'Deprecated. No replacement available.',
    },
  ],

  // Old inset properties (CSS Logical Properties transition)
  [
    'offsetBlock',
    {
      name: 'offsetBlock',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/inset-block',
      message: 'Use `inset-block` instead',
      replacement: 'insetBlock',
    },
  ],
  [
    'offsetBlockEnd',
    {
      name: 'offsetBlockEnd',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/inset-block-end',
      message: 'Use `inset-block-end` instead',
      replacement: 'insetBlockEnd',
    },
  ],
  [
    'offsetBlockStart',
    {
      name: 'offsetBlockStart',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/inset-block-start',
      message: 'Use `inset-block-start` instead',
      replacement: 'insetBlockStart',
    },
  ],
  [
    'offsetInline',
    {
      name: 'offsetInline',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/inset-inline',
      message: 'Use `inset-inline` instead',
      replacement: 'insetInline',
    },
  ],
  [
    'offsetInlineEnd',
    {
      name: 'offsetInlineEnd',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/inset-inline-end',
      message: 'Use `inset-inline-end` instead',
      replacement: 'insetInlineEnd',
    },
  ],
  [
    'offsetInlineStart',
    {
      name: 'offsetInlineStart',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/inset-inline-start',
      message: 'Use `inset-inline-start` instead',
      replacement: 'insetInlineStart',
    },
  ],

  // CSS Anchor Positioning transition
  [
    'insetArea',
    {
      name: 'insetArea',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/position-area',
      message: 'Renamed to `position-area`',
      replacement: 'positionArea',
    },
  ],
  [
    'positionTryOptions',
    {
      name: 'positionTryOptions',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/position-try-fallbacks',
      message: 'Renamed to `position-try-fallbacks`',
      replacement: 'positionTryFallbacks',
    },
  ],
]);

/**
 * Checks if a CSS property is obsolete/deprecated.
 * Uses vscode-css-languageservice for comprehensive deprecation data.
 *
 * @param propertyName The property name in camelCase.
 * @returns True if the property is obsolete.
 */
export function isObsoleteCSSProperty(propertyName: string): boolean {
  // Check our detailed obsolete properties first (has replacement info)
  if (OBSOLETE_CSS_PROPERTIES.has(propertyName)) {
    return true;
  }
  // Also check vscode-css-languageservice deprecation data
  return isObsoleteCSSPropertyVSCode(propertyName);
}

/**
 * Gets information about an obsolete CSS property.
 * @param propertyName The property name in camelCase.
 * @returns ObsoleteCSSProperty info if obsolete, undefined otherwise.
 */
export function getObsoleteCSSPropertyInfo(propertyName: string): ObsoleteCSSProperty | undefined {
  return OBSOLETE_CSS_PROPERTIES.get(propertyName);
}

/**
 * Mapping of CSS shorthand properties to their longhand properties.
 * When a shorthand is set, it will override any previously set longhand values.
 *
 * All property names are in camelCase.
 *
 * @see https://developer.mozilla.org/docs/Web/CSS/Shorthand_properties
 */
export const CSS_SHORTHAND_LONGHANDS: Readonly<Record<string, readonly string[]>> = {
  // Background
  background: [
    'backgroundColor',
    'backgroundImage',
    'backgroundPosition',
    'backgroundPositionX',
    'backgroundPositionY',
    'backgroundSize',
    'backgroundRepeat',
    'backgroundOrigin',
    'backgroundClip',
    'backgroundAttachment',
  ],

  // Border
  border: [
    'borderWidth',
    'borderStyle',
    'borderColor',
    'borderTop',
    'borderRight',
    'borderBottom',
    'borderLeft',
    'borderTopWidth',
    'borderTopStyle',
    'borderTopColor',
    'borderRightWidth',
    'borderRightStyle',
    'borderRightColor',
    'borderBottomWidth',
    'borderBottomStyle',
    'borderBottomColor',
    'borderLeftWidth',
    'borderLeftStyle',
    'borderLeftColor',
  ],
  borderTop: ['borderTopWidth', 'borderTopStyle', 'borderTopColor'],
  borderRight: ['borderRightWidth', 'borderRightStyle', 'borderRightColor'],
  borderBottom: ['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor'],
  borderLeft: ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor'],
  borderWidth: ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'],
  borderStyle: ['borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle'],
  borderColor: ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'],
  borderRadius: [
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomRightRadius',
    'borderBottomLeftRadius',
  ],

  // Margin & Padding
  margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],

  // Font
  font: [
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'lineHeight',
    'fontFamily',
  ],

  // Flexbox
  flex: ['flexGrow', 'flexShrink', 'flexBasis'],
  flexFlow: ['flexDirection', 'flexWrap'],

  // Grid
  grid: [
    'gridTemplateRows',
    'gridTemplateColumns',
    'gridTemplateAreas',
    'gridAutoRows',
    'gridAutoColumns',
    'gridAutoFlow',
  ],
  gridTemplate: ['gridTemplateRows', 'gridTemplateColumns', 'gridTemplateAreas'],
  gridArea: ['gridRowStart', 'gridColumnStart', 'gridRowEnd', 'gridColumnEnd'],
  gridRow: ['gridRowStart', 'gridRowEnd'],
  gridColumn: ['gridColumnStart', 'gridColumnEnd'],
  gap: ['rowGap', 'columnGap'],
  placeContent: ['alignContent', 'justifyContent'],
  placeItems: ['alignItems', 'justifyItems'],
  placeSelf: ['alignSelf', 'justifySelf'],

  // Animation & Transition
  animation: [
    'animationName',
    'animationDuration',
    'animationTimingFunction',
    'animationDelay',
    'animationIterationCount',
    'animationDirection',
    'animationFillMode',
    'animationPlayState',
  ],
  transition: [
    'transitionProperty',
    'transitionDuration',
    'transitionTimingFunction',
    'transitionDelay',
  ],

  // Text
  textDecoration: [
    'textDecorationLine',
    'textDecorationStyle',
    'textDecorationColor',
    'textDecorationThickness',
  ],

  // Outline
  outline: ['outlineWidth', 'outlineStyle', 'outlineColor'],

  // List
  listStyle: ['listStyleType', 'listStylePosition', 'listStyleImage'],

  // Overflow
  overflow: ['overflowX', 'overflowY'],

  // Inset (logical properties)
  inset: ['top', 'right', 'bottom', 'left'],
  insetBlock: ['insetBlockStart', 'insetBlockEnd'],
  insetInline: ['insetInlineStart', 'insetInlineEnd'],

  // Columns
  columns: ['columnWidth', 'columnCount'],
  columnRule: ['columnRuleWidth', 'columnRuleStyle', 'columnRuleColor'],
};

/**
 * Gets the longhand properties for a given shorthand property.
 * @param shorthandProperty The shorthand property name (camelCase).
 * @returns Array of longhand property names, or empty array if not a shorthand.
 */
export function getShorthandLonghands(shorthandProperty: string): readonly string[] {
  return CSS_SHORTHAND_LONGHANDS[shorthandProperty] ?? [];
}

/**
 * Checks if a property is a CSS shorthand property.
 * @param propertyName The property name (camelCase).
 * @returns True if the property is a shorthand.
 */
export function isShorthandProperty(propertyName: string): boolean {
  return propertyName in CSS_SHORTHAND_LONGHANDS;
}

/**
 * Gets the shorthand property that includes a given longhand property.
 * @param longhandProperty The longhand property name (camelCase).
 * @returns The shorthand property name, or null if not a longhand.
 */
export function getShorthandForLonghand(longhandProperty: string): string | null {
  for (const [shorthand, longhands] of Object.entries(CSS_SHORTHAND_LONGHANDS)) {
    if ((longhands as string[]).includes(longhandProperty)) {
      return shorthand;
    }
  }
  return null;
}

/**
 * Checks if a unit suffix is valid.
 * @param unit The unit suffix (e.g., 'px', 'em').
 * @returns True if the unit is valid.
 */
export function isValidCSSUnit(unit: string): boolean {
  return CSS_UNIT_SUFFIXES.includes(unit as CSSUnitSuffix);
}

/**
 * Gets all valid CSS unit suffixes.
 */
export function getCSSUnitSuffixes(): readonly string[] {
  return CSS_UNIT_SUFFIXES;
}

/**
 * Analysis result for a style binding.
 */
export interface StyleBindingAnalysis {
  /** The CSS property name (in camelCase). */
  propertyName: string;
  /** The unit suffix, if present (e.g., 'px'). */
  unit: string | null;
  /** The expected type for the binding expression. */
  expectedType: 'string' | 'number' | 'string | number';
  /** Whether the property name is valid. */
  isValidProperty: boolean;
  /** Whether the unit suffix is valid (if present). */
  isValidUnit: boolean;
  /** Suggested corrections if the property name is invalid. */
  suggestions: string[];
}

/**
 * Analyzes a style binding expression to determine validity and expected types.
 * @param bindingName The full binding name (e.g., 'width', 'width.px', 'backgroundColor').
 * @returns Analysis of the binding.
 */
export function analyzeStyleBinding(bindingName: string): StyleBindingAnalysis {
  const parts = bindingName.split('.');
  const propertyName = parts[0];
  const unit = parts.length > 1 ? parts[1] : null;

  const isValidProperty = isValidCSSPropertyVSCode(propertyName);
  const isValidUnit = unit === null || isValidCSSUnit(unit);

  // Determine expected type
  let expectedType: 'string' | 'number' | 'string | number';
  if (unit !== null) {
    // With unit suffix, expect number (e.g., [style.width.px]="100")
    expectedType = 'number';
  } else if (isUnitlessNumericProperty(propertyName)) {
    // Unitless numeric properties (opacity, z-index, flex-grow, etc.)
    expectedType = 'string | number';
  } else {
    // Standard style binding expects string
    expectedType = 'string';
  }

  return {
    propertyName,
    unit,
    expectedType,
    isValidProperty,
    isValidUnit,
    suggestions: isValidProperty ? [] : findSimilarCSSProperties(propertyName),
  };
}
