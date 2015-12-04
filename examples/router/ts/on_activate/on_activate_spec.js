'use strict';var e2e_util_1 = require('angular2/src/testing/e2e_util');
function waitForElement(selector) {
    var EC = protractor.ExpectedConditions;
    // Waits for the element with id 'abc' to be present on the dom.
    browser.wait(EC.presenceOf($(selector)), 20000);
}
describe('on activate example app', function () {
    afterEach(e2e_util_1.verifyNoBrowserErrors);
    var URL = 'angular2/examples/router/ts/on_activate/';
    it('should update the text when navigating between routes', function () {
        browser.get(URL);
        waitForElement('my-cmp');
        expect(element(by.css('my-cmp')).getText())
            .toContain('routerOnActivate: Finished navigating from "null" to ""');
        element(by.css('#param-link')).click();
        waitForElement('my-cmp');
        expect(element(by.css('my-cmp')).getText())
            .toContain('routerOnActivate: Finished navigating from "" to "1"');
        browser.navigate().back();
        waitForElement('my-cmp');
        expect(element(by.css('my-cmp')).getText())
            .toContain('routerOnActivate: Finished navigating from "1" to ""');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fYWN0aXZhdGVfc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9hY3RpdmF0ZS9vbl9hY3RpdmF0ZV9zcGVjLnRzIl0sIm5hbWVzIjpbIndhaXRGb3JFbGVtZW50Il0sIm1hcHBpbmdzIjoiQUFBQSx5QkFBb0MsK0JBQStCLENBQUMsQ0FBQTtBQUdwRSx3QkFBd0IsUUFBUTtJQUM5QkEsSUFBSUEsRUFBRUEsR0FBU0EsVUFBV0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQTtJQUM5Q0EsZ0VBQWdFQTtJQUNoRUEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7QUFDbERBLENBQUNBO0FBRUQsUUFBUSxDQUFDLHlCQUF5QixFQUFFO0lBQ2xDLFNBQVMsQ0FBQyxnQ0FBcUIsQ0FBQyxDQUFDO0lBRWpDLElBQUksR0FBRyxHQUFHLDBDQUEwQyxDQUFDO0lBRXJELEVBQUUsQ0FBQyx1REFBdUQsRUFBRTtRQUMxRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV6QixNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUN0QyxTQUFTLENBQUMseURBQXlELENBQUMsQ0FBQztRQUUxRSxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV6QixNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUN0QyxTQUFTLENBQUMsc0RBQXNELENBQUMsQ0FBQztRQUV2RSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUIsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXpCLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3RDLFNBQVMsQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO0lBQ3pFLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3ZlcmlmeU5vQnJvd3NlckVycm9yc30gZnJvbSAnYW5ndWxhcjIvc3JjL3Rlc3RpbmcvZTJlX3V0aWwnO1xuaW1wb3J0IHtQcm9taXNlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuZnVuY3Rpb24gd2FpdEZvckVsZW1lbnQoc2VsZWN0b3IpIHtcbiAgdmFyIEVDID0gKDxhbnk+cHJvdHJhY3RvcikuRXhwZWN0ZWRDb25kaXRpb25zO1xuICAvLyBXYWl0cyBmb3IgdGhlIGVsZW1lbnQgd2l0aCBpZCAnYWJjJyB0byBiZSBwcmVzZW50IG9uIHRoZSBkb20uXG4gIGJyb3dzZXIud2FpdChFQy5wcmVzZW5jZU9mKCQoc2VsZWN0b3IpKSwgMjAwMDApO1xufVxuXG5kZXNjcmliZSgnb24gYWN0aXZhdGUgZXhhbXBsZSBhcHAnLCBmdW5jdGlvbigpIHtcbiAgYWZ0ZXJFYWNoKHZlcmlmeU5vQnJvd3NlckVycm9ycyk7XG5cbiAgdmFyIFVSTCA9ICdhbmd1bGFyMi9leGFtcGxlcy9yb3V0ZXIvdHMvb25fYWN0aXZhdGUvJztcblxuICBpdCgnc2hvdWxkIHVwZGF0ZSB0aGUgdGV4dCB3aGVuIG5hdmlnYXRpbmcgYmV0d2VlbiByb3V0ZXMnLCBmdW5jdGlvbigpIHtcbiAgICBicm93c2VyLmdldChVUkwpO1xuICAgIHdhaXRGb3JFbGVtZW50KCdteS1jbXAnKTtcblxuICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnbXktY21wJykpLmdldFRleHQoKSlcbiAgICAgICAgLnRvQ29udGFpbigncm91dGVyT25BY3RpdmF0ZTogRmluaXNoZWQgbmF2aWdhdGluZyBmcm9tIFwibnVsbFwiIHRvIFwiXCInKTtcblxuICAgIGVsZW1lbnQoYnkuY3NzKCcjcGFyYW0tbGluaycpKS5jbGljaygpO1xuICAgIHdhaXRGb3JFbGVtZW50KCdteS1jbXAnKTtcblxuICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnbXktY21wJykpLmdldFRleHQoKSlcbiAgICAgICAgLnRvQ29udGFpbigncm91dGVyT25BY3RpdmF0ZTogRmluaXNoZWQgbmF2aWdhdGluZyBmcm9tIFwiXCIgdG8gXCIxXCInKTtcblxuICAgIGJyb3dzZXIubmF2aWdhdGUoKS5iYWNrKCk7XG4gICAgd2FpdEZvckVsZW1lbnQoJ215LWNtcCcpO1xuXG4gICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCdteS1jbXAnKSkuZ2V0VGV4dCgpKVxuICAgICAgICAudG9Db250YWluKCdyb3V0ZXJPbkFjdGl2YXRlOiBGaW5pc2hlZCBuYXZpZ2F0aW5nIGZyb20gXCIxXCIgdG8gXCJcIicpO1xuICB9KTtcbn0pO1xuIl19