'use strict';"use strict";
// This file contains interface versions of browser types that can be serialized to Plain Old
// JavaScript Objects
var LocationType = (function () {
    function LocationType(href, protocol, host, hostname, port, pathname, search, hash, origin) {
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
    return LocationType;
}());
exports.LocationType = LocationType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplZF90eXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplZF90eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNkZBQTZGO0FBQzdGLHFCQUFxQjtBQUNyQjtJQUNFLHNCQUFtQixJQUFZLEVBQVMsUUFBZ0IsRUFBUyxJQUFZLEVBQzFELFFBQWdCLEVBQVMsSUFBWSxFQUFTLFFBQWdCLEVBQzlELE1BQWMsRUFBUyxJQUFZLEVBQVMsTUFBYztRQUYxRCxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQVE7UUFDMUQsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQzlELFdBQU0sR0FBTixNQUFNLENBQVE7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUFHLENBQUM7SUFDbkYsbUJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUpZLG9CQUFZLGVBSXhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGZpbGUgY29udGFpbnMgaW50ZXJmYWNlIHZlcnNpb25zIG9mIGJyb3dzZXIgdHlwZXMgdGhhdCBjYW4gYmUgc2VyaWFsaXplZCB0byBQbGFpbiBPbGRcbi8vIEphdmFTY3JpcHQgT2JqZWN0c1xuZXhwb3J0IGNsYXNzIExvY2F0aW9uVHlwZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBocmVmOiBzdHJpbmcsIHB1YmxpYyBwcm90b2NvbDogc3RyaW5nLCBwdWJsaWMgaG9zdDogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgaG9zdG5hbWU6IHN0cmluZywgcHVibGljIHBvcnQ6IHN0cmluZywgcHVibGljIHBhdGhuYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHB1YmxpYyBzZWFyY2g6IHN0cmluZywgcHVibGljIGhhc2g6IHN0cmluZywgcHVibGljIG9yaWdpbjogc3RyaW5nKSB7fVxufVxuIl19