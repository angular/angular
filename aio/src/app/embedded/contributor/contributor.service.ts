import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishLast';

import { Logger } from 'app/shared/logger.service';
import { Contributor, ContributorGroup } from './contributors.model';
import { CONTENT_URL_PREFIX } from 'app/documents/document.service';

const contributorsPath = CONTENT_URL_PREFIX + 'contributors.json';
const knownGroups = ['Angular', 'Community'];

@Injectable()
export class ContributorService {
  contributors: Observable<ContributorGroup[]>;

  constructor(private http: Http, private logger: Logger) {
    this.contributors = this.getContributors();
  }

  private getContributors() {
    const contributors = this.http.get(contributorsPath)
      .map(res => res.json())

      // Create group map
      .map(contribs => {
        const contribMap = new Map<string, Contributor[]>();
        Object.keys(contribs).forEach(key => {
          const contributor = contribs[key];
          const group = contributor.group;
          const contribGroup = contribMap[group];
          if (contribGroup) {
            contribGroup.push(contributor);
          } else {
            contribMap[group] = [contributor];
          }
        });

        return contribMap;
      })

      // Flatten group map into sorted group array of sorted contributors
      .map(cmap => {
        return Object.keys(cmap).map(key => {
          const order = knownGroups.indexOf(key);
          return {
            name: key,
            order: order === -1 ? knownGroups.length : order,
            contributors: cmap[key].sort(compareContributors)
          } as ContributorGroup;
        })
        .sort(compareGroups);
      })
      .publishLast();

    contributors.connect();
    return contributors;
  }
}

function compareContributors(l: Contributor, r: Contributor) {
 return l.name.toUpperCase() > r.name.toUpperCase() ? 1 : -1;
}

function compareGroups(l: ContributorGroup, r: ContributorGroup) {
  return l.order === r.order ?
    (l.name > r.name ? 1 : -1) :
     l.order > r.order ? 1 : -1;
}
