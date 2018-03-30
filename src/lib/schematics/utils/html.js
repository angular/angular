"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const parse5 = require("parse5");
const ast_1 = require("./ast");
const change_1 = require("./devkit-utils/change");
/**
 * Parses the index.html file to get the HEAD tag position.
 * @param host the tree we are traversing
 * @param src the src path of the html file to parse
 */
function getHeadTag(host, src) {
    const document = parse5.parse(src, { locationInfo: true });
    let head;
    const visit = (nodes) => {
        nodes.forEach(node => {
            const element = node;
            if (element.tagName === 'head') {
                head = element;
            }
            else {
                if (element.childNodes) {
                    visit(element.childNodes);
                }
            }
        });
    };
    visit(document.childNodes);
    if (!head) {
        throw new schematics_1.SchematicsException('Head element not found!');
    }
    return {
        position: head.__location.startTag.endOffset
    };
}
exports.getHeadTag = getHeadTag;
/**
 * Adds a link to the index.html head tag Example:
 * `<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">`
 * @param host the tree we are updating
 * @param link html element string we are inserting.
 */
function addHeadLink(host, link) {
    const indexPath = ast_1.getIndexHtmlPath(host);
    const buffer = host.read(indexPath);
    if (!buffer) {
        throw new schematics_1.SchematicsException(`Could not find file for path: ${indexPath}`);
    }
    const src = buffer.toString();
    if (src.indexOf(link) === -1) {
        const node = getHeadTag(host, src);
        const insertion = new change_1.InsertChange(indexPath, node.position, link);
        const recorder = host.beginUpdate(indexPath);
        recorder.insertLeft(insertion.pos, insertion.toAdd);
        host.commitUpdate(recorder);
    }
}
exports.addHeadLink = addHeadLink;
//# sourceMappingURL=html.js.map