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
  transform(value: number, exponent?: number): number {
    return Math.pow(value, isNaN(exponent) ? 1 : exponent);
  }
}
