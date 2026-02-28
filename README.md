# HeadStart

HeadStart is a decentralized application (dApp) that features a Next.js frontend and a Solidity smart contract backend, focusing on token launches and staking.

## Project Structure

- `app/`: The Next.js frontend web application containing the user interface for token launches, staking panels, and token charts.
- `contract/`: The Foundry-based smart contracts for the HeadStart protocol, including the Factory, Launch, and Staking contracts.

## Getting Started

### Smart Contracts (Foundry)

To build and test the smart contracts, navigate to the `contract` directory:

```bash
cd contract
forge build
forge test
```

### Frontend (Next.js)

To run the frontend development server, navigate to the `app` directory and install the dependencies if you haven't already:

```bash
cd app
npm install
npm run dev
```

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
