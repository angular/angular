import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Other imports
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Item } from './item';
import { ItemsService } from './items.service';
import { HttpErrorHandler } from '../http-error-handler.service';
import { MessageService } from '../message.service';

describe('ItemsService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let itemService: ItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Import the HttpClient mocking services
      imports: [ HttpClientTestingModule ],
      // Provide the service-under-test and its dependencies
      providers: [
        ItemsService,
        HttpErrorHandler,
        MessageService
      ]
    });

    // Inject the http, test controller, and service-under-test
    // as they will be referenced by each test.
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    itemService = TestBed.inject(ItemsService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  /// itemService method tests begin ///

  describe('#getItems', () => {
    let expectedItems: Item[];

    beforeEach(() => {
      itemService = TestBed.inject(ItemsService);
      expectedItems = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
       ] as Item[];
    });

    it('should return expected items (called once)', () => {

      itemService.getItems().subscribe(
        items => expect(items).toEqual(expectedItems, 'should return expected items'),
        fail
      );

      // itemService should have made one request to GET items from expected URL
      const req = httpTestingController.expectOne(itemService.itemsUrl);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock items
      req.flush(expectedItems);
    });

    it('should be OK returning no ite s', () => {

      itemService.getItems().subscribe(
        items => expect(items.length).toEqual(0, 'should have empty items array'),
        fail
      );

      const req = httpTestingController.expectOne(itemService.itemsUrl);
      req.flush([]); // Respond with no items
    });

    // This service reports the error but finds a way to let the app keep going.
    it('should turn 404 into an empty items result', () => {

      itemService.getItems().subscribe(
        items => expect(items.length).toEqual(0, 'should return empty items array'),
        fail
      );

      const req = httpTestingController.expectOne(itemService.itemsUrl);

      // respond with a 404 and the error message in the body
      const msg = 'deliberate 404 error';
      req.flush(msg, {status: 404, statusText: 'Not Found'});
    });

    it('should return expected items (called multiple times)', () => {

      itemService.getItems().subscribe();
      itemService.getItems().subscribe();
      itemService.getItems().subscribe(
        items => expect(items).toEqual(expectedItems, 'should return expected items'),
        fail
      );

      const requests = httpTestingController.match(itemService.itemsUrl);
      expect(requests.length).toEqual(3, 'calls to getItems()');

      // Respond to each request with different mock item results
      requests[0].flush([]);
      requests[1].flush([{id: 1, name: 'bob'}]);
      requests[2].flush(expectedItems);
    });
  });

  describe('#updateItem', () => {
    // Expecting the query form of URL so should not 404 when id not found
    const makeUrl = (id: number) => `${itemService.itemsUrl}/?id=${id}`;

    it('should update a item and return it', () => {

      const updateItem: Item = { id: 1, name: 'A' };

      itemService.updateItem(updateItem).subscribe(
        data => expect(data).toEqual(updateItem, 'should return the item'),
        fail
      );

      // ITemService should have made one request to PUT item
      const req = httpTestingController.expectOne(itemService.itemsUrl);
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual(updateItem);

      // Expect server to return the item after PUT
      const expectedResponse = new HttpResponse(
        { status: 200, statusText: 'OK', body: updateItem });
      req.event(expectedResponse);
    });

    // This service reports the error but finds a way to let the app keep going.
    it('should turn 404 error into return of the update item', () => {
      const updateItem: Item = { id: 1, name: 'A' };

      itemService.updateItem(updateItem).subscribe(
        data => expect(data).toEqual(updateItem, 'should return the update item'),
        fail
      );

      const req = httpTestingController.expectOne(itemService.itemsUrl);

      // respond with a 404 and the error message in the body
      const msg = 'deliberate 404 error';
      req.flush(msg, {status: 404, statusText: 'Not Found'});
    });
  });

  // TODO: test other ItemService methods
});
