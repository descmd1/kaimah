const BASE_URL = 'https://restcountries.com/v3.1';

export const fetchAllCountries = async () => {
  const response = await fetch(`${BASE_URL}/all?fields=cca3,name,flags,population,region,capital`);
  if (!response.ok) {
    throw new Error('Failed to fetch countries');
  }
  return response.json();
};

export const fetchCountryByCode = async (code) => {
  const response = await fetch(`${BASE_URL}/alpha/${code}?fields=cca3,name,flags,population,region,subregion,capital,tld,currencies,languages,borders`);
  if (!response.ok) {
    throw new Error('Country not found');
  }
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
};

export const fetchCountriesByCodes = async (codes) => {
  if (!codes || codes.length === 0) return [];
  
  const codesParam = codes.join(',');
  const response = await fetch(`${BASE_URL}/alpha?codes=${codesParam}&fields=cca3,name,flags,population,region,capital`);
  if (!response.ok) {
    throw new Error('Failed to fetch border countries');
  }
  return response.json();
};