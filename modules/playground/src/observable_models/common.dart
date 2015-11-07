library benchmarks.src.naive_infinite_scroll.common;

import "package:angular2/src/facade/math.dart" show Math;
import "package:angular2/src/facade/collection.dart";
import 'package:observe/observe.dart';
import 'dart:collection';
import 'dart:async';

var ITEMS = 1000;
var ITEM_HEIGHT = 40;
var VISIBLE_ITEMS = 17;
var HEIGHT = ITEMS * ITEM_HEIGHT;
var VIEW_PORT_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
var COMPANY_NAME_WIDTH = 100;
var OPPORTUNITY_NAME_WIDTH = 100;
var OFFERING_NAME_WIDTH = 100;
var ACCOUNT_CELL_WIDTH = 50;
var BASE_POINTS_WIDTH = 50;
var KICKER_POINTS_WIDTH = 50;
var STAGE_BUTTONS_WIDTH = 220;
var BUNDLES_WIDTH = 120;
var DUE_DATE_WIDTH = 100;
var END_DATE_WIDTH = 100;
var AAT_STATUS_WIDTH = 100;
var ROW_WIDTH = COMPANY_NAME_WIDTH +
    OPPORTUNITY_NAME_WIDTH +
    OFFERING_NAME_WIDTH +
    ACCOUNT_CELL_WIDTH +
    BASE_POINTS_WIDTH +
    KICKER_POINTS_WIDTH +
    STAGE_BUTTONS_WIDTH +
    BUNDLES_WIDTH +
    DUE_DATE_WIDTH +
    END_DATE_WIDTH +
    AAT_STATUS_WIDTH;
var STATUS_LIST = ["Planned", "Pitched", "Won", "Lost"];
var AAT_STATUS_LIST = ["Active", "Passive", "Abandoned"];
// Imitate Streamy entities.

// Just a non-trivial object. Nothing fancy or correct.
class CustomDate {
  num year;
  num month;
  num day;
  CustomDate(num y, num m, num d) {
    this.year = y;
    this.month = m;
    this.day = d;
  }
  CustomDate addDays(num days) {
    var newDay = this.day + days;
    var newMonth = this.month + Math.floor(newDay / 30);
    newDay = newDay % 30;
    var newYear = this.year + Math.floor(newMonth / 12);
    return new CustomDate(newYear, newMonth, newDay);
  }
  static CustomDate now() {
    return new CustomDate(2014, 1, 28);
  }
}
class RawEntity extends Object
    with MapMixin<String, dynamic>
    implements ObservableMap<String, dynamic> {
  ObservableMap _data = new ObservableMap();

  @override
  Iterable<String> get keys => _data.keys;

  @override
  void clear() {
    _data.clear();
  }

  @override
  operator [](String key) {
    if (!key.contains('.')) {
      return _data[key];
    }
    var pieces = key.split('.');
    var last = pieces.removeLast();
    var target = _resolve(pieces, this);
    if (target == null) {
      return null;
    }
    return target[last];
  }

  @override
  operator []=(String key, value) {
    if (!key.contains('.')) {
      _data[key] = value;
      return;
    }
    var pieces = key.split('.');
    var last = pieces.removeLast();
    var target = _resolve(pieces, this);
    target[last] = value;
  }

  dynamic get(String name) { return this[name]; }

  set(String name, dynamic value) { this[name] = value; }

  @override
  remove(String key) {
    if (!key.contains('.')) {
      return _data.remove(key);
    }
    var pieces = key.split('.');
    var last = pieces.removeLast();
    var target = _resolve(pieces, this);
    return target.remove(last);
  }

  _resolve(List<String> pieces, start) {
    var cur = start;
    for (var i = 0; i < pieces.length; i++) {
      cur = cur[pieces[i]];
      if (cur == null) {
        return null;
      }
    }
    return cur;
  }

  @override
  Stream<List<ChangeRecord>> get changes => _data.changes;
  @override
  bool get hasObservers => _data.hasObservers;
  @override
  bool deliverChanges() => _data.deliverChanges();
  @override
  notifyPropertyChange(Symbol field, Object oldValue, Object newValue) =>
      _data.notifyPropertyChange(field, oldValue, newValue);
  @override
  void notifyChange(ChangeRecord record) {
    _data.notifyChange(record);
  }

  @override
  void observed() {
    _data.observed();
  }

  @override
  void unobserved() {
    _data.observed();
  }
}
class Company extends RawEntity {
  String get name {
    return this.get("name");
  }
  set name(String val) {
    this.set("name", val);
  }
}
class Offering extends RawEntity {
  String get name {
    return this.get("name");
  }
  set name(String val) {
    this.set("name", val);
  }
  Company get company {
    return this.get("company");
  }
  set company(Company val) {
    this.set("company", val);
  }
  Opportunity get opportunity {
    return this.get("opportunity");
  }
  set opportunity(Opportunity val) {
    this.set("opportunity", val);
  }
  Account get account {
    return this.get("account");
  }
  set account(Account val) {
    this.set("account", val);
  }
  num get basePoints {
    return this.get("basePoints");
  }
  set basePoints(num val) {
    this.set("basePoints", val);
  }
  num get kickerPoints {
    return this.get("kickerPoints");
  }
  set kickerPoints(num val) {
    this.set("kickerPoints", val);
  }
  String get status {
    return this.get("status");
  }
  set status(String val) {
    this.set("status", val);
  }
  String get bundles {
    return this.get("bundles");
  }
  set bundles(String val) {
    this.set("bundles", val);
  }
  CustomDate get dueDate {
    return this.get("dueDate");
  }
  set dueDate(CustomDate val) {
    this.set("dueDate", val);
  }
  CustomDate get endDate {
    return this.get("endDate");
  }
  set endDate(CustomDate val) {
    this.set("endDate", val);
  }
  String get aatStatus {
    return this.get("aatStatus");
  }
  set aatStatus(String val) {
    this.set("aatStatus", val);
  }
}
class Opportunity extends RawEntity {
  String get name {
    return this.get("name");
  }
  set name(String val) {
    this.set("name", val);
  }
}
class Account extends RawEntity {
  num get accountId {
    return this.get("accountId");
  }
  set accountId(num val) {
    this.set("accountId", val);
  }
}
