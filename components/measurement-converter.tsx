"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Language, t } from "@/lib/translations"

type ConversionCategory = "length" | "weight" | "volume" | "temperature"

interface ConversionOption {
  value: string
  label: string
  factor?: number
  toBase?: (value: number) => number
  fromBase?: (value: number) => number
}

interface MeasurementConverterProps {
  language: Language
}

export default function MeasurementConverter({ language }: MeasurementConverterProps) {
  const [category, setCategory] = useState<ConversionCategory>("length")
  const [fromUnit, setFromUnit] = useState("")
  const [toUnit, setToUnit] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [result, setResult] = useState("")

  const getLocalizedLabel = (label: string): string => {
    // Extract the unit from the label (e.g., "Meters (m)" -> "Meters")
    const unitName = label.split(" ")[0]
    const unitSymbol = label.match(/$$([^)]+)$$/)?.[1] || ""

    // Translate common unit names
    let translatedName = unitName
    if (language === "pt-BR") {
      const translations: Record<string, string> = {
        Millimeters: "Milímetros",
        Centimeters: "Centímetros",
        Meters: "Metros",
        Kilometers: "Quilômetros",
        Inches: "Polegadas",
        Feet: "Pés",
        Yards: "Jardas",
        Miles: "Milhas",
        Milligrams: "Miligramas",
        Grams: "Gramas",
        Kilograms: "Quilogramas",
        Metric: "Toneladas",
        Tons: "Métricas",
        Ounces: "Onças",
        Pounds: "Libras",
        Stone: "Stone",
        Milliliters: "Mililitros",
        Liters: "Litros",
        Gallons: "Galões",
        Quarts: "Quartos",
        Pints: "Pintas",
        Cups: "Xícaras",
        Fluid: "Onças",
        Tablespoons: "Colheres de sopa",
        Teaspoons: "Colheres de chá",
        Celsius: "Celsius",
        Fahrenheit: "Fahrenheit",
        Kelvin: "Kelvin",
      }
      translatedName = translations[unitName] || unitName
    }

    return `${translatedName} (${unitSymbol})`
  }

  const conversionOptions: Record<ConversionCategory, ConversionOption[]> = {
    length: [
      { value: "mm", label: "Millimeters (mm)", factor: 0.001 },
      { value: "cm", label: "Centimeters (cm)", factor: 0.01 },
      { value: "m", label: "Meters (m)", factor: 1 },
      { value: "km", label: "Kilometers (km)", factor: 1000 },
      { value: "in", label: "Inches (in)", factor: 0.0254 },
      { value: "ft", label: "Feet (ft)", factor: 0.3048 },
      { value: "yd", label: "Yards (yd)", factor: 0.9144 },
      { value: "mi", label: "Miles (mi)", factor: 1609.344 },
    ],
    weight: [
      { value: "mg", label: "Milligrams (mg)", factor: 0.000001 },
      { value: "g", label: "Grams (g)", factor: 0.001 },
      { value: "kg", label: "Kilograms (kg)", factor: 1 },
      { value: "t", label: "Metric Tons (t)", factor: 1000 },
      { value: "oz", label: "Ounces (oz)", factor: 0.0283495 },
      { value: "lb", label: "Pounds (lb)", factor: 0.453592 },
      { value: "st", label: "Stone (st)", factor: 6.35029 },
    ],
    volume: [
      { value: "ml", label: "Milliliters (ml)", factor: 0.001 },
      { value: "l", label: "Liters (l)", factor: 1 },
      { value: "gal", label: "Gallons (gal)", factor: 3.78541 },
      { value: "qt", label: "Quarts (qt)", factor: 0.946353 },
      { value: "pt", label: "Pints (pt)", factor: 0.473176 },
      { value: "cup", label: "Cups (cup)", factor: 0.236588 },
      { value: "oz", label: "Fluid Ounces (fl oz)", factor: 0.0295735 },
      { value: "tbsp", label: "Tablespoons (tbsp)", factor: 0.0147868 },
      { value: "tsp", label: "Teaspoons (tsp)", factor: 0.00492892 },
    ],
    temperature: [
      {
        value: "c",
        label: "Celsius (°C)",
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        value: "f",
        label: "Fahrenheit (°F)",
        toBase: (value) => ((value - 32) * 5) / 9,
        fromBase: (value) => (value * 9) / 5 + 32,
      },
      {
        value: "k",
        label: "Kelvin (K)",
        toBase: (value) => value - 273.15,
        fromBase: (value) => value + 273.15,
      },
    ],
  }

  const handleCategoryChange = (value: ConversionCategory) => {
    setCategory(value)
    setFromUnit("")
    setToUnit("")
    setInputValue("")
    setResult("")
  }

  const convert = () => {
    if (!fromUnit || !toUnit || !inputValue) {
      return
    }

    const value = Number.parseFloat(inputValue)
    if (isNaN(value)) {
      return
    }

    let convertedValue: number

    if (category === "temperature") {
      const fromOption = conversionOptions.temperature.find((opt) => opt.value === fromUnit)
      const toOption = conversionOptions.temperature.find((opt) => opt.value === toUnit)

      if (fromOption?.toBase && toOption?.fromBase) {
        // Convert to Celsius first, then to target unit
        const inCelsius = fromOption.toBase(value)
        convertedValue = toOption.fromBase(inCelsius)
      } else {
        return
      }
    } else {
      const fromOption = conversionOptions[category].find((opt) => opt.value === fromUnit)
      const toOption = conversionOptions[category].find((opt) => opt.value === toUnit)

      if (fromOption?.factor && toOption?.factor) {
        // Convert to base unit (m, kg, l) first, then to target unit
        const inBaseUnit = value * fromOption.factor
        convertedValue = inBaseUnit / toOption.factor
      } else {
        return
      }
    }

    setResult(convertedValue.toFixed(6).replace(/\.?0+$/, ""))
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category" className="dark:text-gray-200">
          {t("conversionType", language)}
        </Label>
        <Select value={category} onValueChange={(value: ConversionCategory) => handleCategoryChange(value)}>
          <SelectTrigger id="category" className="dark:text-gray-100">
            <SelectValue placeholder={t("selectCategory", language)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="length">{t("length", language)}</SelectItem>
            <SelectItem value="weight">{t("weight", language)}</SelectItem>
            <SelectItem value="volume">{t("volume", language)}</SelectItem>
            <SelectItem value="temperature">{t("temperature", language)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromUnit" className="dark:text-gray-200">
            {t("from", language)}
          </Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger id="fromUnit" className="dark:text-gray-100">
              <SelectValue placeholder={t("selectUnit", language)} />
            </SelectTrigger>
            <SelectContent>
              {conversionOptions[category].map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {language === "en" ? option.label : getLocalizedLabel(option.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toUnit" className="dark:text-gray-200">
            {t("to", language)}
          </Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger id="toUnit" className="dark:text-gray-100">
              <SelectValue placeholder={t("selectUnit", language)} />
            </SelectTrigger>
            <SelectContent>
              {conversionOptions[category].map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {language === "en" ? option.label : getLocalizedLabel(option.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inputValue" className="dark:text-gray-200">
          {t("value", language)}
        </Label>
        <Input
          id="inputValue"
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("enterValue", language)}
          className="dark:text-gray-100"
        />
      </div>

      <Button onClick={convert} className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
        {t("convert", language)}
      </Button>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
          <p className="text-lg dark:text-gray-100">
            {inputValue} {conversionOptions[category].find((opt) => opt.value === fromUnit)?.label.split(" ")[0]} =
            <span className="font-bold"> {result} </span>
            {conversionOptions[category].find((opt) => opt.value === toUnit)?.label.split(" ")[0]}
          </p>
        </div>
      )}
    </div>
  )
}

