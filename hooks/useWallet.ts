import { useCallback } from "react";
import { useWalletStore } from "@/stores/walletStore";
import {
  generateWallet,
  importWalletFromMnemonic,
  importWalletFromPrivateKey,
  encryptWallet,
  type WalletAccount,
} from "@/lib/crypto";
import toast from "react-hot-toast";

export function useWallet() {
  const {
    isConnected,
    isUnlocked,
    currentAccount,
    encryptedWallet,
    isLoading,
    error,
    setWallet,
    unlockWallet,
    lockWallet,
    disconnectWallet,
    setLoading,
    setError,
    clearError,
    addAccount,
    switchAccount,
  } = useWalletStore();

  const createWallet = useCallback(
    async (password: string) => {
      setLoading(true);
      clearError();

      try {
        const { mnemonic, account } = generateWallet();
        const encrypted = await encryptWallet(account, password, mnemonic);

        setWallet(account, encrypted);

        toast.success("Wallet created successfully!");
        return { mnemonic, account };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create wallet";
        setError(message);
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setWallet, setLoading, setError, clearError]
  );

  const createAdditionalAccount = useCallback(
    async (password: string) => {
      setLoading(true);
      clearError();
      try {
        const { mnemonic, account } = generateWallet();
        const encrypted = await encryptWallet(account, password, mnemonic);
        addAccount(account, encrypted);
        switchAccount(account.address);
        toast.success("Account created");
        return { mnemonic, account };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create account';
        setError(message);
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addAccount, switchAccount, setLoading, setError, clearError]
  );

  const importFromMnemonic = useCallback(
    async (mnemonic: string, password: string) => {
      setLoading(true);
      clearError();

      try {
        const account = importWalletFromMnemonic(mnemonic);
        const encrypted = await encryptWallet(account, password, mnemonic);

        setWallet(account, encrypted);

        toast.success("Wallet imported successfully!");
        return account;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to import wallet";
        setError(message);
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setWallet, setLoading, setError, clearError]
  );

  const importFromPrivateKey = useCallback(
    async (privateKey: string, password: string) => {
      setLoading(true);
      clearError();

      try {
        const account = importWalletFromPrivateKey(privateKey);
        const encrypted = await encryptWallet(account, password);

        setWallet(account, encrypted);

        toast.success("Wallet imported successfully!");
        return account;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to import wallet";
        setError(message);
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setWallet, setLoading, setError, clearError]
  );

  const unlock = useCallback(
    async (password: string) => {
      const success = await unlockWallet(password);
      if (success) {
        toast.success("Wallet unlocked!");
      } else {
        toast.error("Invalid password");
      }
      return success;
    },
    [unlockWallet]
  );

  const lock = useCallback(() => {
    lockWallet();
    toast.success("Wallet locked");
  }, [lockWallet]);

  const disconnect = useCallback(() => {
    disconnectWallet();
    toast.success("Wallet disconnected");
  }, [disconnectWallet]);

  return {
    // State
    isConnected,
    isUnlocked,
    currentAccount,
    encryptedWallet,
    isLoading,
    error,

    // Actions
    createWallet,
    importFromMnemonic,
    importFromPrivateKey,
    createAdditionalAccount,
    unlock,
    lock,
    disconnect,
    clearError,
  };
}
