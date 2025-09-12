# GuildWallet Frontend

A modern, secure cryptocurrency wallet frontend built with Next.js, TypeScript, and Web3 technologies. This is a production-ready web wallet similar to MetaMask with a focus on security, usability, and multi-chain support.

## Features

### 🔐 Security
- **Local Key Storage**: Private keys are encrypted and stored locally using AES-GCM
- **Seed Phrase Backup**: 12/24-word mnemonic seed phrase generation and recovery
- **Password Protection**: PBKDF2 key derivation with 100,000 iterations
- **Secure Key Derivation**: BIP39/BIP44 compliant key generation

### 💰 Wallet Management
- **Multiple Accounts**: Create and manage multiple wallet accounts
- **Account Import**: Import existing wallets via seed phrase or private key
- **Balance Tracking**: Real-time balance updates across networks
- **Transaction History**: Complete transaction tracking and status

### 🌐 Multi-Chain Support
- **Ethereum Mainnet**: Full Ethereum network support
- **Test Networks**: Sepolia testnet for development
- **Polygon**: Polygon network integration
- **Custom Networks**: Add custom RPC endpoints

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Built-in theme support with shadcn/ui
- **Intuitive Interface**: Clean, modern design inspired by MetaMask
- **Real-time Updates**: Live balance and transaction updates

### 🔌 dApp Integration
- **EIP-1193 Provider**: Full Ethereum provider interface
- **Chrome Extension**: Manifest v3 extension support
- **Web3 Compatibility**: Works with existing dApps

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, React 18
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand with persistence
- **Blockchain**: Viem (Ethereum library)
- **Cryptography**: Web Crypto API, BIP39, HDKey
- **API Integration**: React Query (TanStack Query)
- **Notifications**: React Hot Toast

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main wallet dashboard
│   ├── settings/          # Wallet settings
│   ├── receive/           # Receive funds page
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── WalletCard.tsx    # Wallet information card
│   ├── CreateWalletDialog.tsx
│   ├── ImportWalletDialog.tsx
│   └── ...
├── hooks/                # Custom React hooks
│   ├── useWallet.ts      # Wallet operations
│   ├── useTransactions.ts # Transaction management
│   ├── useNetwork.ts     # Network switching
│   └── useProvider.ts    # EIP-1193 provider
├── lib/                  # Utility libraries
│   ├── crypto/           # Cryptographic utilities
│   │   ├── wallet.ts     # Wallet generation/import
│   │   ├── encryption.ts # AES-GCM encryption
│   │   └── transactions.ts # Transaction handling
│   ├── provider.ts       # EIP-1193 provider
│   └── utils.ts          # General utilities
├── stores/               # Zustand state stores
│   ├── walletStore.ts    # Wallet state
│   ├── networkStore.ts   # Network state
│   └── transactionStore.ts # Transaction state
├── services/             # API services
│   ├── api.ts           # API client
│   └── queries.ts       # React Query hooks
└── extension/           # Chrome extension files
    ├── manifest.json    # Extension manifest
    ├── background.js    # Background script
    ├── content.js       # Content script
    └── inpage.js        # Injected provider
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see server setup)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GuildWallet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_DEFAULT_CHAIN_ID=1
NEXT_PUBLIC_DEFAULT_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_DEBUG=true
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Creating a New Wallet

1. Click "Create New Wallet" on the welcome screen
2. Set a strong password (minimum 8 characters)
3. **IMPORTANT**: Write down your 12-word seed phrase in a secure location
4. Confirm your seed phrase by selecting words in order
5. Your wallet is now ready to use!

### Importing an Existing Wallet

1. Click "Import Existing Wallet" on the welcome screen
2. Choose import method:
   - **Seed Phrase**: Enter your 12 or 24-word recovery phrase
   - **Private Key**: Enter your private key (less secure)
3. Set a password for the imported wallet
4. Your wallet is now imported and ready to use!

### Sending Transactions

1. Navigate to the dashboard
2. Click "Send" in the Quick Actions
3. Enter the recipient address
4. Enter the amount to send
5. Enter your wallet password
6. Confirm the transaction

### Receiving Funds

1. Navigate to the "Receive" page
2. Copy your wallet address or share the QR code
3. Share this address with the sender

## Backend Integration

The frontend integrates with a REST API backend. Key endpoints:

- `POST /api/auth/register` - Create new wallet
- `POST /api/auth/login` - Unlock wallet
- `POST /api/auth/import` - Import wallet
- `GET /api/wallet/accounts` - Get user accounts
- `POST /api/transactions/send` - Send transaction
- `GET /api/transactions` - Get transaction history

## Chrome Extension

To build the Chrome extension:

1. Build the Next.js app for production
2. Copy the built files to the `extension/` directory
3. Load the extension in Chrome Developer Mode

The extension provides:
- EIP-1193 provider injection
- dApp connectivity
- Secure transaction signing
- Network switching

## Security Considerations

### ⚠️ Important Security Notes

- **Never share your seed phrase** with anyone
- **Store your seed phrase offline** in a secure location
- **Use a strong password** to protect your wallet
- **Verify addresses** before sending transactions
- **Keep your software updated** for security patches

### Best Practices

- Test with small amounts first
- Use test networks for development
- Keep multiple backups of your seed phrase
- Use hardware wallets for large amounts
- Be cautious of phishing attempts

## Development

### Key Components

- **WalletCard**: Displays wallet information and controls
- **CreateWalletDialog**: Handles new wallet creation
- **ImportWalletDialog**: Handles wallet import
- **SendTransactionDialog**: Transaction sending interface
- **TransactionHistory**: Shows transaction history

### Adding New Networks

To add support for a new blockchain network:

1. Update the `SUPPORTED_CHAINS` in `lib/crypto/transactions.ts`
2. Add the network configuration in `stores/networkStore.ts`
3. Update the network switching logic

### Customizing the UI

The application uses Tailwind CSS and shadcn/ui for styling:

- **Colors**: Update the color palette in `tailwind.config.js`
- **Components**: Modify component styles in `app/globals.css`
- **Layout**: Update the main layout in `app/layout.tsx`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This software is provided "as is" without warranty. Cryptocurrency transactions are irreversible. Always verify addresses and amounts before sending. The developers are not responsible for any loss of funds.

## Support

For support, please open an issue on GitHub or contact the development team.

---

**Remember**: Your seed phrase is the only way to recover your wallet. Keep it safe and never share it with anyone!
