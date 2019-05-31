import {NgZone} from '@angular/core';
import {Observable} from 'rxjs';
import {WebWorkerMessage} from './web-worker-message';

export class WebWorkerClient {
  private nextId = 0;

  static create(worker: Worker, zone: NgZone) {
    return new WebWorkerClient(worker, zone);
  }

  private constructor(private worker: Worker, private zone: NgZone) {
  }

  sendMessage<T>(type: string, payload?: any): Observable<T> {

    return new Observable<T>(subscriber => {

      const id = this.nextId++;

      const handleMessage = (response: MessageEvent) => {
        const {type: responseType, id: responseId, payload: responsePayload} = response.data as WebWorkerMessage;
        if (type === responseType && id === responseId) {
          this.zone.run(() => {
            subscriber.next(responsePayload);
            subscriber.complete();
          });
        }
      };

      const handleError = (error: ErrorEvent) => {
        // Since we do not check type and id any error from the webworker will kill all subscribers
        this.zone.run(() => subscriber.error(error));
      };

      // Wire up the event listeners for this message
      this.worker.addEventListener('message', handleMessage);
      this.worker.addEventListener('error', handleError);

      // Post the message to the web worker
      this.worker.postMessage({type, id, payload});

      // At completion/error unwire the event listeners
      return () => {
        this.worker.removeEventListener('message', handleMessage);
        this.worker.removeEventListener('error', handleError);
      };
    });
  }
}
