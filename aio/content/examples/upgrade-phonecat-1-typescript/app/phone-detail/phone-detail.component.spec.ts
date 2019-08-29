// #docregion
describe('phoneDetail', () => {

  // Load the module that contains the `phoneDetail` component before each test
  beforeEach(angular.mock.module('phoneDetail'));

  // Test the controller
  describe('PhoneDetailController', () => {
    let $httpBackend: angular.IHttpBackendService;
    let ctrl: any;
    let xyzPhoneData = {
      name: 'phone xyz',
      images: ['image/url1.png', 'image/url2.png']
    };

    beforeEach(inject(($componentController: any,
                       _$httpBackend_: angular.IHttpBackendService,
                       $routeParams: angular.route.IRouteParamsService) => {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('phones/xyz.json').respond(xyzPhoneData);

      $routeParams['phoneId'] = 'xyz';

      ctrl = $componentController('phoneDetail');
    }));

    it('should fetch the phone details', () => {
      jasmine.addCustomEqualityTester(angular.equals);

      expect(ctrl.phone).toEqual({});

      $httpBackend.flush();
      expect(ctrl.phone).toEqual(xyzPhoneData);
    });

  });

});
