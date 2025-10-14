import {getLView} from '../state';
/**
 * Returns the current OpaqueViewState instance.
 *
 * Used in conjunction with the restoreView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 *
 * @codeGenApi
 */
export function ɵɵgetCurrentView() {
  return getLView();
}
//# sourceMappingURL=get_current_view.js.map
