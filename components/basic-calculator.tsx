"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { type Language, t } from "@/lib/translations"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BasicCalculatorProps {
  language: Language
}

interface HistoryItem {
  expression: string
  result: string
  timestamp: number
}

export default function BasicCalculator({ language }: BasicCalculatorProps) {
  const [display, setDisplay] = useState("0")
  const [expression, setExpression] = useState("")
  const [fullExpression, setFullExpression] = useState("")
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [openParenCount, setOpenParenCount] = useState(0)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("calculatorHistory")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse calculator history", e)
      }
    }
  }, [])

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("calculatorHistory", JSON.stringify(history))
  }, [history])

  // Update expression display when fullExpression changes
  useEffect(() => {
    setExpression(formatExpression(fullExpression))
  }, [fullExpression])

  const isOperator = (char: string): boolean => {
    return ["+", "-", "*", "/", "×", "÷", "%"].includes(char)
  }

  const getLastChar = (str: string): string => {
    return str.length > 0 ? str[str.length - 1] : ""
  }

  const formatExpression = (expr: string): string => {
    return expr.replace(/\*/g, "×").replace(/\//g, "÷")
  }

  const parseExpression = (expr: string): string => {
    return expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/√\(/g, "Math.sqrt(")
  }

  const inputDigit = (digit: string) => {
    if (lastResult !== null) {
      // If we just calculated a result and start a new number, reset
      setDisplay(digit)
      setFullExpression(digit)
      setLastResult(null)
      setWaitingForOperand(false)
    } else if (waitingForOperand) {
      // If we're waiting for an operand after an operator
      setDisplay(digit)
      setFullExpression((prevExpr) => prevExpr + digit)
      setWaitingForOperand(false)
    } else {
      // Normal digit input
      if (display === "0") {
        setDisplay(digit)
        setFullExpression((prevExpr) => {
          // If the last character is a closing parenthesis, add a multiplication operator
          if (getLastChar(prevExpr) === ")") {
            return prevExpr + "*" + digit
          }
          // If the expression is empty or ends with an operator or opening parenthesis, just add the digit
          return prevExpr === "" || prevExpr === "0" ? digit : prevExpr + digit
        })
      } else {
        setDisplay((prevDisplay) => prevDisplay + digit)
        setFullExpression((prevExpr) => prevExpr + digit)
      }
    }
  }

  const inputDecimal = () => {
    if (lastResult !== null) {
      // If we just calculated a result, start a new decimal number
      setDisplay("0.")
      setFullExpression("0.")
      setLastResult(null)
      setWaitingForOperand(false)
      return
    }

    if (waitingForOperand) {
      // If we're waiting for an operand after an operator
      setDisplay("0.")
      setFullExpression((prevExpr) => prevExpr + "0.")
      setWaitingForOperand(false)
      return
    }

    // Check if the current number already has a decimal point
    if (!display.includes(".")) {
      setDisplay((prevDisplay) => prevDisplay + ".")
      setFullExpression((prevExpr) => prevExpr + ".")
    }
  }

  const clearDisplay = () => {
    setDisplay("0")
    setFullExpression("")
    setExpression("")
    setLastResult(null)
    setOpenParenCount(0)
    setWaitingForOperand(false)
  }

  const handleOperator = (nextOperator: string) => {
    if (lastResult !== null) {
      // Continue calculation with the previous result
      setFullExpression(lastResult + nextOperator)
      setDisplay(lastResult)
      setLastResult(null)
      setWaitingForOperand(true)
      return
    }

    const lastChar = getLastChar(fullExpression)

    // If the last character is an operator, replace it
    if (isOperator(lastChar)) {
      setFullExpression((prevExpr) => prevExpr.slice(0, -1) + nextOperator)
    }
    // If the last character is an opening parenthesis, don't add an operator (except minus)
    else if (lastChar === "(" && nextOperator !== "-") {
      return
    }
    // Otherwise, add the operator
    else {
      setFullExpression((prevExpr) => prevExpr + nextOperator)
    }

    setWaitingForOperand(true)
  }

  const handleParenthesis = (type: "open" | "close") => {
    if (type === "open") {
      const lastChar = getLastChar(fullExpression)

      // If the last character is a digit or closing parenthesis, add a multiplication operator
      if (/\d/.test(lastChar) || lastChar === ")") {
        setFullExpression((prevExpr) => prevExpr + "*(")
      } else {
        setFullExpression((prevExpr) => prevExpr + "(")
      }

      setOpenParenCount((prev) => prev + 1)
      setWaitingForOperand(true)
    } else if (type === "close" && openParenCount > 0) {
      setFullExpression((prevExpr) => prevExpr + ")")
      setOpenParenCount((prev) => prev - 1)
      setWaitingForOperand(false)
    }
  }

  const handleSquareRoot = () => {
    if (lastResult !== null) {
      // Apply square root to the previous result
      setFullExpression("√(" + lastResult + ")")
      setLastResult(null)
      setWaitingForOperand(true)
    } else {
      // If we're in the middle of an expression
      const lastChar = getLastChar(fullExpression)

      if (isOperator(lastChar) || lastChar === "(" || fullExpression === "") {
        setFullExpression((prevExpr) => prevExpr + "√(")
        setOpenParenCount((prev) => prev + 1)
      } else {
        // If we have a number or closing parenthesis, add multiplication
        setFullExpression((prevExpr) => prevExpr + "*√(")
        setOpenParenCount((prev) => prev + 1)
      }
      setWaitingForOperand(true)
    }
  }

  const calculateResult = () => {
    if (fullExpression === "") return

    // Close any open parentheses
    let expressionToEvaluate = fullExpression
    for (let i = 0; i < openParenCount; i++) {
      expressionToEvaluate += ")"
    }

    try {
      // Parse and evaluate the expression
      const parsedExpression = parseExpression(expressionToEvaluate)
      // Using Function instead of eval for better security
      const result = Function('"use strict";return (' + parsedExpression + ")")()

      // Format the result
      const formattedResult =
        typeof result === "number" && !Number.isInteger(result)
          ? result.toFixed(8).replace(/\.?0+$/, "")
          : String(result)

      // Add to history
      const historyItem: HistoryItem = {
        expression: formatExpression(expressionToEvaluate),
        result: formattedResult,
        timestamp: Date.now(),
      }
      setHistory((prev) => [historyItem, ...prev.slice(0, 19)]) // Keep only last 20 items

      // Update display
      setDisplay(formattedResult)
      setExpression(formatExpression(expressionToEvaluate) + " = " + formattedResult)
      setLastResult(formattedResult)
      setFullExpression("")
      setOpenParenCount(0)
      setWaitingForOperand(false)
    } catch (error) {
      setDisplay("Error")
      setExpression("Error in expression")
      console.error("Calculation error:", error)
    }
  }

  const toggleSign = () => {
    if (display === "0") return

    if (lastResult !== null) {
      const negatedResult = String(-Number.parseFloat(lastResult))
      setDisplay(negatedResult)
      setLastResult(negatedResult)
      setExpression("-(" + expression.split(" = ")[0] + ") = " + negatedResult)
      return
    }

    // If we're in the middle of entering a number
    const lastChar = getLastChar(fullExpression)
    if (/\d/.test(lastChar)) {
      // Find the last number in the expression
      const regex = /(-?\d+\.?\d*)$/
      const match = fullExpression.match(regex)

      if (match) {
        const lastNumber = match[0]
        const negatedNumber = String(-Number.parseFloat(lastNumber))
        const newExpression = fullExpression.slice(0, fullExpression.length - lastNumber.length) + negatedNumber

        setDisplay(negatedNumber)
        setFullExpression(newExpression)
      }
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("calculatorHistory")
  }

  const handleHistoryItemClick = (item: HistoryItem) => {
    setDisplay(item.result)
    setLastResult(item.result)
    setExpression(item.expression + " = " + item.result)
    setFullExpression("")
    setWaitingForOperand(false)
  }

  return (
    <div className="p-4">
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-4">
        <div className="flex justify-between items-center mb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs dark:text-gray-300 hover:dark:text-white"
          >
            {showHistory ? t("hideHistory", language) || "Hide History" : t("showHistory", language) || "Show History"}
          </Button>
          {history.length > 0 && showHistory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 hover:dark:text-red-300"
            >
              {t("clearHistory", language) || "Clear History"}
            </Button>
          )}
        </div>

        {showHistory && (
          <ScrollArea className="h-32 mb-2 rounded border dark:border-gray-600">
            {history.length > 0 ? (
              <div className="p-2">
                {history.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleHistoryItemClick(item)}
                    className="text-sm p-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <div className="text-gray-600 dark:text-gray-300">{item.expression}</div>
                    <div className="font-medium">= {item.result}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                {t("noHistory", language) || "No calculation history yet"}
              </div>
            )}
          </ScrollArea>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-300 min-h-5 text-right overflow-hidden break-all">
          {expression}
        </div>
        <div className="text-3xl font-medium text-gray-800 dark:text-gray-100 min-h-10 overflow-hidden text-right break-all">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <Button
          variant="outline"
          onClick={clearDisplay}
          className="dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {t("ac", language)}
        </Button>
        <Button
          variant="outline"
          onClick={toggleSign}
          className="dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          +/-
        </Button>
        <Button
          variant="outline"
          onClick={() => handleParenthesis("open")}
          className="dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          (
        </Button>
        <Button
          variant="outline"
          onClick={() => handleParenthesis("close")}
          className="dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          )
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOperator("/")}
          className="dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          ÷
        </Button>

        <Button onClick={() => inputDigit("7")} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
          7
        </Button>
        <Button onClick={() => inputDigit("8")} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
          8
        </Button>
        <Button onClick={() => inputDigit("9")} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
          9
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOperator("*")}
          className="dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          ×
        </Button>
        <Button
          variant="outline"
          onClick={handleSquareRoot}
          className="dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          √
        </Button>

        <Button onClick={() => inputDigit("4")} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
          4
        </Button>
        <Button onClick={() => inputDigit("5")} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
          5
        </Button>
        <Button onClick={() => inputDigit("6")} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
          6
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOperator("-")}
          className="dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          -
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOperator("%")}
          className="dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          %
        </Button>

        <Button onClick={() => inputDigit("1")} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
          1
        </Button>
        <Button onClick={() => inputDigit("2")} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
          2
        </Button>
        <Button onClick={() => inputDigit("3")} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
          3
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOperator("+")}
          className="dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          +
        </Button>
        <Button
          variant="default"
          onClick={calculateResult}
          className="row-span-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
        >
          =
        </Button>

        <Button
          onClick={() => inputDigit("0")}
          className="col-span-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
        >
          0
        </Button>
        <Button onClick={inputDecimal} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
          .
        </Button>
        <Button
          variant="outline"
          className="dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 opacity-0 cursor-default"
        >
          {/* Empty button for grid alignment */}
        </Button>
      </div>
    </div>
  )
}

