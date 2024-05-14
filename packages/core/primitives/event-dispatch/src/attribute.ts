/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The jsaction attribute defines a mapping of a DOM event to a
 * generic event (aka jsaction), to which the actual event handlers
 * that implement the behavior of the application are bound. The
 * value is a semicolon separated list of colon separated pairs of
 * an optional DOM event name and a jsaction name. If the optional
 * DOM event name is omitted, 'click' is assumed. The jsaction names
 * are dot separated pairs of a namespace and a simple jsaction
 * name.
 *
 * See grammar in README.md for expected syntax in the attribute value.
 */
export const JSACTION = 'jsaction';

/**
 * The oi attribute is a log impression tag for impression logging
 * and action tracking. For an element that carries a jsaction
 * attribute, the element is identified for the purpose of
 * impression logging and click tracking by the dot separated path
 * of all oi attributes in the chain of ancestors of the element.
 *
 * Used by ActionFlow.
 */
export const OI = 'oi';

/**
 * The ved attribute is an encoded ClickTrackingCGI proto to track
 * visual elements.
 *
 * Used by ActionFlow.
 */
export const VED = 'ved';

/**
 * The vet attribute is the visual element type used to identify tracked
 * visual elements.
 */
export const VET = 'vet';

/**
 * Support for iteration on reprocessing.
 *
 * Used by ActionFlow.
 */
export const JSINSTANCE = 'jsinstance';

/**
 * All click jsactions that happen on the element that carries this
 * attribute or its descendants are automatically logged.
 * Impressions of jsactions on these elements are tracked too, if
 * requested by the impression() method of ActionFlow.
 *
 * Used by ActionFlow.
 */
export const JSTRACK = 'jstrack';

export const Attribute = {JSACTION, OI, VED, VET, JSINSTANCE, JSTRACK};
