import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect } from 'react';
import { 
  fetchAllCountries, 
  fetchCountryByCode, 
  fetchCountriesByCodes } from '../services/countriesAPI';

// Create context
const CountryContext = createContext(null);

const initialState = {
  countries: [],
  loading: false,
  error: null,
  cache: new Map()
};

function countryReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_COUNTRIES':
      return { 
        ...state, 
        countries: action.payload,
        loading: false,
        error: null
      };
    case 'SET_SELECTED_COUNTRY':
      return { ...state, selectedCountry: action.payload, loading: false };
    case 'ADD_TO_CACHE':
      const newCache = new Map(state.cache);
      newCache.set(action.payload.key, action.payload.data);
      return { ...state, cache: newCache };
    default:
      return state;
  }
}

// Custom hook for context
export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}

// Provider component
export function CountryProvider({ children }) {
  const [state, dispatch] = useReducer(countryReducer, initialState);

  const loadAllCountries = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const countries = await fetchAllCountries();
      dispatch({ type: 'SET_COUNTRIES', payload: countries });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const getCountryByCode = async (code) => {
    // Check cache first
    const cacheKey = `country-${code}`;
    const cached = state.cache.get(cacheKey);
    if (cached) {
      dispatch({ type: 'SET_SELECTED_COUNTRY', payload: cached });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const country = await fetchCountryByCode(code);
      dispatch({ type: 'SET_SELECTED_COUNTRY', payload: country });
      dispatch({ 
        type: 'ADD_TO_CACHE', 
        payload: { key: cacheKey, data: country } 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const getBorderCountries = async (borderCodes) => {
    if (!borderCodes || borderCodes.length === 0) return [];
    
    const cachedBorders = [];
    const uncachedCodes = [];
    
    borderCodes.forEach(code => {
      const cached = state.cache.get(`country-${code}`);
      if (cached) {
        cachedBorders.push(cached);
      } else {
        uncachedCodes.push(code);
      }
    });

    if (uncachedCodes.length === 0) return cachedBorders;

    try {
      const borderCountries = await fetchCountriesByCodes(uncachedCodes);
      
      // Cache the new countries
      borderCountries.forEach(country => {
        dispatch({ 
          type: 'ADD_TO_CACHE', 
          payload: { key: `country-${country.cca3}`, data: country } 
        });
      });

      return [...cachedBorders, ...borderCountries];
    } catch (error) {
      console.error('Error fetching border countries:', error);
      return cachedBorders;
    }
  };

  useEffect(() => {
    loadAllCountries();
  }, []);

  const value = {
    ...state,
    loadAllCountries,
    getCountryByCode,
    getBorderCountries
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

export default CountryContext;