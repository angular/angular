import { ReflectiveInjector } from '@angular/core';
import { Http, ConnectionBackend, RequestOptions, BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { ContributorService } from './contributor.service';
import { Contributor, ContributorGroup } from './contributors.model';
import { Logger } from 'app/shared/logger.service';

describe('ContributorService', () => {

  let injector: ReflectiveInjector;
  let backend: MockBackend;
  let contribService: ContributorService;

  function createResponse(body: any) {
    return new Response(new ResponseOptions({ body: JSON.stringify(body) }));
  }

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        ContributorService,
        { provide: ConnectionBackend, useClass: MockBackend },
        { provide: RequestOptions, useClass: BaseRequestOptions },
        Http,
        Logger
    ]);

    backend = injector.get(ConnectionBackend);
    contribService = injector.get(ContributorService);
  });

  it('should be creatable', () => {
    expect(contribService).toBeTruthy();
  });

  it('should make a single connection to the server', () => {
    expect(backend.connectionsArray.length).toEqual(1);
    expect(backend.connectionsArray[0].request.url).toEqual('generated/contributors.json');
  });

  describe('#contributors', () => {

    let contribs: ContributorGroup[];
    let testData: any;

    beforeEach(() => {
      testData = getTestContribs();
      backend.connectionsArray[0].mockRespond(createResponse(testData));
      contribService.contributors.subscribe(results => contribs = results);
    });

    it('contributors observable should complete', () => {
      let completed = false;
      contribService.contributors.subscribe(null, null, () => completed = true);
      expect(true).toBe(true, 'observable completed');
    });

    it('should reshape the contributor json to expected result', () => {
      const groupNames = contribs.map(g => g.name).join(',');
      expect(groupNames).toEqual('Angular,Community');
    });

    it('should have expected "Community" contribs in order', () => {
      const community = contribs[1];
      const actualAngularNames = community.contributors.map(l => l.name).join(',');
      const expectedAngularNames = [testData.jeffcross, testData.kapunahelewong].map(l => l.name).join(',');
      expect(actualAngularNames).toEqual(expectedAngularNames);
    });
  });

  it('should do WHAT(?) if the request fails');
});

function getTestContribs() {
  // tslint:disable:quotemark
  return {
    "kapunahelewong": {
      "name": "Kapunahele Wong",
      "picture": "kapunahelewong.jpg",
      "website": " https://github.com/kapunahelewong",
      "twitter": "kapunahele",
      "bio": "Kapunahele is a front-end developer and contributor to angular.io",
      "group": "Community"
    },
    "misko": {
      "name": "Miško Hevery",
      "picture": "misko.jpg",
      "twitter": "mhevery",
      "website": "http://misko.hevery.com",
      "bio": "Miško Hevery is the creator of AngularJS framework.",
      "group": "Angular"
    },
    "igor": {
      "name": "Igor Minar",
      "picture": "igor-minar.jpg",
      "twitter": "IgorMinar",
      "website": "https://google.com/+IgorMinar",
      "bio": "Igor is a software engineer at Angular.",
      "group": "Angular"
    },
    "kara": {
      "name": "Kara Erickson",
      "picture": "kara-erickson.jpg",
      "twitter": "karaforthewin",
      "website": "https://github.com/kara",
      "bio": "Kara is a software engineer on the Angular team at Angular and a co-organizer of the Angular-SF Meetup. ",
      "group": "Angular"
    },
    "jeffcross": {
      "name": "Jeff Cross",
      "picture": "jeff-cross.jpg",
      "twitter": "jeffbcross",
      "website": "https://twitter.com/jeffbcross",
      "bio": "Jeff was one of the earliest core team members on AngularJS.",
      "group": "Community"
    },
    "naomi": {
      "name": "Naomi Black",
      "picture": "naomi.jpg",
      "twitter": "naomitraveller",
      "website": "http://google.com/+NaomiBlack",
      "bio": "Naomi is Angular's TPM generalist and jack-of-all-trades.",
      "group": "Angular"
    }
 };
}
