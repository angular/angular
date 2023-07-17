/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export const STATUS = {
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANTENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  UPGRADE_REQUIRED: 426,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  PROCESSING: 102,
  MULTI_STATUS: 207,
  IM_USED: 226,
  PERMANENT_REDIRECT: 308,
  UNPROCESSABLE_ENTRY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};

export const STATUS_CODE_INFO: {
  [key: string]:
      {code: number; text: string; description: string; spec_title: string; spec_href: string;}
} = {
  '100': {
    'code': 100,
    'text': 'Continue',
    'description':
        '\"The initial part of a request has been received and has not yet been rejected by the server.\"',
    'spec_title': 'RFC7231#6.2.1',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.2.1'
  },
  '101': {
    'code': 101,
    'text': 'Switching Protocols',
    'description':
        '\"The server understands and is willing to comply with the client\'s request, via the Upgrade header field, for a change in the application protocol being used on this connection.\"',
    'spec_title': 'RFC7231#6.2.2',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.2.2'
  },
  '200': {
    'code': 200,
    'text': 'OK',
    'description': '\"The request has succeeded.\"',
    'spec_title': 'RFC7231#6.3.1',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.3.1'
  },
  '201': {
    'code': 201,
    'text': 'Created',
    'description':
        '\"The request has been fulfilled and has resulted in one or more new resources being created.\"',
    'spec_title': 'RFC7231#6.3.2',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.3.2'
  },
  '202': {
    'code': 202,
    'text': 'Accepted',
    'description':
        '\"The request has been accepted for processing, but the processing has not been completed.\"',
    'spec_title': 'RFC7231#6.3.3',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.3.3'
  },
  '203': {
    'code': 203,
    'text': 'Non-Authoritative Information',
    'description':
        '\"The request was successful but the enclosed payload has been modified from that of the origin server\'s 200 (OK) response by a transforming proxy.\"',
    'spec_title': 'RFC7231#6.3.4',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.3.4'
  },
  '204': {
    'code': 204,
    'text': 'No Content',
    'description':
        '\"The server has successfully fulfilled the request and that there is no additional content to send in the response payload body.\"',
    'spec_title': 'RFC7231#6.3.5',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.3.5'
  },
  '205': {
    'code': 205,
    'text': 'Reset Content',
    'description':
        '\"The server has fulfilled the request and desires that the user agent reset the \"document view\", which caused the request to be sent, to its original state as received from the origin server.\"',
    'spec_title': 'RFC7231#6.3.6',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.3.6'
  },
  '206': {
    'code': 206,
    'text': 'Partial Content',
    'description':
        '\"The server is successfully fulfilling a range request for the target resource by transferring one or more parts of the selected representation that correspond to the satisfiable ranges found in the requests\'s Range header field.\"',
    'spec_title': 'RFC7233#4.1',
    'spec_href': 'https://tools.ietf.org/html/rfc7233#section-4.1'
  },
  '300': {
    'code': 300,
    'text': 'Multiple Choices',
    'description':
        '\"The target resource has more than one representation, each with its own more specific identifier, and information about the alternatives is being provided so that the user (or user agent) can select a preferred representation by redirecting its request to one or more of those identifiers.\"',
    'spec_title': 'RFC7231#6.4.1',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.4.1'
  },
  '301': {
    'code': 301,
    'text': 'Moved Permanently',
    'description':
        '\"The target resource has been assigned a new permanent URI and any future references to this resource ought to use one of the enclosed URIs.\"',
    'spec_title': 'RFC7231#6.4.2',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.4.2'
  },
  '302': {
    'code': 302,
    'text': 'Found',
    'description': '\"The target resource resides temporarily under a different URI.\"',
    'spec_title': 'RFC7231#6.4.3',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.4.3'
  },
  '303': {
    'code': 303,
    'text': 'See Other',
    'description':
        '\"The server is redirecting the user agent to a different resource, as indicated by a URI in the Location header field, that is intended to provide an indirect response to the original request.\"',
    'spec_title': 'RFC7231#6.4.4',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.4.4'
  },
  '304': {
    'code': 304,
    'text': 'Not Modified',
    'description':
        '\"A conditional GET request has been received and would have resulted in a 200 (OK) response if it were not for the fact that the condition has evaluated to false.\"',
    'spec_title': 'RFC7232#4.1',
    'spec_href': 'https://tools.ietf.org/html/rfc7232#section-4.1'
  },
  '305': {
    'code': 305,
    'text': 'Use Proxy',
    'description': '*deprecated*',
    'spec_title': 'RFC7231#6.4.5',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.4.5'
  },
  '307': {
    'code': 307,
    'text': 'Temporary Redirect',
    'description':
        '\"The target resource resides temporarily under a different URI and the user agent MUST NOT change the request method if it performs an automatic redirection to that URI.\"',
    'spec_title': 'RFC7231#6.4.7',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.4.7'
  },
  '400': {
    'code': 400,
    'text': 'Bad Request',
    'description':
        '\"The server cannot or will not process the request because the received syntax is invalid, nonsensical, or exceeds some limitation on what the server is willing to process.\"',
    'spec_title': 'RFC7231#6.5.1',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.1'
  },
  '401': {
    'code': 401,
    'text': 'Unauthorized',
    'description':
        '\"The request has not been applied because it lacks valid authentication credentials for the target resource.\"',
    'spec_title': 'RFC7235#6.3.1',
    'spec_href': 'https://tools.ietf.org/html/rfc7235#section-3.1'
  },
  '402': {
    'code': 402,
    'text': 'Payment Required',
    'description': '*reserved*',
    'spec_title': 'RFC7231#6.5.2',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.2'
  },
  '403': {
    'code': 403,
    'text': 'Forbidden',
    'description': '\"The server understood the request but refuses to authorize it.\"',
    'spec_title': 'RFC7231#6.5.3',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.3'
  },
  '404': {
    'code': 404,
    'text': 'Not Found',
    'description':
        '\"The origin server did not find a current representation for the target resource or is not willing to disclose that one exists.\"',
    'spec_title': 'RFC7231#6.5.4',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.4'
  },
  '405': {
    'code': 405,
    'text': 'Method Not Allowed',
    'description':
        '\"The method specified in the request-line is known by the origin server but not supported by the target resource.\"',
    'spec_title': 'RFC7231#6.5.5',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.5'
  },
  '406': {
    'code': 406,
    'text': 'Not Acceptable',
    'description':
        '\"The target resource does not have a current representation that would be acceptable to the user agent, according to the proactive negotiation header fields received in the request, and the server is unwilling to supply a default representation.\"',
    'spec_title': 'RFC7231#6.5.6',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.6'
  },
  '407': {
    'code': 407,
    'text': 'Proxy Authentication Required',
    'description': '\"The client needs to authenticate itself in order to use a proxy.\"',
    'spec_title': 'RFC7231#6.3.2',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.3.2'
  },
  '408': {
    'code': 408,
    'text': 'Request Timeout',
    'description':
        '\"The server did not receive a complete request message within the time that it was prepared to wait.\"',
    'spec_title': 'RFC7231#6.5.7',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.7'
  },
  '409': {
    'code': 409,
    'text': 'Conflict',
    'description':
        '\"The request could not be completed due to a conflict with the current state of the resource.\"',
    'spec_title': 'RFC7231#6.5.8',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.8'
  },
  '410': {
    'code': 410,
    'text': 'Gone',
    'description':
        '\"Access to the target resource is no longer available at the origin server and that this condition is likely to be permanent.\"',
    'spec_title': 'RFC7231#6.5.9',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.9'
  },
  '411': {
    'code': 411,
    'text': 'Length Required',
    'description': '\"The server refuses to accept the request without a defined Content-Length.\"',
    'spec_title': 'RFC7231#6.5.10',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.10'
  },
  '412': {
    'code': 412,
    'text': 'Precondition Failed',
    'description':
        '\"One or more preconditions given in the request header fields evaluated to false when tested on the server.\"',
    'spec_title': 'RFC7232#4.2',
    'spec_href': 'https://tools.ietf.org/html/rfc7232#section-4.2'
  },
  '413': {
    'code': 413,
    'text': 'Payload Too Large',
    'description':
        '\"The server is refusing to process a request because the request payload is larger than the server is willing or able to process.\"',
    'spec_title': 'RFC7231#6.5.11',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.11'
  },
  '414': {
    'code': 414,
    'text': 'URI Too Long',
    'description':
        '\"The server is refusing to service the request because the request-target is longer than the server is willing to interpret.\"',
    'spec_title': 'RFC7231#6.5.12',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.12'
  },
  '415': {
    'code': 415,
    'text': 'Unsupported Media Type',
    'description':
        '\"The origin server is refusing to service the request because the payload is in a format not supported by the target resource for this method.\"',
    'spec_title': 'RFC7231#6.5.13',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.13'
  },
  '416': {
    'code': 416,
    'text': 'Range Not Satisfiable',
    'description':
        '\"None of the ranges in the request\'s Range header field overlap the current extent of the selected resource or that the set of ranges requested has been rejected due to invalid ranges or an excessive request of small or overlapping ranges.\"',
    'spec_title': 'RFC7233#4.4',
    'spec_href': 'https://tools.ietf.org/html/rfc7233#section-4.4'
  },
  '417': {
    'code': 417,
    'text': 'Expectation Failed',
    'description':
        '\"The expectation given in the request\'s Expect header field could not be met by at least one of the inbound servers.\"',
    'spec_title': 'RFC7231#6.5.14',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.14'
  },
  '418': {
    'code': 418,
    'text': 'I\'m a teapot',
    'description': '\"1988 April Fools Joke. Returned by tea pots requested to brew coffee.\"',
    'spec_title': 'RFC 2324',
    'spec_href': 'https://tools.ietf.org/html/rfc2324'
  },
  '426': {
    'code': 426,
    'text': 'Upgrade Required',
    'description':
        '\"The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol.\"',
    'spec_title': 'RFC7231#6.5.15',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.5.15'
  },
  '500': {
    'code': 500,
    'text': 'Internal Server Error',
    'description':
        '\"The server encountered an unexpected condition that prevented it from fulfilling the request.\"',
    'spec_title': 'RFC7231#6.6.1',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.6.1'
  },
  '501': {
    'code': 501,
    'text': 'Not Implemented',
    'description':
        '\"The server does not support the functionality required to fulfill the request.\"',
    'spec_title': 'RFC7231#6.6.2',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.6.2'
  },
  '502': {
    'code': 502,
    'text': 'Bad Gateway',
    'description':
        '\"The server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed while attempting to fulfill the request.\"',
    'spec_title': 'RFC7231#6.6.3',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.6.3'
  },
  '503': {
    'code': 503,
    'text': 'Service Unavailable',
    'description':
        '\"The server is currently unable to handle the request due to a temporary overload or scheduled maintenance, which will likely be alleviated after some delay.\"',
    'spec_title': 'RFC7231#6.6.4',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.6.4'
  },
  '504': {
    'code': 504,
    'text': 'Gateway Time-out',
    'description':
        '\"The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server it needed to access in order to complete the request.\"',
    'spec_title': 'RFC7231#6.6.5',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.6.5'
  },
  '505': {
    'code': 505,
    'text': 'HTTP Version Not Supported',
    'description':
        '\"The server does not support, or refuses to support, the protocol version that was used in the request message.\"',
    'spec_title': 'RFC7231#6.6.6',
    'spec_href': 'https://tools.ietf.org/html/rfc7231#section-6.6.6'
  },
  '102': {
    'code': 102,
    'text': 'Processing',
    'description':
        '\"An interim response to inform the client that the server has accepted the complete request, but has not yet completed it.\"',
    'spec_title': 'RFC5218#10.1',
    'spec_href': 'https://tools.ietf.org/html/rfc2518#section-10.1'
  },
  '207': {
    'code': 207,
    'text': 'Multi-Status',
    'description': '\"Status for multiple independent operations.\"',
    'spec_title': 'RFC5218#10.2',
    'spec_href': 'https://tools.ietf.org/html/rfc2518#section-10.2'
  },
  '226':
      {
        'code': 226,
        'text': 'IM Used',
        'description':
            '\"The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.\"',
        'spec_title': 'RFC3229#10.4.1',
        'spec_href': 'https://tools.ietf.org/html/rfc3229#section-10.4.1'
      },
  '308': {
    'code': 308,
    'text': 'Permanent Redirect',
    'description':
        '\"The target resource has been assigned a new permanent URI and any future references to this resource SHOULD use one of the returned URIs. [...] This status code is similar to 301 Moved Permanently (Section 7.3.2 of rfc7231), except that it does not allow rewriting the request method from POST to GET.\"',
    'spec_title': 'RFC7238',
    'spec_href': 'https://tools.ietf.org/html/rfc7238'
  },
  '422': {
    'code': 422,
    'text': 'Unprocessable Entity',
    'description':
        '\"The server understands the content type of the request entity (hence a 415(Unsupported Media Type) status code is inappropriate), and the syntax of the request entity is correct (thus a 400 (Bad Request) status code is inappropriate) but was unable to process the contained instructions.\"',
    'spec_title': 'RFC5218#10.3',
    'spec_href': 'https://tools.ietf.org/html/rfc2518#section-10.3'
  },
  '423': {
    'code': 423,
    'text': 'Locked',
    'description': '\"The source or destination resource of a method is locked.\"',
    'spec_title': 'RFC5218#10.4',
    'spec_href': 'https://tools.ietf.org/html/rfc2518#section-10.4'
  },
  '424': {
    'code': 424,
    'text': 'Failed Dependency',
    'description':
        '\"The method could not be performed on the resource because the requested action depended on another action and that action failed.\"',
    'spec_title': 'RFC5218#10.5',
    'spec_href': 'https://tools.ietf.org/html/rfc2518#section-10.5'
  },
  '428': {
    'code': 428,
    'text': 'Precondition Required',
    'description': '\"The origin server requires the request to be conditional.\"',
    'spec_title': 'RFC6585#3',
    'spec_href': 'https://tools.ietf.org/html/rfc6585#section-3'
  },
  '429': {
    'code': 429,
    'text': 'Too Many Requests',
    'description':
        '\"The user has sent too many requests in a given amount of time (\"rate limiting\").\"',
    'spec_title': 'RFC6585#4',
    'spec_href': 'https://tools.ietf.org/html/rfc6585#section-4'
  },
  '431': {
    'code': 431,
    'text': 'Request Header Fields Too Large',
    'description':
        '\"The server is unwilling to process the request because its header fields are too large.\"',
    'spec_title': 'RFC6585#5',
    'spec_href': 'https://tools.ietf.org/html/rfc6585#section-5'
  },
  '451': {
    'code': 451,
    'text': 'Unavailable For Legal Reasons',
    'description':
        '\"The server is denying access to the resource in response to a legal demand.\"',
    'spec_title': 'draft-ietf-httpbis-legally-restricted-status',
    'spec_href': 'https://tools.ietf.org/html/draft-ietf-httpbis-legally-restricted-status'
  },
  '506': {
    'code': 506,
    'text': 'Variant Also Negotiates',
    'description':
        '\"The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, and is therefore not a proper end point in the negotiation process.\"',
    'spec_title': 'RFC2295#8.1',
    'spec_href': 'https://tools.ietf.org/html/rfc2295#section-8.1'
  },
  '507': {
    'code': 507,
    'text': 'Insufficient Storage',
    'description':
        '\The method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request.\"',
    'spec_title': 'RFC5218#10.6',
    'spec_href': 'https://tools.ietf.org/html/rfc2518#section-10.6'
  },
  '511': {
    'code': 511,
    'text': 'Network Authentication Required',
    'description': '\"The client needs to authenticate to gain network access.\"',
    'spec_title': 'RFC6585#6',
    'spec_href': 'https://tools.ietf.org/html/rfc6585#section-6'
  }
};

/**
 * get the status text from StatusCode
 */
export function getStatusText(code: number) {
  return STATUS_CODE_INFO[code + ''].text || 'Unknown Status';
}

/**
 * Returns true if the Http Status Code is 200-299 (success)
 */
export function isSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}
