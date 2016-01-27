// This file contains interface versions of browser types that can be serialized to Plain Old
// JavaScript Objects
export class LocationType {
    constructor(href, protocol, host, hostname, port, pathname, search, hash, origin) {
        this.href = href;
        this.protocol = protocol;
        this.host = host;
        this.hostname = hostname;
        this.port = port;
        this.pathname = pathname;
        this.search = search;
        this.hash = hash;
        this.origin = origin;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplZF90eXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplZF90eXBlcy50cyJdLCJuYW1lcyI6WyJMb2NhdGlvblR5cGUiLCJMb2NhdGlvblR5cGUuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBLDZGQUE2RjtBQUM3RixxQkFBcUI7QUFDckI7SUFDRUEsWUFBbUJBLElBQVlBLEVBQVNBLFFBQWdCQSxFQUFTQSxJQUFZQSxFQUMxREEsUUFBZ0JBLEVBQVNBLElBQVlBLEVBQVNBLFFBQWdCQSxFQUM5REEsTUFBY0EsRUFBU0EsSUFBWUEsRUFBU0EsTUFBY0E7UUFGMURDLFNBQUlBLEdBQUpBLElBQUlBLENBQVFBO1FBQVNBLGFBQVFBLEdBQVJBLFFBQVFBLENBQVFBO1FBQVNBLFNBQUlBLEdBQUpBLElBQUlBLENBQVFBO1FBQzFEQSxhQUFRQSxHQUFSQSxRQUFRQSxDQUFRQTtRQUFTQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFRQTtRQUFTQSxhQUFRQSxHQUFSQSxRQUFRQSxDQUFRQTtRQUM5REEsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBUUE7UUFBU0EsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBUUE7UUFBU0EsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBUUE7SUFBR0EsQ0FBQ0E7QUFDbkZELENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGZpbGUgY29udGFpbnMgaW50ZXJmYWNlIHZlcnNpb25zIG9mIGJyb3dzZXIgdHlwZXMgdGhhdCBjYW4gYmUgc2VyaWFsaXplZCB0byBQbGFpbiBPbGRcbi8vIEphdmFTY3JpcHQgT2JqZWN0c1xuZXhwb3J0IGNsYXNzIExvY2F0aW9uVHlwZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBocmVmOiBzdHJpbmcsIHB1YmxpYyBwcm90b2NvbDogc3RyaW5nLCBwdWJsaWMgaG9zdDogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgaG9zdG5hbWU6IHN0cmluZywgcHVibGljIHBvcnQ6IHN0cmluZywgcHVibGljIHBhdGhuYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHB1YmxpYyBzZWFyY2g6IHN0cmluZywgcHVibGljIGhhc2g6IHN0cmluZywgcHVibGljIG9yaWdpbjogc3RyaW5nKSB7fVxufVxuIl19