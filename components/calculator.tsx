"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BasicCalculator from "./basic-calculator"
import BMICalculator from "./bmi-calculator"
import MeasurementConverter from "./measurement-converter"
import CurrencyConverter from "./currency-converter"
import ThemeLanguageToggle from "./theme-language-toggle"
import { type Language, t } from "@/lib/translations"
import { ThemeProvider } from "@/components/theme-provider"

interface CalculatorProps {
  initialLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export default function Calculator({ initialLanguage, onLanguageChange }: CalculatorProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [language, setLanguage] = useState<Language>(initialLanguage)

  // Update local language state when prop changes
  useEffect(() => {
    setLanguage(initialLanguage);
  }, [initialLanguage]);

  // When language changes locally, notify parent component
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    onLanguageChange(lang);
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="calculator-theme">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-medium dark:text-gray-100">{t("multiFunction", language)}</h2>
          <ThemeLanguageToggle language={language} setLanguage={handleLanguageChange} />
        </div>

        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full dark:bg-gray-700">
            <TabsTrigger
              value="basic"
              className="dark:data-[state=active]:bg-gray-600 dark:text-gray-200 dark:data-[state=active]:text-white"
            >
              {t("basic", language)}
            </TabsTrigger>
            <TabsTrigger
              value="bmi"
              className="dark:data-[state=active]:bg-gray-600 dark:text-gray-200 dark:data-[state=active]:text-white"
            >
              {t("bmi", language)}
            </TabsTrigger>
            <TabsTrigger
              value="measurement"
              className="dark:data-[state=active]:bg-gray-600 dark:text-gray-200 dark:data-[state=active]:text-white"
            >
              {t("measure", language)}
            </TabsTrigger>
            <TabsTrigger
              value="currency"
              className="dark:data-[state=active]:bg-gray-600 dark:text-gray-200 dark:data-[state=active]:text-white"
            >
              {t("currency", language)}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <BasicCalculator language={language} />
          </TabsContent>
          <TabsContent value="bmi">
            <BMICalculator language={language} />
          </TabsContent>
          <TabsContent value="measurement">
            <MeasurementConverter language={language} />
          </TabsContent>
          <TabsContent value="currency">
            <CurrencyConverter language={language} />
          </TabsContent>
        </Tabs>
        
        <footer className="p-4 text-center text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700">
          © {new Date().getFullYear()} {t("allRightsReserved", language)} 
          <a 
            href="https://github.com/Luizoka" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Luizoka
          </a>
        </footer>
      </div>
    </ThemeProvider>
  )
}