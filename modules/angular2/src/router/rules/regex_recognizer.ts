import {RegExpWrapper, isBlank} from 'angular2/src/facade/lang';
import {Url, RootUrl, serializeParams} from './url_parser';
import {GeneratedUrlSegment, RecognizedUrlSegment, Recognizer} from './recognizer';

export class RegexRecognizer implements Recognizer {
  public hash: string;
  public terminal: boolean = true;
  public specificity: string = '2';
  private _regex: RegExp;

  constructor(private _reString: string, private _serializer: (params: {[key: string]: any}) => GeneratedUrlSegment) {
    this.hash = this._reString;
    this._regex = RegExpWrapper.create(this._reString);
  }

  recognize(beginningSegment: Url): RecognizedUrlSegment {
    var url = beginningSegment.toString();
    var match = RegExpWrapper.firstMatch(this._regex, url);

    if (isBlank(match)) {
      return null;
    }

    var params : {[key: string]: string} = {};

    for (let i = 0; i < match.length; i += 1) {
      params[i.toString()] = match[i];
    }

    return new RecognizedUrlSegment(url, [], params, [], null);
  }

  generate(params: {[key: string]: any}): GeneratedUrlSegment {
    return this._serializer(params);
  }
}