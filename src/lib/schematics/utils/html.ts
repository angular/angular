import {Tree, SchematicsException} from '@angular-devkit/schematics';
import * as parse5 from 'parse5';
import {getIndexHtmlPath} from './ast';
import {InsertChange} from './devkit-utils/change';
import {Project} from './devkit-utils/config';

/**
 * Parses the index.html file to get the HEAD tag position.
 * @param host the tree we are traversing
 * @param src the src path of the html file to parse
 */
export function getHeadTag(host: Tree, src: string) {
  const document = parse5.parse(src,
    {locationInfo: true}) as parse5.AST.Default.Document;

  let head;
  const visit = (nodes: parse5.AST.Default.Node[]) => {
    nodes.forEach(node => {
      const element = <parse5.AST.Default.Element>node;
      if (element.tagName === 'head') {
        head = element;
      } else {
        if (element.childNodes) {
          visit(element.childNodes);
        }
      }
    });
  };

  visit(document.childNodes);

  if (!head) {
    throw new SchematicsException('Head element not found!');
  }

  return {
    position: head.__location.startTag.endOffset
  };
}

/**
 * Adds a link to the index.html head tag Example:
 * `<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">`
 * @param host The tree we are updating
 * @param project The project we're targeting.
 * @param link html element string we are inserting.
 */
export function addHeadLink(host: Tree, project: Project, link: string) {
  const indexPath = getIndexHtmlPath(host, project);
  const buffer = host.read(indexPath);
  if (!buffer) {
    throw new SchematicsException(`Could not find file for path: ${indexPath}`);
  }

  const src = buffer.toString();
  if (src.indexOf(link) === -1) {
    const node = getHeadTag(host, src);
    const insertion = new InsertChange(indexPath, node.position, link);
    const recorder = host.beginUpdate(indexPath);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    host.commitUpdate(recorder);
  }
}
