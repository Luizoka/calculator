"use client"

import Calculator from "@/components/calculator"
import { useState, useEffect } from "react"
import { type Language, t } from "@/lib/translations"

export default function Home() {
  const [language, setLanguage] = useState<Language>("en")
  
  // Load language preference from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("calculatorLanguage")
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "pt-BR")) {
      setLanguage(savedLanguage as Language)
    }
  }, [])

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("calculatorLanguage", language)
  }, [language])

  // Function to update language that will be passed to Calculator
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
          {t("multiFunction", language)}
        </h1>
        <Calculator initialLanguage={language} onLanguageChange={handleLanguageChange} />
      </div>
    </main>
  )
}