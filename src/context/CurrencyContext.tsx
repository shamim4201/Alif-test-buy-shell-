import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'BDT';
export type Language = 'BN' | 'EN';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: (bn: string, en: string) => string;
  formatPrice: (usdAmount: number, options?: { showBoth?: boolean; compact?: boolean }) => string;
  formatUsd: (usdAmount: number) => string;
  formatBdt: (usdAmount: number) => string;
  getBdtValue: (usdAmount: number) => number;
  conversionRate: number; // 1 USD = 122 BDT
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const BDT_RATE = 122; // 1 USD = 122 BDT

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('channeltrust_currency');
      return (saved === 'BDT' || saved === 'USD') ? saved : 'USD';
    } catch {
      return 'USD';
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('channeltrust_language');
      return (saved === 'BN' || saved === 'EN') ? saved : 'BN';
    } catch {
      return 'BN';
    }
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('channeltrust_currency', c);
    } catch {
      // ignore
    }
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    try {
      localStorage.setItem('channeltrust_language', l);
    } catch {
      // ignore
    }
  };

  const t = (bn: string, en: string) => {
    return language === 'BN' ? bn : en;
  };

  const getBdtValue = (usdAmount: number) => {
    return Math.round((usdAmount || 0) * BDT_RATE);
  };

  const formatUsd = (usdAmount: number) => {
    return `$${Math.round(usdAmount || 0).toLocaleString()}`;
  };

  const formatBdt = (usdAmount: number) => {
    const bdt = getBdtValue(usdAmount);
    return `৳${bdt.toLocaleString()}`;
  };

  const formatPrice = (usdAmount: number, options?: { showBoth?: boolean; compact?: boolean }) => {
    const amount = Number(usdAmount) || 0;
    if (options?.showBoth) {
      return currency === 'USD'
        ? `${formatUsd(amount)} (${formatBdt(amount)})`
        : `${formatBdt(amount)} (${formatUsd(amount)})`;
    }

    return currency === 'USD' ? formatUsd(amount) : formatBdt(amount);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        language,
        setLanguage,
        t,
        formatPrice,
        formatUsd,
        formatBdt,
        getBdtValue,
        conversionRate: BDT_RATE,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
