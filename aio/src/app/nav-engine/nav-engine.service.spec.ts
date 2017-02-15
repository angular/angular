import { fakeAsync, tick} from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/delay';

import { DocService } from './doc.service';
import { Doc, DocMetadata, NavNode } from './doc.model';

import { NavEngine } from './nav-engine.service';

describe('NavEngine', () => {

  let fakeDoc: Doc;
  let navEngine: NavEngine;

  beforeEach(() => {
    fakeDoc = {
      metadata: {
        docId: 'fake',
        title: 'All about the fake'
      },
      content: 'fake content'
    };

    const docService: any = jasmine.createSpyObj('docService', ['getDoc']);
    docService.getDoc.and.returnValue(of(fakeDoc).delay(0));

    navEngine = new NavEngine(docService);
  });

  it('should set currentDoc to fake doc when navigate to fake id', fakeAsync(() => {
    navEngine.navigate('fake');
    navEngine.currentDoc.subscribe(doc =>
      expect(doc.content).toBe(fakeDoc.content)
    );
    tick();
  }));
});
