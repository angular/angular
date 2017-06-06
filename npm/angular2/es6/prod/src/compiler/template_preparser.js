import { isBlank } from 'angular2/src/facade/lang';
import { splitNsName } from './html_tags';
const NG_CONTENT_SELECT_ATTR = 'select';
const NG_CONTENT_ELEMENT = 'ng-content';
const LINK_ELEMENT = 'link';
const LINK_STYLE_REL_ATTR = 'rel';
const LINK_STYLE_HREF_ATTR = 'href';
const LINK_STYLE_REL_VALUE = 'stylesheet';
const STYLE_ELEMENT = 'style';
const SCRIPT_ELEMENT = 'script';
const NG_NON_BINDABLE_ATTR = 'ngNonBindable';
const NG_PROJECT_AS = 'ngProjectAs';
export function preparseElement(ast) {
    var selectAttr = null;
    var hrefAttr = null;
    var relAttr = null;
    var nonBindable = false;
    var projectAs = null;
    ast.attrs.forEach(attr => {
        let lcAttrName = attr.name.toLowerCase();
        if (lcAttrName == NG_CONTENT_SELECT_ATTR) {
            selectAttr = attr.value;
        }
        else if (lcAttrName == LINK_STYLE_HREF_ATTR) {
            hrefAttr = attr.value;
        }
        else if (lcAttrName == LINK_STYLE_REL_ATTR) {
            relAttr = attr.value;
        }
        else if (attr.name == NG_NON_BINDABLE_ATTR) {
            nonBindable = true;
        }
        else if (attr.name == NG_PROJECT_AS) {
            if (attr.value.length > 0) {
                projectAs = attr.value;
            }
        }
    });
    selectAttr = normalizeNgContentSelect(selectAttr);
    var nodeName = ast.name.toLowerCase();
    var type = PreparsedElementType.OTHER;
    if (splitNsName(nodeName)[1] == NG_CONTENT_ELEMENT) {
        type = PreparsedElementType.NG_CONTENT;
    }
    else if (nodeName == STYLE_ELEMENT) {
        type = PreparsedElementType.STYLE;
    }
    else if (nodeName == SCRIPT_ELEMENT) {
        type = PreparsedElementType.SCRIPT;
    }
    else if (nodeName == LINK_ELEMENT && relAttr == LINK_STYLE_REL_VALUE) {
        type = PreparsedElementType.STYLESHEET;
    }
    return new PreparsedElement(type, selectAttr, hrefAttr, nonBindable, projectAs);
}
export var PreparsedElementType;
(function (PreparsedElementType) {
    PreparsedElementType[PreparsedElementType["NG_CONTENT"] = 0] = "NG_CONTENT";
    PreparsedElementType[PreparsedElementType["STYLE"] = 1] = "STYLE";
    PreparsedElementType[PreparsedElementType["STYLESHEET"] = 2] = "STYLESHEET";
    PreparsedElementType[PreparsedElementType["SCRIPT"] = 3] = "SCRIPT";
    PreparsedElementType[PreparsedElementType["OTHER"] = 4] = "OTHER";
})(PreparsedElementType || (PreparsedElementType = {}));
export class PreparsedElement {
    constructor(type, selectAttr, hrefAttr, nonBindable, projectAs) {
        this.type = type;
        this.selectAttr = selectAttr;
        this.hrefAttr = hrefAttr;
        this.nonBindable = nonBindable;
        this.projectAs = projectAs;
    }
}
function normalizeNgContentSelect(selectAttr) {
    if (isBlank(selectAttr) || selectAttr.length === 0) {
        return '*';
    }
    return selectAttr;
}
