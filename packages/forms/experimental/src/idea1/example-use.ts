import {signal} from '@angular/core';
import {field, form, group, hidden, include, required, validate, value} from './schema';

const nameSchema = group<{first: string; last: string}>({
  first: field(),
  last: field(),
});

const dateSchema = group<{year: number; month: number; day: number}>({
  year: field(),
  month: field(
    validate((m) =>
      m.month.$() < 1 || m.month.$() > 12 ? 'Month must be between 1 and 12' : null,
    ),
  ),
  day: field(
    validate((m) =>
      m.day.$() < 1 || m.day.$() > (m.month.$() === 2 ? 29 : 31)
        ? 'Date must be between 1 and 31'
        : null,
    ),
  ),
});

const shouldCollectPhoneNum = signal(true);

const userSchema = group<{
  name: {first: string; last: string};
  birthdate: {year: number; month: number; day: number};
  phone: {area: string; prefix: string; line: string};
}>({
  name: include(nameSchema),
  birthdate: include(dateSchema, {
    year: field(
      value(1990),
      required('Year is required'),
      validate((m) =>
        m.birthdate.year.$() > new Date().getFullYear() - 18 ? 'Must be 18 or older' : null,
      ),
    ),
    month: field(required('Month is required')),
  }),
  phone: group(
    hidden(() => !shouldCollectPhoneNum()),
    {
      area: field(),
      prefix: field(),
      line: field(),
    },
  ),
});

const userForm = form(userSchema);
userForm.birthdate.year.$() === 2000;
userForm.$.valid() === true;
userForm.name.$.set({first: 'Bob', last: 'Loblaw'});
userForm.phone.line.$.hidden() === true;

const numForm = form(field<number>());
numForm.$() === 1;

const nativeDateForm = form(
  group<{x: Date}>({
    x: field<Date, {x: Date}>(),
  }),
);
nativeDateForm.x.$() === new Date();
