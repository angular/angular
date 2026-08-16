/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isIpAddress} from '../../src/util/ip_address';

describe('IP Address util', () => {
  describe('IPv4 validation', () => {
    it('should return 4 for standard IPv4 addresses', () => {
      expect(isIpAddress('127.0.0.1')).toBe(4);
      expect(isIpAddress('192.168.1.1')).toBe(4);
      expect(isIpAddress('0.0.0.0')).toBe(4);
      expect(isIpAddress('255.255.255.255')).toBe(4);
      expect(isIpAddress('10.0.0.1')).toBe(4);
    });

    it('should return 0 for invalid IPv4 octet ranges (>255)', () => {
      expect(isIpAddress('256.0.0.1')).toBe(0);
      expect(isIpAddress('192.168.1.256')).toBe(0);
      expect(isIpAddress('999.999.999.999')).toBe(0);
    });

    it('should return 0 for malformed IPv4 structure', () => {
      expect(isIpAddress('192.168.1')).toBe(0);
      expect(isIpAddress('192.168.1.1.1')).toBe(0);
      expect(isIpAddress('192.168.1.')).toBe(0);
      expect(isIpAddress('.192.168.1.1')).toBe(0);
      expect(isIpAddress('192..168.1.1')).toBe(0);
      expect(isIpAddress('abc.def.ghi.jkl')).toBe(0);
    });

    it('should return 0 for IPv4 with spaces or invalid trailing/leading chars', () => {
      expect(isIpAddress(' 192.168.1.1')).toBe(0);
      expect(isIpAddress('192.168.1.1 ')).toBe(0);
      expect(isIpAddress('192.168.1.1/24')).toBe(0);
    });
  });

  describe('IPv6 validation', () => {
    it('should return 6 for full 8-group IPv6 addresses', () => {
      expect(isIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(6);
      expect(isIpAddress('fe80:0000:0000:0000:0204:61ff:fe9d:f153')).toBe(6);
    });

    it('should return 6 for zero-compressed IPv6 addresses', () => {
      expect(isIpAddress('::1')).toBe(6);
      expect(isIpAddress('::')).toBe(6);
      expect(isIpAddress('2001:db8::1')).toBe(6);
      expect(isIpAddress('fe80::204:61ff:fe9d:f153')).toBe(6);
      expect(isIpAddress('2001:db8:85a3::8a2e:370:7334')).toBe(6);
    });

    it('should return 6 for IPv4-mapped IPv6 addresses', () => {
      expect(isIpAddress('::ffff:192.168.1.1')).toBe(6);
      expect(isIpAddress('::ffff:0.0.0.0')).toBe(6);
      expect(isIpAddress('2001:db8:3333:4444:5555:6666:1.2.3.4')).toBe(6);
    });

    it('should return 6 for IPv6 with scoped zone identifiers', () => {
      expect(isIpAddress('fe80::1%eth0')).toBe(6);
      expect(isIpAddress('fe80::1%1')).toBe(6);
      expect(isIpAddress('fe80::1%enp0s31f1')).toBe(6);
    });

    it('should return 0 for malformed IPv6 addresses', () => {
      expect(isIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334:1234')).toBe(0); // Too many groups
      expect(isIpAddress('2001:0db8:85a3:::8a2e:0370:7334')).toBe(0); // Triple colon
      expect(isIpAddress('2001:0db8:85a3:00000:0000:8a2e:0370:7334')).toBe(0); // Hex block > 4 chars
      expect(isIpAddress('2001:0db8:85a3:gggg:0000:8a2e:0370:7334')).toBe(0); // Non-hex characters
    });
  });

  describe('edge cases and invalid inputs', () => {
    it('should return 0 for empty string, null-like, or non-IP strings', () => {
      expect(isIpAddress('')).toBe(0);
      expect(isIpAddress('localhost')).toBe(0);
      expect(isIpAddress('google.com')).toBe(0);
      expect(isIpAddress('12345')).toBe(0);
    });
  });
});
