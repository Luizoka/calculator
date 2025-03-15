"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw } from "lucide-react"
import { type Language, t } from "@/lib/translations"

const apiKey = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY

interface ExchangeRates {
  base_code: string
  conversion_rates: Record<string, number>
  time_last_update_unix: number
}

interface CachedRates {
  [currency: string]: {
    data: ExchangeRates
    timestamp: number
  }
}

interface CurrencyConverterProps {
  language: Language
}

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION = 60 * 60 * 1000

export default function CurrencyConverter({ language }: CurrencyConverterProps) {
  const [amount, setAmount] = useState("")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([])
  const [error, setError] = useState("")

  // Use useRef for the cache to persist between renders without causing re-renders
  const ratesCache = useRef<CachedRates>({})

  // Initialize with demo data
  useEffect(() => {
    // Check if we have any cached rates
    const hasCachedRates = Object.keys(ratesCache.current).length > 0

    if (!hasCachedRates) {
      fetchExchangeRates("USD")
    } else {
      // Use the first available cached currency
      const firstCachedCurrency = Object.keys(ratesCache.current)[0]
      const cachedData = ratesCache.current[firstCachedCurrency]

      setAvailableCurrencies(Object.keys(cachedData.data.conversion_rates))
      setLastFetchTime(cachedData.timestamp)
    }
  }, [])

  // Fetch exchange rates only when needed
  const fetchExchangeRates = async (baseCurrency: string, force = false) => {
    // Check if we already have rates for this currency and they're not expired
    const now = Date.now()
    const cachedRatesForCurrency = ratesCache.current[baseCurrency]

    if (!force && cachedRatesForCurrency && now - cachedRatesForCurrency.timestamp < CACHE_EXPIRATION) {
      // Use cached rates
      setAvailableCurrencies(Object.keys(cachedRatesForCurrency.data.conversion_rates))
      setLastFetchTime(cachedRatesForCurrency.timestamp)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Use the API key from the URL provided
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.result === "success") {
        // Cache the response
        ratesCache.current[baseCurrency] = {
          data: data,
          timestamp: now,
        }

        setAvailableCurrencies(Object.keys(data.conversion_rates))
        setLastFetchTime(now)
      } else {
        throw new Error(data.error || "Failed to fetch exchange rates")
      }
    } catch (err) {
      console.error("Error fetching exchange rates:", err)
      setError(t("failedToFetch", language))

      // Use demo data if API fails
      const demoData = {
        base_code: baseCurrency,
        conversion_rates: {
          USD: baseCurrency === "USD" ? 1 : 1.08,
          EUR: baseCurrency === "EUR" ? 1 : 0.93,
          GBP: baseCurrency === "GBP" ? 1 : 0.79,
          JPY: baseCurrency === "JPY" ? 1 : 157.82,
          CAD: baseCurrency === "CAD" ? 1 : 1.47,
          AUD: baseCurrency === "AUD" ? 1 : 1.63,
          CHF: baseCurrency === "CHF" ? 1 : 0.96,
          CNY: baseCurrency === "CNY" ? 1 : 7.79,
          INR: baseCurrency === "INR" ? 1 : 89.97,
          BRL: baseCurrency === "BRL" ? 1 : 5.42,
        },
        time_last_update_unix: Math.floor(now / 1000),
      }

      // Cache the demo data
      ratesCache.current[baseCurrency] = {
        data: demoData,
        timestamp: now,
      }

      setAvailableCurrencies(Object.keys(demoData.conversion_rates))
      setLastFetchTime(now)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFromCurrencyChange = (currency: string) => {
    setFromCurrency(currency)
    fetchExchangeRates(currency)
  }

  const convertCurrency = () => {
    if (!amount) return

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) return

    // Get the rates for the from currency
    const cachedRatesForFromCurrency = ratesCache.current[fromCurrency]

    if (!cachedRatesForFromCurrency) {
      setError("Exchange rates not available. Please try again.")
      return
    }

    const rates = cachedRatesForFromCurrency.data.conversion_rates

    // Direct conversion if we have rates for the from currency
    if (rates[toCurrency]) {
      const convertedAmount = numAmount * rates[toCurrency]
      setResult(convertedAmount.toFixed(2))
      return
    }

    // If we don't have direct rates, check if we have rates for the to currency
    const cachedRatesForToCurrency = ratesCache.current[toCurrency]

    if (cachedRatesForToCurrency) {
      // Convert using the to currency rates
      const toRates = cachedRatesForToCurrency.data.conversion_rates
      if (toRates[fromCurrency]) {
        const convertedAmount = numAmount / toRates[fromCurrency]
        setResult(convertedAmount.toFixed(2))
        return
      }
    }

    // If we can't convert directly, try to convert through USD
    if (fromCurrency !== "USD" && toCurrency !== "USD") {
      const cachedUsdRates = ratesCache.current["USD"]

      if (cachedUsdRates) {
        const usdRates = cachedUsdRates.data.conversion_rates

        // Convert from currency to USD, then USD to to currency
        if (usdRates[fromCurrency] && usdRates[toCurrency]) {
          const amountInUsd = numAmount / usdRates[fromCurrency]
          const convertedAmount = amountInUsd * usdRates[toCurrency]
          setResult(convertedAmount.toFixed(2))
          return
        }
      }
    }

    // If all else fails, fetch new rates for the from currency
    setError("Conversion not available with cached data. Fetching new rates...")
    fetchExchangeRates(fromCurrency, true).then(() => {
      convertCurrency() // Try again after fetching
    })
  }

  // Debug function to show cache status
  const getCacheStatus = () => {
    return Object.keys(ratesCache.current)
      .map((currency) => {
        const cache = ratesCache.current[currency]
        const age = Math.round((Date.now() - cache.timestamp) / 1000 / 60) // in minutes
        return `${currency}: ${age} min old`
      })
      .join(", ")
  }

  return (
    <div className="p-4 space-y-4">
      {error && (
        <div className="p-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount" className="dark:text-gray-200">
          {t("amount", language)}
        </Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t("enterAmount", language)}
          className="dark:text-gray-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromCurrency" className="dark:text-gray-200">
            {t("from", language)}
          </Label>
          <Select value={fromCurrency} onValueChange={handleFromCurrencyChange}>
            <SelectTrigger id="fromCurrency" className="dark:text-gray-100">
              <SelectValue placeholder={t("selectUnit", language)} />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toCurrency" className="dark:text-gray-200">
            {t("to", language)}
          </Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger id="toCurrency" className="dark:text-gray-100">
              <SelectValue placeholder={t("selectUnit", language)} />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={convertCurrency}
          className="flex-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
          disabled={isLoading}
        >
          {t("convert", language)}
        </Button>
        <Button
          variant="outline"
          onClick={() => fetchExchangeRates(fromCurrency, true)}
          disabled={isLoading}
          className="dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
          <p className="text-lg dark:text-gray-100">
            {amount} {fromCurrency} ={" "}
            <span className="font-bold">
              {result} {toCurrency}
            </span>
          </p>
          {lastFetchTime && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("ratesLastUpdated", language)} {new Date(lastFetchTime).toLocaleString(language)}
            </p>
          )}
          {/* Debug info - can be removed in production */}
          {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cache: {getCacheStatus()}
          </p> */}
        </div>
      )}
    </div>
  )
}

