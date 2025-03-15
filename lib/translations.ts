export const translations = {
  en: {
    // General
    multiFunction: "Multi-Function Calculator",
    basic: "Basic",
    bmi: "BMI",
    measure: "Measure",
    currency: "Currency",
    allRightsReserved: "All rights reserved by",

    // Basic Calculator
    ac: "AC",
    showHistory: "Show History",
    hideHistory: "Hide History",
    clearHistory: "Clear History",
    noHistory: "No calculation history yet",
    sqrt: "√",

    // BMI Calculator
    metric: "Metric (cm/kg)",
    imperial: "Imperial (in/lbs)",
    height: "Height",
    weightLabel: "Weight",
    enterHeight: "Enter height in",
    enterWeight: "Enter weight in",
    calculate: "Calculate BMI",
    reset: "Reset",
    yourBmi: "Your BMI:",
    category: "Category:",
    bmiCategories: "BMI Categories:",
    underweight: "Underweight: < 18.5",
    normalWeight: "Normal weight: 18.5–24.9",
    overweight: "Overweight: 25–29.9",
    obesity: "Obesity: BMI of 30 or greater",

    // Measurement Converter
    conversionType: "Conversion Type",
    length: "Length",
    weight: "Weight",
    volume: "Volume",
    temperature: "Temperature",
    from: "From",
    to: "To",
    selectUnit: "Select unit",
    selectCategory: "Select category",
    value: "Value",
    enterValue: "Enter value to convert",
    convert: "Convert",

    // Currency Converter
    amount: "Amount",
    enterAmount: "Enter amount",
    ratesLastUpdated: "Rates last updated:",
    failedToFetch: "Failed to fetch exchange rates. Using demo data instead.",
  },
  "pt-BR": {
    // General
    multiFunction: "Calculadora Multifunção",
    basic: "Básica",
    bmi: "IMC",
    measure: "Medidas",
    currency: "Moedas",
    allRightsReserved: "Todos os direitos reservados por",

    // Basic Calculator
    ac: "AC",
    showHistory: "Mostrar Histórico",
    hideHistory: "Ocultar Histórico",
    clearHistory: "Limpar Histórico",
    noHistory: "Nenhum histórico de cálculo ainda",
    sqrt: "√",

    // BMI Calculator
    metric: "Métrico (cm/kg)",
    imperial: "Imperial (pol/lb)",
    height: "Altura",
    weightLabel: "Peso",
    enterHeight: "Digite a altura em",
    enterWeight: "Digite o peso em",
    calculate: "Calcular IMC",
    reset: "Limpar",
    yourBmi: "Seu IMC:",
    category: "Categoria:",
    bmiCategories: "Categorias de IMC:",
    underweight: "Abaixo do peso: < 18,5",
    normalWeight: "Peso normal: 18,5–24,9",
    overweight: "Sobrepeso: 25–29,9",
    obesity: "Obesidade: IMC de 30 ou mais",

    // Measurement Converter
    conversionType: "Tipo de Conversão",
    length: "Comprimento",
    weight: "Peso",
    volume: "Volume",
    temperature: "Temperatura",
    from: "De",
    to: "Para",
    selectUnit: "Selecione a unidade",
    selectCategory: "Selecione a categoria",
    value: "Valor",
    enterValue: "Digite o valor para converter",
    convert: "Converter",

    // Currency Converter
    amount: "Quantia",
    enterAmount: "Digite a quantia",
    ratesLastUpdated: "Taxas atualizadas em:",
    failedToFetch: "Falha ao buscar taxas de câmbio. Usando dados de demonstração.",
  },
}

export type Language = "en" | "pt-BR"
export type TranslationKey = keyof (typeof translations)["en"]

export function t(key: TranslationKey, language: Language): string {
  return translations[language][key] || key
}

