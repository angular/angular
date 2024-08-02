import {marked} from 'marked';
import {renderer} from './renderer';

/** Globally configures marked for rendering JsDoc content to HTML. */
export function configureMarkedGlobally() {
  marked.use({
    renderer,
  });
}
