import { isPresent } from 'angular2/src/facade/lang';
export class HtmlTextAst {
    constructor(value, sourceSpan) {
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    visit(visitor, context) { return visitor.visitText(this, context); }
}
export class HtmlAttrAst {
    constructor(name, value, sourceSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    visit(visitor, context) { return visitor.visitAttr(this, context); }
}
export class HtmlElementAst {
    constructor(name, attrs, children, sourceSpan) {
        this.name = name;
        this.attrs = attrs;
        this.children = children;
        this.sourceSpan = sourceSpan;
    }
    visit(visitor, context) { return visitor.visitElement(this, context); }
}
export function htmlVisitAll(visitor, asts, context = null) {
    var result = [];
    asts.forEach(ast => {
        var astResult = ast.visit(visitor, context);
        if (isPresent(astResult)) {
            result.push(astResult);
        }
    });
    return result;
}
