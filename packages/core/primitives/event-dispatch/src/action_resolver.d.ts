/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as a11yClick from './a11y_click';
import * as eventInfoLib from './event_info';
/** Resolves actions for Events. */
export declare class ActionResolver {
    private a11yClickSupport;
    private clickModSupport;
    private readonly syntheticMouseEventSupport;
    private updateEventInfoForA11yClick?;
    private preventDefaultForA11yClick?;
    private populateClickOnlyAction?;
    constructor({ syntheticMouseEventSupport, clickModSupport, }?: {
        syntheticMouseEventSupport?: boolean;
        clickModSupport?: boolean;
    });
    resolveEventType(eventInfo: eventInfoLib.EventInfo): void;
    resolveAction(eventInfo: eventInfoLib.EventInfo): void;
    resolveParentAction(eventInfo: eventInfoLib.EventInfo): void;
    /**
     * Searches for a jsaction that the DOM event maps to and creates an
     * object containing event information used for dispatching by
     * jsaction.Dispatcher. This method populates the `action` and `actionElement`
     * fields of the EventInfo object passed in by finding the first
     * jsaction attribute above the target Node of the event, and below
     * the container Node, that specifies a jsaction for the event
     * type. If no such jsaction is found, then action is undefined.
     *
     * @param eventInfo `EventInfo` to set `action` and `actionElement` if an
     *    action is found on any `Element` in the path of the `Event`.
     */
    private populateAction;
    /**
     * Walk to the parent node, unless the node has a different owner in
     * which case we walk to the owner. Attempt to walk to host of a
     * shadow root if needed.
     */
    private getParentNode;
    /**
     * Accesses the jsaction map on a node and retrieves the name of the
     * action the given event is mapped to, if any. It parses the
     * attribute value and stores it in a property on the node for
     * subsequent retrieval without re-parsing and re-accessing the
     * attribute.
     *
     * @param actionElement The DOM node to retrieve the jsaction map from.
     * @param eventInfo `EventInfo` to set `action` and `actionElement` if an
     *    action is found on the `actionElement`.
     */
    private populateActionOnElement;
    /**
     * Parses and caches an element's jsaction element into a map.
     *
     * This is primarily for internal use.
     *
     * @param actionElement The DOM node to retrieve the jsaction map from.
     * @return Map from event to qualified name of the jsaction bound to it.
     */
    private parseActions;
    addA11yClickSupport(updateEventInfoForA11yClick: typeof a11yClick.updateEventInfoForA11yClick, preventDefaultForA11yClick: typeof a11yClick.preventDefaultForA11yClick, populateClickOnlyAction: typeof a11yClick.populateClickOnlyAction): void;
}
