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
    expect(backend.connectionsArray[0].request.url).toEqual('content/contributors.json');
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
      const groupNames = contribs.map(g => g.name);
      expect(groupNames).toEqual(['Lead', 'Google', 'Community']);
    });

    it('should have expected "Lead" contribs in order', () => {
      const leads = contribs[0];
      const actualLeadNames = leads.contributors.map(l => l.name).join(',');
      const expectedLeadNames = [testData.igor, testData.misko, testData.naomi].map(l => l.name).join(',');
      expect(actualLeadNames).toEqual(expectedLeadNames);
    });
  });

  it('should do WHAT(?) if the request fails');
});

function getTestContribs() {
  // tslint:disable:quotemark
  return {
    "misko": {
      "name": "Miško Hevery",
      "picture": "misko.jpg",
      "twitter": "mhevery",
      "website": "http://misko.hevery.com",
      "bio": "Miško Hevery is the creator of AngularJS framework.",
      "group": "Lead"
    },
    "igor": {
      "name": "Igor Minar",
      "picture": "igor-minar.jpg",
      "twitter": "IgorMinar",
      "website": "https://google.com/+IgorMinar",
      "bio": "Igor is a software engineer at Google.",
      "group": "Lead"
    },
    "kara": {
      "name": "Kara Erickson",
      "picture": "kara-erickson.jpg",
      "twitter": "karaforthewin",
      "website": "https://github.com/kara",
      "bio": "Kara is a software engineer on the Angular team at Google and a co-organizer of the Angular-SF Meetup. ",
      "group": "Google"
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
      "group": "Lead"
    }
 };
}
