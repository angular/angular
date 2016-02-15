import {Url} from '../url_parser';

export class RecognizedUrlSegment {
  constructor(
    public urlPath: string,
    public urlParams: string[],
    public allParams: {[key: string]: string},
    public auxiliary: Url[],
    public nextSegment: Url) {}
}


export class GeneratedUrlSegment {
  constructor(public urlPath: string, public urlParams: string[]) {}
}


export interface Recognizer {
  specificity: string;
  terminal: boolean;
  hash: string;

  recognize(beginningSegment: Url): RecognizedUrlSegment;
  generate(params: {[key: string]: any}): GeneratedUrlSegment;
}

