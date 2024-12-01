/* eslint-disable @typescript-eslint/typedef */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const PhoneNumberType = {
  MOBILE: 'MOBILE',
  FIXED_LINE: 'FIXED_LINE',
  PREMIUM_RATE: 'PREMIUM_RATE',
  TOLL_FREE: 'TOLL_FREE',
  SHARED_COST: 'SHARED_COST',
  VOIP: 'VOIP',
  PERSONAL_NUMBER: 'PERSONAL_NUMBER',
  PAGER: 'PAGER',
  UAN: 'UAN',
  VOICEMAIL: 'VOICEMAIL',
} as const;
export type PhoneNumberType =
  (typeof PhoneNumberType)[keyof typeof PhoneNumberType];
/*
  types of all possible return values of the .getType() in the phone number libphonenumber-js/max library
*/

export const allPhoneNumberTypes: Array<PhoneNumberType> = [
  'MOBILE',
  'FIXED_LINE',
  'PREMIUM_RATE',
  'TOLL_FREE',
  'SHARED_COST',
  'VOIP',
  'PERSONAL_NUMBER',
  'PAGER',
  'UAN',
  'VOICEMAIL',
];
