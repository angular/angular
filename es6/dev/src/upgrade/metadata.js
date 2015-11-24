import { DirectiveResolver } from 'angular2/angular2';
var COMPONENT_SELECTOR = /^[\w|-]*$/;
var SKEWER_CASE = /-(\w)/g;
var directiveResolver = new DirectiveResolver();
export function getComponentInfo(type) {
    var resolvedMetadata = directiveResolver.resolve(type);
    var selector = resolvedMetadata.selector;
    if (!selector.match(COMPONENT_SELECTOR)) {
        throw new Error('Only selectors matching element names are supported, got: ' + selector);
    }
    var selector = selector.replace(SKEWER_CASE, (all, letter) => letter.toUpperCase());
    return {
        type: type,
        selector: selector,
        inputs: parseFields(resolvedMetadata.inputs),
        outputs: parseFields(resolvedMetadata.outputs)
    };
}
export function parseFields(names) {
    var attrProps = [];
    if (names) {
        for (var i = 0; i < names.length; i++) {
            var parts = names[i].split(':');
            var prop = parts[0].trim();
            var attr = (parts[1] || parts[0]).trim();
            var capitalAttr = attr.charAt(0).toUpperCase() + attr.substr(1);
            attrProps.push({
                prop: prop,
                attr: attr,
                bracketAttr: `[${attr}]`,
                parenAttr: `(${attr})`,
                bracketParenAttr: `[(${attr})]`,
                onAttr: `on${capitalAttr}`,
                bindAttr: `bind${capitalAttr}`,
                bindonAttr: `bindon${capitalAttr}`
            });
        }
    }
    return attrProps;
}
//# sourceMappingURL=metadata.js.map