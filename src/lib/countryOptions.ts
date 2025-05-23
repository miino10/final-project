import {
    CountryCode,
    getCountries,
    getCountryCallingCode,
  } from "libphonenumber-js";
  
  export const countryOptions = getCountries().map((country) => ({
    value: country,
    label: `${country} (+${getCountryCallingCode(country as CountryCode)})`,
  }));
  