import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts'
import { generateMnemonic } from 'viem/accounts'
import { wordlist as english } from '@scure/bip39/wordlists/english'
import { keccak256, toHex } from 'viem'
import { encrypt, decrypt } from './encryption'

/**
 * Validate a mnemonic phrase using BIP39 wordlist
 */
function validateMnemonic(mnemonic: string): boolean {
  try {
    const words = mnemonic.trim().split(/\s+/)
    
    // Enforce 12-word mnemonics only
    if (words.length !== 12) {
      return false
    }

    // Try to create an account from the mnemonic - this will validate against BIP39 wordlist
    mnemonicToAccount(mnemonic)
    return true
  } catch (error) {
    return false
  }
}

export interface WalletAccount {
  address: string
  privateKey: string
  publicKey: string
}

export interface EncryptedWallet {
  encryptedPrivateKey: string
  encryptedMnemonic?: string
  address: string
  publicKey: string
  salt: string
  iv: string
}

/**
 * Generate a new wallet with mnemonic
 */
export function generateWallet(): { mnemonic: string; account: WalletAccount } {
  const mnemonic = generateMnemonic(english, 128)
  const account = mnemonicToAccount(mnemonic)

  return {
    mnemonic,
    account: {
      address: account.address,
      // For mnemonic-based account, do not store a fake/unknown private key
      privateKey: '',
      publicKey: account.publicKey,
    }
  }
}

/**
 * Import wallet from mnemonic
 */
export function importWalletFromMnemonic(mnemonic: string): WalletAccount {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase')
  }

  const account = mnemonicToAccount(mnemonic)

  return {
    address: account.address,
    // For mnemonic-based account, private key is derived on-the-fly for signing
    privateKey: '',
    publicKey: account.publicKey,
  }
}

/**
 * Import wallet from private key
 */
export function importWalletFromPrivateKey(privateKey: string): WalletAccount {
  try {
    // Normalize provided private key
    let pk = privateKey.toString().trim().toLowerCase().replace(/\s+/g,'')
    if (!pk.startsWith('0x')) pk = '0x' + pk
    const account = privateKeyToAccount(pk as `0x${string}`)

    return {
      address: account.address,
      privateKey: pk,
      publicKey: account.publicKey,
    }
  } catch (error) {
    throw new Error('Invalid private key')
  }
}

/**
 * Encrypt wallet data for storage
 */
export async function encryptWallet(
  wallet: WalletAccount,
  password: string,
  mnemonic?: string
): Promise<EncryptedWallet> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encryptedPrivateKey = await encrypt(wallet.privateKey, password, salt, iv)
  const encryptedMnemonic = mnemonic ? await encrypt(mnemonic, password, salt, iv) : undefined

  return {
    encryptedPrivateKey,
    encryptedMnemonic,
    address: wallet.address,
    publicKey: wallet.publicKey,
    salt: toHex(salt),
    iv: toHex(iv),
  }
}

/**
 * Decrypt wallet data from storage
 */
export async function decryptWallet(
  encryptedWallet: EncryptedWallet,
  password: string
): Promise<{ wallet: WalletAccount; mnemonic?: string }> {
  const hexToU8 = (hex: string) => {
    let h = hex.startsWith('0x') ? hex.slice(2) : hex
    if (h.length % 2 !== 0) h = '0' + h
    const out = new Uint8Array(h.length / 2)
    for (let i = 0; i < out.length; i++) {
      out[i] = parseInt(h.substr(i * 2, 2), 16)
    }
    return out
  }
  const salt = hexToU8(encryptedWallet.salt)
  const iv = hexToU8(encryptedWallet.iv)

  const privateKey = await decrypt(encryptedWallet.encryptedPrivateKey, password, salt, iv)
  const mnemonic = encryptedWallet.encryptedMnemonic
    ? await decrypt(encryptedWallet.encryptedMnemonic, password, salt, iv)
    : undefined

  return {
    wallet: {
      address: encryptedWallet.address,
      privateKey,
      publicKey: encryptedWallet.publicKey,
    },
    mnemonic,
  }
}

/**
 * Generate a deterministic address from a seed
 */
export function deriveAddress(seed: string, index = 0): string {
  const hash = keccak256(toHex(seed + index))
  return `0x${hash.slice(-40)}`
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Validate private key format
 */
export function isValidPrivateKey(privateKey: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(privateKey)
}
