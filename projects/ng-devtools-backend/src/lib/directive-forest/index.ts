import { LViewBuilder } from './lview';
import { DebugNodeTreeBuilder } from './lview-debug';

export { getLViewFromDirectiveOrElementInstance, getDirectiveHostElement, METADATA_PROPERTY_NAME } from './lview';

const builders = [new DebugNodeTreeBuilder(), new LViewBuilder()];

let strategy: null | DebugNodeTreeBuilder | LViewBuilder = null;

const selectStrategy = (lView: any) => {
  for (const builder of builders) {
    if (builder.supports(lView)) {
      return builder;
    }
  }
  return null;
};

export const buildDirectiveTree = (element: Element) => {
  if (!strategy) {
    strategy = selectStrategy(element);
  }
  if (!strategy) {
    console.error('Unable to parse the component tree');
    return [];
  }
  console.time('tree-start');
  const result = strategy.build(element);
  console.timeEnd('tree-start');
  return result;
};
