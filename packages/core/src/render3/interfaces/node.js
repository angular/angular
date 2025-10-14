/**
 * Converts `TNodeType` into human readable text.
 * Make sure this matches with `TNodeType`
 */
export function toTNodeTypeAsString(tNodeType) {
  let text = '';
  tNodeType & 1 /* TNodeType.Text */ && (text += '|Text');
  tNodeType & 2 /* TNodeType.Element */ && (text += '|Element');
  tNodeType & 4 /* TNodeType.Container */ && (text += '|Container');
  tNodeType & 8 /* TNodeType.ElementContainer */ && (text += '|ElementContainer');
  tNodeType & 16 /* TNodeType.Projection */ && (text += '|Projection');
  tNodeType & 32 /* TNodeType.Icu */ && (text += '|IcuContainer');
  tNodeType & 64 /* TNodeType.Placeholder */ && (text += '|Placeholder');
  tNodeType & 128 /* TNodeType.LetDeclaration */ && (text += '|LetDeclaration');
  return text.length > 0 ? text.substring(1) : text;
}
/**
 * Helper function to detect if a given value matches a `TNode` shape.
 *
 * The logic uses the `insertBeforeIndex` and its possible values as
 * a way to differentiate a TNode shape from other types of objects
 * within the `TView.data`. This is not a perfect check, but it can
 * be a reasonable differentiator, since we control the shapes of objects
 * within `TView.data`.
 */
export function isTNodeShape(value) {
  return (
    value != null &&
    typeof value === 'object' &&
    (value.insertBeforeIndex === null ||
      typeof value.insertBeforeIndex === 'number' ||
      Array.isArray(value.insertBeforeIndex))
  );
}
export function isLetDeclaration(tNode) {
  return !!((tNode.type & 128) /* TNodeType.LetDeclaration */);
}
/**
 * Returns `true` if the `TNode` has a directive which has `@Input()` for `class` binding.
 *
 * ```html
 * <div my-dir [class]="exp"></div>
 * ```
 * and
 * ```ts
 * @Directive({
 * })
 * class MyDirective {
 *   @Input()
 *   class: string;
 * }
 * ```
 *
 * In the above case it is necessary to write the reconciled styling information into the
 * directive's input.
 *
 * @param tNode
 */
export function hasClassInput(tNode) {
  return (tNode.flags & 8) /* TNodeFlags.hasClassInput */ !== 0;
}
/**
 * Returns `true` if the `TNode` has a directive which has `@Input()` for `style` binding.
 *
 * ```html
 * <div my-dir [style]="exp"></div>
 * ```
 * and
 * ```ts
 * @Directive({
 * })
 * class MyDirective {
 *   @Input()
 *   class: string;
 * }
 * ```
 *
 * In the above case it is necessary to write the reconciled styling information into the
 * directive's input.
 *
 * @param tNode
 */
export function hasStyleInput(tNode) {
  return (tNode.flags & 16) /* TNodeFlags.hasStyleInput */ !== 0;
}
//# sourceMappingURL=node.js.map
