'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTransactionStore } from '@/stores/transactionStore'
import { useWallet } from '@/hooks/useWallet'
import { formatAddress, formatCurrency } from '@/lib/utils'
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useNetwork } from '@/hooks/useNetwork'

export function TransactionHistory() {
  const { transactions } = useTransactionStore()
  const { currentAccount } = useWallet()
  const { getCurrentNetwork } = useNetwork()

  const network = getCurrentNetwork()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionType = (transaction: any) => {
    if (transaction.from.toLowerCase() === currentAccount?.address.toLowerCase()) {
      return 'send'
    }
    return 'receive'
  }

  const formatTransactionValue = (value: string) => {
    try {
      const num = parseFloat(value)
      return formatCurrency(num, network?.currency.symbol || 'ETH')
    } catch {
      return value
    }
  }

  const openExplorer = (hash: string) => {
    if (network?.blockExplorer) {
      window.open(`${network.blockExplorer}/tx/${hash}`, '_blank')
    }
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No transactions yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const type = getTransactionType(transaction)
            const isOutgoing = type === 'send'
            
            return (
              <div
                key={transaction.hash}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(transaction.status)}
                  <div>
                    <p className="font-medium">
                      {isOutgoing ? 'Send' : 'Receive'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isOutgoing 
                        ? `To ${formatAddress(transaction.to)}`
                        : `From ${formatAddress(transaction.from)}`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-medium ${isOutgoing ? 'text-red-500' : 'text-green-500'}`}>
                    {isOutgoing ? '-' : '+'}{formatTransactionValue(transaction.value)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openExplorer(transaction.hash)}
                    className="h-6 w-6"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
