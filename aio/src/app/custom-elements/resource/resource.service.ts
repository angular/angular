import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConnectableObservable, Observable } from 'rxjs';
import { map, publishLast } from 'rxjs/operators';

import { Category, Resource, SubCategory } from './resource.model';
import { CONTENT_URL_PREFIX } from 'app/documents/document.service';

const resourcesPath = CONTENT_URL_PREFIX + 'resources.json';

@Injectable()
export class ResourceService {
  categories: Observable<Category[]>;

  constructor(private http: HttpClient) {
    this.categories = this.getCategories();
  }

  private getCategories(): Observable<Category[]> {

    const categories = this.http.get<any>(resourcesPath).pipe(
      map(data => mkCategories(data)),
      publishLast(),
    );

    (categories as ConnectableObservable<Category[]>).connect();
    return categories;
  };
}

// Extract sorted Category[] from resource JSON data
function mkCategories(categoryJson: any): Category[] {
  return Object.keys(categoryJson).map(catKey => {
    const cat = categoryJson[catKey];
    return {
      id: makeId(catKey),
      title: catKey,
      order: cat.order,
      subCategories: mkSubCategories(cat.subCategories, catKey)
    } as Category;
  })
  .sort(compareCats);
}

// Extract sorted SubCategory[] from JSON category data
function mkSubCategories(subCategoryJson: any, catKey: string): SubCategory[] {
  return Object.keys(subCategoryJson).map(subKey => {
      const sub = subCategoryJson[subKey];
      return {
        id: makeId(subKey),
        title: subKey,
        order: sub.order,
        resources: mkResources(sub.resources, subKey, catKey)
      } as SubCategory;
  })
  .sort(compareCats);
}

// Extract sorted Resource[] from JSON subcategory data
function mkResources(resourceJson: any, subKey: string, catKey: string): Resource[] {
  return Object.keys(resourceJson).map(resKey => {
    const res = resourceJson[resKey];
    res.category = catKey;
    res.subCategory = subKey;
    res.id = makeId(resKey);
    return res as Resource;
  })
  .sort(compareTitles);
}

function compareCats(l: Category | SubCategory, r: Category | SubCategory) {
  return l.order === r.order ? compareTitles(l, r) : l.order > r.order ? 1 : -1;
}

function compareTitles(l: {title: string}, r: {title: string}) {
 return l.title.toUpperCase() > r.title.toUpperCase() ? 1 : -1;
}

function makeId(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-');
}
