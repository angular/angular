/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
// #docregion
import { Pipe, PipeTransform } from '@angular/core';
/*
 * 히어로의 힘을 증폭합니다.
 * 증폭값은 파이프 인자로 전달하며, 기본값은 1입니다.
 * 사용방법:
 *   값 | exponentialStrength:증폭값
 * 사용예:
 *   {{ 2 | exponentialStrength:10 }}
 *   변환 결과: 1024
*/
@Pipe({name: 'exponentialStrength'})
export class ExponentialStrengthPipe implements PipeTransform {
  transform(value: number, exponent: string): number {
    let exp = parseFloat(exponent);
    return Math.pow(value, isNaN(exp) ? 1 : exp);
  }
}
