import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { PromiseWrapper } from 'angular2/src/facade/promise';
import { Map } from 'angular2/src/facade/collection';
import { ComponentInstruction } from './instruction';
import { PathRecognizer } from './path_recognizer';
export class RouteMatch {
}
export class PathMatch extends RouteMatch {
    constructor(instruction, remaining, remainingAux) {
        super();
        this.instruction = instruction;
        this.remaining = remaining;
        this.remainingAux = remainingAux;
    }
}
export class RedirectMatch extends RouteMatch {
    constructor(redirectTo, specificity) {
        super();
        this.redirectTo = redirectTo;
        this.specificity = specificity;
    }
}
export class RedirectRecognizer {
    constructor(path, redirectTo) {
        this.path = path;
        this.redirectTo = redirectTo;
        this._pathRecognizer = new PathRecognizer(path);
        this.hash = this._pathRecognizer.hash;
    }
    /**
     * Returns `null` or a `ParsedUrl` representing the new path to match
     */
    recognize(beginningSegment) {
        var match = null;
        if (isPresent(this._pathRecognizer.recognize(beginningSegment))) {
            match = new RedirectMatch(this.redirectTo, this._pathRecognizer.specificity);
        }
        return PromiseWrapper.resolve(match);
    }
    generate(params) {
        throw new BaseException(`Tried to generate a redirect.`);
    }
}
// represents something like '/foo/:bar'
export class RouteRecognizer {
    // TODO: cache component instruction instances by params and by ParsedUrl instance
    constructor(path, handler) {
        this.path = path;
        this.handler = handler;
        this.terminal = true;
        this._cache = new Map();
        this._pathRecognizer = new PathRecognizer(path);
        this.specificity = this._pathRecognizer.specificity;
        this.hash = this._pathRecognizer.hash;
        this.terminal = this._pathRecognizer.terminal;
    }
    recognize(beginningSegment) {
        var res = this._pathRecognizer.recognize(beginningSegment);
        if (isBlank(res)) {
            return null;
        }
        return this.handler.resolveComponentType().then((_) => {
            var componentInstruction = this._getInstruction(res['urlPath'], res['urlParams'], res['allParams']);
            return new PathMatch(componentInstruction, res['nextSegment'], res['auxiliary']);
        });
    }
    generate(params) {
        var generated = this._pathRecognizer.generate(params);
        var urlPath = generated['urlPath'];
        var urlParams = generated['urlParams'];
        return this._getInstruction(urlPath, urlParams, params);
    }
    generateComponentPathValues(params) {
        return this._pathRecognizer.generate(params);
    }
    _getInstruction(urlPath, urlParams, params) {
        if (isBlank(this.handler.componentType)) {
            throw new BaseException(`Tried to get instruction before the type was loaded.`);
        }
        var hashKey = urlPath + '?' + urlParams.join('?');
        if (this._cache.has(hashKey)) {
            return this._cache.get(hashKey);
        }
        var instruction = new ComponentInstruction(urlPath, urlParams, this.handler.data, this.handler.componentType, this.terminal, this.specificity, params);
        this._cache.set(hashKey, instruction);
        return instruction;
    }
}
