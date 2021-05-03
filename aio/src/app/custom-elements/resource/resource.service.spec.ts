import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ResourceService } from './resource.service';
import { Category } from './resource.model';

describe('ResourceService', () => {

  let injector: Injector;
  let resourceService: ResourceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    injector = TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ResourceService
      ]
    });

    resourceService = injector.get(ResourceService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should make a single connection to the server', () => {
    const req = httpMock.expectOne({});
    expect(req.request.url).toBe('generated/resources.json');
  });

  describe('#categories', () => {

    let categories: Category[];
    let testData: any;

    beforeEach(() => {
      testData = getTestResources();
      httpMock.expectOne({}).flush(testData);
      resourceService.categories.subscribe(results => categories = results);
    });

    it('categories observable should complete', () => {
      let completed = false;
      resourceService.categories.subscribe({complete: () => completed = true});
      expect(completed).toBe(true, 'observable completed');
    });

    it('should reshape contributors.json to sorted category array', () => {
      const actualIds = categories.map(c => c.id).join(',');
      expect(actualIds).toBe('cat-1,cat-3');
    });

    it('should convert ids to canonical form', () => {
      // canonical form is lowercase with dashes for spaces
      const cat = categories[1];
      const sub = cat.subCategories[0];
      const res = sub.resources[0];

      expect(cat.id).toBe('cat-3', 'category id');
      expect(sub.id).toBe('cat3-subcat2', 'subcat id');
      expect(res.id).toBe('cat3-subcat2-res1', 'resources id');
    });

    it('resource knows its category and sub-category titles', () => {
      const cat = categories[1];
      const sub = cat.subCategories[0];
      const res = sub.resources[0];
      expect(res.category).toBe(cat.title, 'category title');
      expect(res.subCategory).toBe(sub.title, 'subcategory title');
    });

    it('should have expected SubCategories of "Cat 3"', () => {
      const actualIds = categories[1].subCategories.map(s => s.id).join(',');
      expect(actualIds).toBe('cat3-subcat2,cat3-subcat1');
    });

    it('should have expected sorted resources of "Cat 1:SubCat1"', () => {
      const actualIds = categories[0].subCategories[0].resources.map(r => r.id).join(',');
      expect(actualIds).toBe('a-a-a,s-s-s,z-z-z');
    });
  });

  it('should do WHAT(?) if the request fails');
});

function getTestResources() {
  return {
    'Cat 3': {
      order: 3,
      subCategories: {
        'Cat3 SubCat1': {
          order: 2,
          resources: {
            'Cat3 SubCat1 Res1': {
              desc: 'Meetup in Barcelona, Spain. ',
              title: 'Angular Beers',
              url: 'http://www.meetup.com/AngularJS-Beers/',
            },
            'Cat3 SubCat1 Res2': {
              desc: 'Angular Camps in Barcelona, Spain.',
              title: 'Angular Camp',
              url: 'http://angularcamp.org/',
            },
          },
        },
        'Cat3 SubCat2': {
          order: 1,
          resources: {
            'Cat3 SubCat2 Res1': {
              desc: 'A community index of components and libraries',
              title: 'Catalog of Angular Components & Libraries',
              url: 'https://a/b/c',
            },
          },
        },
      },
    },
    'Cat 1': {
      order: 1,
      subCategories: {
        'Cat1 SubCat1': {
          order: 1,
          resources: {
            'S S S': {
              desc: 'SSS',
              title: 'Sssss',
              url: 'http://s/s/s',
            },
            'A A A': {
              desc: 'AAA',
              title: 'Aaaa',
              url: 'http://a/a/a',
            },
            'Z Z Z': {
              desc: 'ZZZ',
              title: 'Zzzzz',
              url: 'http://z/z/z',
            },
          },
        },
      },
    },
  };
}
