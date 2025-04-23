"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"

interface Web3ContextType {
  isConnected: boolean
  address: string | null
  provider: ethers.BrowserProvider | null
  connect: () => Promise<void>
  disconnect: () => void
  signMessage: (message: string) => Promise<string>
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  address: null,
  provider: null,
  connect: async () => {},
  disconnect: () => {},
  signMessage: async () => "",
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const { toast } = useToast()

  // Check if previously connected
  useEffect(() => {
    const savedAddress = localStorage.getItem("web3Address")
    if (savedAddress) {
      checkConnection()
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await ethersProvider.listAccounts()

        if (accounts.length > 0) {
          const account = accounts[0]
          setAddress(account.address)
          setProvider(ethersProvider)
          setIsConnected(true)
          localStorage.setItem("web3Address", account.address)
        }
      } catch (error) {
        console.error("Connection check error:", error)
      }
    }
  }

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        title: "Web3 Not Available",
        description: "Please install a Web3 wallet like MetaMask to continue.",
        variant: "destructive",
      })
      return
    }

    try {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await ethersProvider.send("eth_requestAccounts", [])

      if (accounts.length > 0) {
        const signer = await ethersProvider.getSigner()
        setAddress(signer.address)
        setProvider(ethersProvider)
        setIsConnected(true)
        localStorage.setItem("web3Address", signer.address)

        toast({
          title: "Connected",
          description: "Your wallet has been connected successfully.",
        })
      }
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const disconnect = () => {
    setAddress(null)
    setProvider(null)
    setIsConnected(false)
    localStorage.removeItem("web3Address")
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  const signMessage = async (message: string): Promise<string> => {
    if (!isConnected || !provider) {
      throw new Error("Wallet not connected")
    }

    try {
      const signer = await provider.getSigner()
      return await signer.signMessage(message)
    } catch (error) {
      console.error("Signing error:", error)
      throw error
    }
  }

  return (
    <Web3Context.Provider value={{ isConnected, address, provider, connect, disconnect, signMessage }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)
