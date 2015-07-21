import {isPresent} from 'angular2/src/facade/lang';

export function parseAndAssignParamString(splitToken: string, paramString: string,
                                          keyValueMap: StringMap<string, string>): void {
  var first = paramString[0];
  if (first == '?' || first == ';') {
    paramString = paramString.substring(1);
  }

  paramString.split(splitToken)
      .forEach((entry) => {
        var tuple = entry.split('=');
        var key = tuple[0];
        if (!isPresent(keyValueMap[key])) {
          var value = tuple.length > 1 ? tuple[1] : true;
          keyValueMap[key] = value;
        }
      });
}
