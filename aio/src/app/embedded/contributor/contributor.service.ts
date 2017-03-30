import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishLast';

import { Logger } from 'app/shared/logger.service';
import { Contributor } from './contributors.model';

const contributorsPath = 'content/contributors.json';

@Injectable()
export class ContributorService {
  contributors: Observable<Map<string, Contributor[]>>;

  constructor(private http: Http, private logger: Logger) {
    this.contributors = this.getContributors();
  }

  private getContributors() {
    const contributors = this.http.get(contributorsPath)
      .map(res => res.json())
      .map(contribs => {
        const contribGroups = new Map<string, Contributor[]>();

        Object.keys(contribs).forEach(key => {
          const contributor = contribs[key];
          const group = contributor.group;
          const contribGroup = contribGroups[group];
          if (contribGroup) {
            contribGroup.push(contributor);
          } else {
            contribGroups[group] = [contributor];
          }
        });

        return contribGroups;
      })
      .publishLast();
    contributors.connect();
    return contributors;
  }
}
