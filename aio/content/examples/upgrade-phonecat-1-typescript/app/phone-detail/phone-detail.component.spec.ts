// #docregion
describe('phoneDetail', () => {

  // 각 테스트 스윗 실행 전에 `phoneDetail` 컴포넌트가 있는 모듈을 로드합니다.
  beforeEach(angular.mock.module('phoneDetail'));

  // 컨트롤러를 테스트합니다.
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
