import { Injectable, OnDestroy } from '@angular/core';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';

import { Doc } from './doc.model';
import { DocService } from './doc.service';

@Injectable()
export class NavEngine implements OnDestroy {

  private docSubject = new ReplaySubject<Doc>(1);
  private subscription: Subscription;

  /** Observable of the most recent document from a `navigate` call */
  currentDoc = this.docSubject.asObservable();

  constructor(private docService: DocService) {}

  /**
   * Navigate pushes new doc for the given `id` into the `currentDoc` observable.
   * TODO: handle document retrieval error
   */
  navigate(docId: string) {
    this.ngOnDestroy();
    this.subscription = this.docService.getDoc(docId).subscribe(doc => this.docSubject.next(doc));
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }
}


