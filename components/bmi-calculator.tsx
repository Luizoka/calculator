"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { type Language, t } from "@/lib/translations"

interface BMICalculatorProps {
  language: Language
}

export default function BMICalculator({ language }: BMICalculatorProps) {
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [unit, setUnit] = useState("metric")
  const [bmi, setBmi] = useState<number | null>(null)
  const [category, setCategory] = useState("")

  const calculateBMI = () => {
    if (!height || !weight) return

    let bmiValue: number

    if (unit === "metric") {
      // Metric: weight (kg) / height^2 (m)
      const heightInMeters = Number.parseFloat(height) / 100
      bmiValue = Number.parseFloat(weight) / (heightInMeters * heightInMeters)
    } else {
      // Imperial: (weight (lbs) * 703) / height^2 (inches)
      bmiValue = (Number.parseFloat(weight) * 703) / (Number.parseFloat(height) * Number.parseFloat(height))
    }

    setBmi(Number.parseFloat(bmiValue.toFixed(1)))

    // Determine BMI category
    if (bmiValue < 18.5) {
      setCategory(language === "en" ? "Underweight" : "Abaixo do peso")
    } else if (bmiValue < 25) {
      setCategory(language === "en" ? "Normal weight" : "Peso normal")
    } else if (bmiValue < 30) {
      setCategory(language === "en" ? "Overweight" : "Sobrepeso")
    } else {
      setCategory(language === "en" ? "Obesity" : "Obesidade")
    }
  }

  const resetForm = () => {
    setHeight("")
    setWeight("")
    setBmi(null)
    setCategory("")
  }

  return (
    <div className="p-4 space-y-4">
      <RadioGroup value={unit} onValueChange={setUnit} className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="metric" id="metric" className="border-gray-400 dark:border-gray-500" />
          <Label htmlFor="metric" className="dark:text-gray-200">
            {t("metric", language)}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="imperial" id="imperial" className="border-gray-400 dark:border-gray-500" />
          <Label htmlFor="imperial" className="dark:text-gray-200">
            {t("imperial", language)}
          </Label>
        </div>
      </RadioGroup>

      <div className="space-y-2">
        <Label htmlFor="height">
          {t("height", language)} ({unit === "metric" ? "cm" : "inches"})
        </Label>
        <Input
          id="height"
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder={`${t("enterHeight", language)} ${unit === "metric" ? "centimeters" : "inches"}`}
          className="dark:text-gray-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">
          {t("weight", language)} ({unit === "metric" ? "kg" : "lbs"})
        </Label>
        <Input
          id="weight"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={`${t("enterWeight", language)} ${unit === "metric" ? "kilograms" : "pounds"}`}
          className="dark:text-gray-100"
        />
      </div>

      <div className="flex space-x-2">
        <Button onClick={calculateBMI} className="flex-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
          {t("calculate", language)}
        </Button>
        <Button
          variant="outline"
          onClick={resetForm}
          className="dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {t("reset", language)}
        </Button>
      </div>

      {bmi !== null && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
          <p className="text-lg font-medium dark:text-gray-100">
            {t("yourBmi", language)} <span className="font-bold">{bmi}</span>
          </p>
          <p className="text-md dark:text-gray-100">
            {t("category", language)} <span className="font-medium">{category}</span>
          </p>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
            {t("bmiCategories", language)}
            <br />
            {t("underweight", language)}
            <br />
            {t("normalWeight", language)}
            <br />
            {t("overweight", language)}
            <br />
            {t("obesity", language)}
          </p>
        </div>
      )}
    </div>
  )
}

