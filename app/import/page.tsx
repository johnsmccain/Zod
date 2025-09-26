"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/hooks/useWallet"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"

export default function ImportWalletPage() {
  const router = useRouter()
  const { importFromMnemonic, importFromPrivateKey, isLoading } = useWallet()
  const [activeTab, setActiveTab] = useState<string>("mnemonic")
  const [seed, setSeed] = useState("")
  const [pkey, setPkey] = useState("")
  const [password, setPassword] = useState("")

  const onImport = async () => {
    const pwdOk = password.length >= 8
    if (!pwdOk) {
      toast.error("Password must be at least 8 characters")
      return
    }

    if (activeTab === "mnemonic") {
      const words = seed.trim().split(/\s+/).filter(Boolean)
      const validCount = words.length === 12 || words.length === 24
      const validChars = words.every(w => /^[a-z]+$/.test(w))
      if (!seed.trim() || !validCount || !validChars) {
        toast.error("Enter a valid 12 or 24 word lowercase recovery phrase")
        return
      }
      await importFromMnemonic(seed.trim(), password)
    } else {
      const pk = pkey.trim()
      if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) {
        toast.error("Private key must be 0x followed by 64 hex characters")
        return
      }
      await importFromPrivateKey(pk, password)
    }

    // After successful import, navigate to dashboard (guarded by root page as well)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0E141B] border border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold">Import your wallet</h1>
            <p className="text-gray-400 mt-1">Restore your existing wallet using your seed phrase or private key.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent border border-gray-800 rounded-lg overflow-hidden">
              <TabsTrigger value="mnemonic" className="data-[state=active]:bg-cyan-400 data-[state=active]:text-gray-900">
                Seed Phrase
              </TabsTrigger>
              <TabsTrigger value="privateKey" className="data-[state=active]:bg-cyan-400 data-[state=active]:text-gray-900">
                Private Key
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mnemonic" className="mt-5 space-y-4">
              <div>
                <Label htmlFor="seed" className="text-sm text-gray-300">Recovery Phrase (12 or 24 words)</Label>
                <textarea
                  id="seed"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Enter your 12 or 24 word recovery phrase separated by spaces"
                  className="mt-2 w-full h-28 resize-none rounded-lg border border-gray-800 bg-[#0B1116] px-3 py-3 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                />
                <p className="text-xs text-gray-400 mt-2">Separate each word with a space. Words should be lowercase.</p>
              </div>

              <div className="rounded-lg border border-gray-800 bg-[#0B1116] p-4 flex items-start">
                <div className="w-9 h-9 mr-3 rounded-full bg-cyan-400/15 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-sm text-gray-300">
                  Your wallet credentials are encrypted and stored locally. We never have access to your private keys or seed phrase.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="privateKey" className="mt-5 space-y-4">
              <div>
                <Label htmlFor="pkey" className="text-sm text-gray-300">Private Key</Label>
                <textarea
                  id="pkey"
                  value={pkey}
                  onChange={(e) => setPkey(e.target.value)}
                  placeholder="Enter your private key (0x...)"
                  className="mt-2 w-full h-24 resize-none rounded-lg border border-gray-800 bg-[#0B1116] px-3 py-3 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                />
                <p className="text-xs text-gray-400 mt-2">Your private key should start with 0x and be 64 hex characters.</p>
              </div>

              <div className="rounded-lg border border-gray-800 bg-[#0B1116] p-4 flex items-start">
                <div className="w-9 h-9 mr-3 rounded-full bg-cyan-400/15 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-sm text-gray-300">
                  Keep your private key safe. Anyone with it can control your funds.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-5">
            <Label htmlFor="password" className="text-sm text-gray-300">Password</Label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password to secure your wallet"
              className="mt-2 w-full h-10 rounded-lg border border-gray-800 bg-[#0B1116] px-3 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            />
            <p className="text-xs text-gray-400 mt-2">Minimum 8 characters.</p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-700 text-cyan-400 hover:bg-gray-800/50"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button
              className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-gray-900"
              disabled={isLoading || (activeTab === "mnemonic" ? !seed.trim() : !pkey.trim()) || !password}
              onClick={onImport}
            >
              {isLoading ? "Importing..." : "Import Wallet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
