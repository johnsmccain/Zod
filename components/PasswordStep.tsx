import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface PasswordStepProps {
  password: string
  setPassword: (value: string) => void
  confirmPassword: string
  setConfirmPassword: (value: string) => void
  handleCreateWallet: () => void
  isLoading: boolean
}

export function PasswordStep({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  handleCreateWallet,
  isLoading
}: PasswordStepProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 shadow-lg">
      <CardContent className="space-y-4 p-6">
        <div>
          <Label htmlFor="password" className="text-gray-300">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a secure password"
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
        <Button
          onClick={handleCreateWallet}
          disabled={isLoading || !password || !confirmPassword}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          {isLoading ? 'Creating...' : 'Create Wallet'}
        </Button>
      </CardContent>
    </Card>
  )
}