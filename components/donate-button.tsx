"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/hooks/use-web3"
import { Heart } from "lucide-react"

// Author's wallet address
const AUTHOR_ADDRESS = "0x1234567890123456789012345678901234567890"

export function DonateButton() {
  const { isConnected, address, provider } = useWeb3()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState("0.01")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDonate = async () => {
    if (!isConnected || !provider) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a donation.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Convert amount to wei
      const amountInWei = BigInt(Number.parseFloat(amount) * 10 ** 18)

      // Create transaction
      const tx = {
        to: AUTHOR_ADDRESS,
        value: amountInWei,
      }

      // Send transaction
      const signer = provider.getSigner()
      const transaction = await signer.sendTransaction(tx)

      // Wait for transaction to be mined
      await transaction.wait()

      toast({
        title: "Thank you for your donation!",
        description: `Your donation of ${amount} ETH has been sent to the author.`,
      })

      setIsOpen(false)
    } catch (error) {
      console.error("Donation error:", error)
      toast({
        title: "Donation failed",
        description: "There was an error processing your donation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2">
        <Heart className="h-4 w-4" />
        Support Author
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Support the Author</DialogTitle>
            <DialogDescription>
              Your donation helps maintain and improve SSH-WEB3. Thank you for your support!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.001"
                  min="0.001"
                  className="col-span-2"
                />
                <span>ETH</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient" className="text-right">
                Recipient
              </Label>
              <div className="col-span-3">
                <Input id="recipient" value={AUTHOR_ADDRESS} readOnly />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDonate} disabled={isProcessing || !isConnected}>
              {isProcessing ? "Processing..." : "Donate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
