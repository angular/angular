import { Injectable } from '@angular/core';

@Injectable()
export class HelperService {

  generateUniqueIdString(): string {
    return this.guidPartial() + this.guidPartial(true) + this.guidPartial(true) + this.guidPartial();
  }

  getCheckboxModel(): any {
    return [
      {
        name: 'Template syntax',
        value: 'Template syntax'
      },
      {
        name: 'Observables',
        value: 'Observables'
      },
      {
        name: 'Components',
        value: 'Components'
      },
      {
        name: 'Forms',
        value: 'Forms'
      }
    ];
  }

  getRadiobuttonsModel(): any {
    return [
      {
        name: 'TypeScript',
        value: 'TypeScript'
      },
      {
        name: 'JavaScript',
        value: 'JavaScript'
      },
      {
        name: 'ES6',
        value: 'ES6'
      },
      {
        name: 'Dart',
        value: 'Dart'
      }
    ];
  }

  getSelectOptions(): any {
    return [
      {
        name: 'Curiosity',
        value: 'Curiosity'
      },
      {
        name: 'Increased userbase',
        value: 'Increased userbase'
      },
      {
        name: 'Legal reasons',
        value: 'Legal reasons'
      }
    ];
  }

  getCountriesWorkedIn(): Array<string> {
    return ['The USA', 'The Netherlands', 'South Africa', 'Germany', 'The UK'];
  }

  toggleItemInArray(stringArray: Array<string>, item: string): void {
    let entryIndex = stringArray.indexOf(item);
    if (entryIndex !== -1) {
      stringArray.splice(entryIndex, 1);
    } else {
      stringArray.push(item);
    }
  }

  isStringInArray(stringArray: Array<string>, item: string): boolean {
    return stringArray.indexOf(item.toString()) !== -1;
  }

  removeHtmlStringBreaks(inputValue: string): string {
    return inputValue.replace(new RegExp('<div>', 'g'), '')
      .replace(new RegExp('</div>', 'g'), '\n')
      .replace(new RegExp('<br>', 'g'), '');
  }

  guidPartial(s?: boolean): string {
    let p = (Math.random().toString(16) + '000000000').substr(2, 8);
    return s ? '-' + p.substr(0, 4) + '-' + p.substr(4, 4) : p;
  }

}
