// This file contains interface versions of browser types that can be serialized to Plain Old

// JavaScript Objects
library angular2.src.web_workers.shared.serialized_types;

class LocationType {
  String href;
  String protocol;
  String host;
  String hostname;
  String port;
  String pathname;
  String search;
  String hash;
  String origin;
  LocationType(this.href, this.protocol, this.host, this.hostname, this.port,
      this.pathname, this.search, this.hash, this.origin) {}
}
