export class MatchedUrl {
    constructor(urlPath, urlParams, allParams, auxiliary, rest) {
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this.allParams = allParams;
        this.auxiliary = auxiliary;
        this.rest = rest;
    }
}
export class GeneratedUrl {
    constructor(urlPath, urlParams) {
        this.urlPath = urlPath;
        this.urlParams = urlParams;
    }
}
