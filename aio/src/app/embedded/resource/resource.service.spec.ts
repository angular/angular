import { ReflectiveInjector } from '@angular/core';
import { Http, ConnectionBackend, RequestOptions, BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { ResourceService } from './resource.service';
import { Category, SubCategory, Resource } from './resource.model';
import { Logger } from 'app/shared/logger.service';

describe('ResourceService', () => {

  let injector: ReflectiveInjector;
  let backend: MockBackend;
  let resourceService: ResourceService;

  function createResponse(body: any) {
    return new Response(new ResponseOptions({ body: JSON.stringify(body) }));
  }

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      ResourceService,
      { provide: ConnectionBackend, useClass: MockBackend },
      { provide: RequestOptions, useClass: BaseRequestOptions },
      Http,
      Logger
    ]);

    backend = injector.get(ConnectionBackend);
    resourceService = injector.get(ResourceService);
  });

  it('should be creatable', () => {
    expect(resourceService).toBeTruthy();
  });

  it('should make a single connection to the server', () => {
    expect(backend.connectionsArray.length).toEqual(1);
    expect(backend.connectionsArray[0].request.url).toEqual('generated/resources.json');
  });

  describe('#categories', () => {

    let categories: Category[];
    let testData: any;

    beforeEach(() => {
      testData = getTestResources();
      backend.connectionsArray[0].mockRespond(createResponse(testData));
      resourceService.categories.subscribe(results => categories = results);
    });

    it('categories observable should complete', () => {
      let completed = false;
      resourceService.categories.subscribe(null, null, () => completed = true);
      expect(true).toBe(true, 'observable completed');
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
  // tslint:disable:quotemark
  return {
    "Cat 3": {
      "order": 3,
      "subCategories": {
        "Cat3 SubCat1": {
          "order": 2,
          "resources": {
            "Cat3 SubCat1 Res1": {
              "desc": "Meetup in Barcelona, Spain. ",
              "rev": true,
              "title": "Angular Beers",
              "url": "http://www.meetup.com/AngularJS-Beers/"
            },
            "Cat3 SubCat1 Res2": {
              "desc": "Angular Camps in Barcelona, Spain.",
              "rev": true,
              "title": "Angular Camp",
              "url": "http://angularcamp.org/"
            }
          }
        },
        "Cat3 SubCat2": {
          "order": 1,
          "resources": {
            "Cat3 SubCat2 Res1": {
              "desc": "A community index of components and libraries",
              "rev": true,
              "title": "Catalog of Angular Components & Libraries",
              "url": "https://a/b/c"
            }
          }
        },
      }
    },
    "Cat 1": {
      "order": 1,
      "subCategories": {
        "Cat1 SubCat1": {
          "order": 1,
          "resources": {
            "S S S": {
              "desc": "SSS",
              "rev": true,
              "title": "Sssss",
              "url": "http://s/s/s"
            },
            "A A A": {
             "desc": "AAA",
              "rev": true,
              "title": "Aaaa",
              "url": "http://a/a/a"
            },
            "Z Z Z": {
             "desc": "ZZZ",
              "rev": true,
              "title": "Zzzzz",
              "url": "http://z/z/z"
            }
          }
        },
      },
    }
  };
}
