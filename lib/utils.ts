import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return ""
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatBalance(balance: bigint, decimals = 18, precision = 4): string {
  const divisor = BigInt(10 ** decimals)
  const whole = balance / divisor
  const remainder = balance % divisor
  
  if (remainder === 0n) {
    return whole.toString()
  }
  
  const fractional = Number(remainder) / Number(divisor)
  const fractionalStr = fractional.toFixed(precision).replace(/\.?0+$/, '')
  
  return fractionalStr ? `${whole}.${fractionalStr}` : whole.toString()
}

export function formatCurrency(amount: string | number, currency = "ETH"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "0.00"
  
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(num) + ` ${currency}`
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  
  // Fallback for older browsers
  const textArea = document.createElement("textarea")
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand("copy")
  document.body.removeChild(textArea)
  return Promise.resolve()
}
