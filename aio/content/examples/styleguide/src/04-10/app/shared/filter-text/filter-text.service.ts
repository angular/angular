// #docregion
import { Injectable } from '@angular/core';

@Injectable()
export class FilterTextService {
  constructor() {
    console.log('Created an instance of FilterTextService');
  }

  filter(data: string, props: Array<string>, originalList: Array<any>) {
    let filteredList: any[];
    if (data && props && originalList) {
      data = data.toLowerCase();
      const filtered = originalList.filter(item => {
        let match = false;
        for (const prop of props) {
          if (item[prop].toString().toLowerCase().indexOf(data) > -1) {
            match = true;
            break;
          }
        }
        return match;
      });
      filteredList = filtered;
    } else {
      filteredList = originalList;
    }
    return filteredList;
  }
}
