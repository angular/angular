import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ContributorService } from './contributor.service';
import { ContributorGroup } from './contributors.model';

describe('ContributorService', () => {

  let injector: Injector;
  let contribService: ContributorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    injector = TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ContributorService
      ]
    });

    contribService = injector.get<ContributorService>(ContributorService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should make a single connection to the server', () => {
    const req = httpMock.expectOne({});
    expect(req.request.url).toBe('generated/contributors.json');
  });

  describe('#contributors', () => {

    let contribs: ContributorGroup[];
    let testData: any;

    beforeEach(() => {
      testData = getTestContribs();
      httpMock.expectOne({}).flush(testData);
      contribService.contributors.subscribe(results => contribs = results);
    });

    it('contributors observable should complete', () => {
      let completed = false;
      contribService.contributors.subscribe({complete: () => completed = true});
      expect(completed).withContext('observable completed').toBe(true);
    });

    it('should reshape the contributor json to expected result', () => {
      const groupNames = contribs.map(g => g.name).join(',');
      expect(groupNames).toEqual('Angular,Collaborators,GDE');
    });

    it('should have expected "GDE" contribs in order', () => {
      const gde = contribs[2];
      const actualAngularNames = gde.contributors.map(l => l.name).join(',');
      const expectedAngularNames = [testData.gkalpak, testData.kapunahelewong].map(l => l.name).join(',');
      expect(actualAngularNames).toEqual(expectedAngularNames);
    });

    it('should support including a contributor in multiple groups', () => {
      const contributor = testData.gkalpak;
      const matchedGroups = contribs
          .filter(group => group.contributors.includes(contributor))
          .map(group => group.name);

      expect(matchedGroups).toEqual(['Collaborators', 'GDE']);
    });
  });

  it('should do WHAT(?) if the request fails');
});

function getTestContribs() {
  return {
    kapunahelewong: {
      name: 'Kapunahele Wong',
      picture: 'kapunahelewong.jpg',
      website: 'https://github.com/kapunahelewong',
      twitter: 'kapunahele',
      bio: 'Kapunahele is a front-end developer and contributor to angular.io',
      groups: ['GDE']
    },
    misko: {
      name: 'Miško Hevery',
      picture: 'misko.jpg',
      twitter: 'mhevery',
      website: 'http://misko.hevery.com',
      bio: 'Miško Hevery is the creator of AngularJS framework.',
      groups: ['Angular']
    },
    igor: {
      name: 'Igor Minar',
      picture: 'igor-minar.jpg',
      twitter: 'IgorMinar',
      website: 'https://google.com/+IgorMinar',
      bio: 'Igor is a software engineer at Angular.',
      groups: ['Angular']
    },
    kara: {
      name: 'Kara Erickson',
      picture: 'kara-erickson.jpg',
      twitter: 'karaforthewin',
      website: 'https://github.com/kara',
      bio: 'Kara is a software engineer on the Angular team at Angular and a co-organizer of the Angular-SF Meetup. ',
      groups: ['Angular']
    },
    jeffcross: {
      name: 'Jeff Cross',
      picture: 'jeff-cross.jpg',
      twitter: 'jeffbcross',
      website: 'https://twitter.com/jeffbcross',
      bio: 'Jeff was one of the earliest core team members on AngularJS.',
      groups: ['Collaborators']
    },
    naomi: {
      name: 'Naomi Black',
      picture: 'naomi.jpg',
      twitter: 'naomitraveller',
      website: 'http://google.com/+NaomiBlack',
      bio: 'Naomi is Angular\'s TPM generalist and jack-of-all-trades.',
      groups: ['Angular']
    },
    gkalpak: {
      name: 'George Kalpakas',
      picture: 'gkalpak.jpg',
      twitter: 'gkalpakas',
      bio: 'George wrote this test, so he gets to have his name included here.',
      groups: ['GDE', 'Collaborators'],
    }
 };
}
