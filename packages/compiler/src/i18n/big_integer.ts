/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Represents a big integer using a buffer of its individual digits, with the least significant
 * digit stored at the beginning of the array (little endian).
 *
 * For performance reasons, each instance is mutable. The addition operation can be done in-place
 * to reduce memory pressure of allocation for the digits array.
 */
export class BigInteger {
  static zero(): BigInteger {
    return new BigInteger([0]);
  }

  static one(): BigInteger {
    return new BigInteger([1]);
  }

  /**
   * Creates a big integer using its individual digits in little endian storage.
   */
  private constructor(private readonly digits: number[]) {}

  /**
   * Creates a clone of this instance.
   */
  clone(): BigInteger {
    return new BigInteger(this.digits.slice());
  }

  /**
   * Returns a new big integer with the sum of `this` and `other` as its value. This does not mutate
   * `this` but instead returns a new instance, unlike `addToSelf`.
   */
  add(other: BigInteger): BigInteger {
    const result = this.clone();
    result.addToSelf(other);
    return result;
  }

  /**
   * Adds `other` to the instance itself, thereby mutating its value.
   */
  addToSelf(other: BigInteger): void {
    const maxNrOfDigits = Math.max(this.digits.length, other.digits.length);
    let carry = 0;
    for (let i = 0; i < maxNrOfDigits; i++) {
      let digitSum = carry;
      if (i < this.digits.length) {
        digitSum += this.digits[i];
      }
      if (i < other.digits.length) {
        digitSum += other.digits[i];
      }

      if (digitSum >= 10) {
        this.digits[i] = digitSum - 10;
        carry = 1;
      } else {
        this.digits[i] = digitSum;
        carry = 0;
      }
    }

    // Apply a remaining carry if needed.
    if (carry > 0) {
      this.digits[maxNrOfDigits] = 1;
    }
  }

  /**
   * Builds the decimal string representation of the big integer. As this is stored in
   * little endian, the digits are concatenated in reverse order.
   */
  toString(): string {
    let res = '';
    for (let i = this.digits.length - 1; i >= 0; i--) {
      res += this.digits[i];
    }
    return res;
  }
}

/**
 * Represents a big integer which is optimized for multiplication operations, as its power-of-twos
 * are memoized. See `multiplyBy()` for details on the multiplication algorithm.
 */
export class BigIntForMultiplication {
  /**
   * Stores all memoized power-of-twos, where each index represents `this.number * 2^index`.
   */
  private readonly powerOfTwos: BigInteger[];

  constructor(value: BigInteger) {
    this.powerOfTwos = [value];
  }

  /**
   * Returns the big integer itself.
   */
  getValue(): BigInteger {
    return this.powerOfTwos[0];
  }

  /**
   * Computes the value for `num * b`, where `num` is a JS number and `b` is a big integer. The
   * value for `b` is represented by a storage model that is optimized for this computation.
   *
   * This operation is implemented in N(log2(num)) by continuous halving of the number, where the
   * least-significant bit (LSB) is tested in each iteration. If the bit is set, the bit's index is
   * used as exponent into the power-of-two multiplication of `b`.
   *
   * As an example, consider the multiplication num=42, b=1337. In binary 42 is 0b00101010 and the
   * algorithm unrolls into the following iterations:
   *
   *  Iteration | num        | LSB  | b * 2^iter | Add? | product
   * -----------|------------|------|------------|------|--------
   *  0         | 0b00101010 | 0    | 1337       | No   | 0
   *  1         | 0b00010101 | 1    | 2674       | Yes  | 2674
   *  2         | 0b00001010 | 0    | 5348       | No   | 2674
   *  3         | 0b00000101 | 1    | 10696      | Yes  | 13370
   *  4         | 0b00000010 | 0    | 21392      | No   | 13370
   *  5         | 0b00000001 | 1    | 42784      | Yes  | 56154
   *  6         | 0b00000000 | 0    | 85568      | No   | 56154
   *
   * The computed product of 56154 is indeed the correct result.
   *
   * The `BigIntForMultiplication` representation for a big integer provides memoized access to the
   * power-of-two values to reduce the workload in computing those values.
   */
  multiplyBy(num: number): BigInteger {
    const product = BigInteger.zero();
    this.multiplyByAndAddTo(num, product);
    return product;
  }

  /**
   * See `multiplyBy()` for details. This function allows for the computed product to be added
   * directly to the provided result big integer.
   */
  multiplyByAndAddTo(num: number, result: BigInteger): void {
    for (let exponent = 0; num !== 0; num = num >>> 1, exponent++) {
      if (num & 1) {
        const value = this.getMultipliedByPowerOfTwo(exponent);
        result.addToSelf(value);
      }
    }
  }

  /**
   * Computes and memoizes the big integer value for `this.number * 2^exponent`.
   */
  private getMultipliedByPowerOfTwo(exponent: number): BigInteger {
    // Compute the powers up until the requested exponent, where each value is computed from its
    // predecessor. This is simple as `this.number * 2^(exponent - 1)` only has to be doubled (i.e.
    // added to itself) to reach `this.number * 2^exponent`.
    for (let i = this.powerOfTwos.length; i <= exponent; i++) {
      const previousPower = this.powerOfTwos[i - 1];
      this.powerOfTwos[i] = previousPower.add(previousPower);
    }
    return this.powerOfTwos[exponent];
  }
}

/**
 * Represents an exponentiation operation for the provided base, of which exponents are computed and
 * memoized. The results are represented by a `BigIntForMultiplication` which is tailored for
 * multiplication operations by memoizing the power-of-twos. This effectively results in a matrix
 * representation that is lazily computed upon request.
 */
export class BigIntExponentiation {
  private readonly exponents = [new BigIntForMultiplication(BigInteger.one())];

  constructor(private readonly base: number) {}

  /**
   * Compute the value for `this.base^exponent`, resulting in a big integer that is optimized for
   * further multiplication operations.
   */
  toThePowerOf(exponent: number): BigIntForMultiplication {
    // Compute the results up until the requested exponent, where every value is computed from its
    // predecessor. This is because `this.base^(exponent - 1)` only has to be multiplied by `base`
    // to reach `this.base^exponent`.
    for (let i = this.exponents.length; i <= exponent; i++) {
      const value = this.exponents[i - 1].multiplyBy(this.base);
      this.exponents[i] = new BigIntForMultiplication(value);
    }
    return this.exponents[exponent];
  }
}
