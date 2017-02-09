import { fakeAsync, tick} from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/delay';

import { DocService } from './doc.service';
import { Doc, DocMetadata } from './doc.model';

import { NavEngine } from './nav-engine.service';

const fakeDoc: Doc = {
  metadata: {
    id: 'fake',
    title: 'All about the fake',
    url: 'assets/documents/fake.html'
  },
  content: 'fake content'
};

describe('NavEngine', () => {

  let navEngine: NavEngine;

  beforeEach(() => {
    this.fakeDoc = {
      metadata: {
        id: 'fake',
        title: 'All about the fake',
        url: 'assets/documents/fake.html'
      },
      content: 'fake content'
    };

    const docService: any = jasmine.createSpyObj('docService', ['getDoc']);
    docService.getDoc.and.callFake((id: string) => of(this.fakeDoc).delay(0));

    navEngine = new NavEngine(docService);
  });

  it('should set currentDoc to fake doc when navigate to fake id', fakeAsync(() => {
    navEngine.navigate('fake');
    tick();
    expect(navEngine.currentDoc.content).toBe(this.fakeDoc.content);
  }));
});
