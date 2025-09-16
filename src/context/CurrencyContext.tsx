import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

// Define the structure of our currency data
interface Currency {
  symbol: string;
  rate: number; // Rate relative to USD
}

// Define the available currencies and their static rates
// In a real-world app, you would fetch these from a currency API
const currencies: Record<string, Currency> = {
  USD: { symbol: '$', rate: 1 },
  KES: { symbol: 'KSh', rate: 130 },
  TZS: { symbol: 'TSh', rate: 2600 },
  UGX: { symbol: 'USh', rate: 3800 },
};

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (priceInUsd: number) => string;
  currencies: Record<string, Currency>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<string>('USD');

  const convertPrice = useMemo(() => {
    return (priceInUsd: number) => {
      const selectedCurrency = currencies[currency];
      if (!selectedCurrency) {
        // Fallback to USD if something goes wrong
        return `$${priceInUsd.toFixed(2)}`;
      }
      
      const convertedAmount = priceInUsd * selectedCurrency.rate;

      // Use Intl.NumberFormat for proper currency formatting
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol',
      }).format(convertedAmount).replace(currency, selectedCurrency.symbol);
    };
  }, [currency]);

  const value = {
    currency,
    setCurrency,
    convertPrice,
    currencies,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
