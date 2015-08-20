library benchmarks.src.naive_infinite_scroll.random_data;

import "package:angular2/src/core/facade/lang.dart" show StringWrapper;
import "package:angular2/src/core/facade/collection.dart" show List, ListWrapper;
import "common.dart"
    show
        CustomDate,
        Offering,
        Company,
        Opportunity,
        Account,
        STATUS_LIST,
        AAT_STATUS_LIST;

List<Offering> generateOfferings(int count) {
  var res = [];
  for (var i = 0; i < count; i++) {
    res.add(generateOffering(i));
  }
  return res;
}
Offering generateOffering(int seed) {
  var res = new Offering();
  res.name = generateName(seed++);
  res.company = generateCompany(seed++);
  res.opportunity = generateOpportunity(seed++);
  res.account = generateAccount(seed++);
  res.basePoints = seed % 10;
  res.kickerPoints = seed % 4;
  res.status = STATUS_LIST[seed % STATUS_LIST.length];
  res.bundles = randomString(seed++);
  res.dueDate = randomDate(seed++);
  res.endDate = randomDate(seed++, res.dueDate);
  res.aatStatus = AAT_STATUS_LIST[seed % AAT_STATUS_LIST.length];
  return res;
}
Company generateCompany(int seed) {
  var res = new Company();
  res.name = generateName(seed);
  return res;
}
Opportunity generateOpportunity(int seed) {
  var res = new Opportunity();
  res.name = generateName(seed);
  return res;
}
Account generateAccount(int seed) {
  var res = new Account();
  res.accountId = seed;
  return res;
}
var names = [
  "Foo",
  "Bar",
  "Baz",
  "Qux",
  "Quux",
  "Garply",
  "Waldo",
  "Fred",
  "Plugh",
  "Xyzzy",
  "Thud",
  "Cruft",
  "Stuff"
];
String generateName(int seed) {
  return names[seed % names.length];
}
var offsets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
CustomDate randomDate(int seed, [CustomDate minDate = null]) {
  if (minDate == null) {
    minDate = CustomDate.now();
  }
  return minDate.addDays(offsets[seed % offsets.length]);
}
var stringLengths = [5, 7, 9, 11, 13];
var charCodeOffsets = [0, 1, 2, 3, 4, 5, 6, 7, 8];
String randomString(int seed) {
  var len = stringLengths[seed % 5];
  var str = "";
  for (var i = 0; i < len; i++) {
    str += StringWrapper.fromCharCode(97 + charCodeOffsets[seed % 9] + i);
  }
  return str;
}
