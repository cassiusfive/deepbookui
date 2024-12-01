import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

function App() {
  return (
    <>
      <ConnectButton />
      <ConnectedAccount />
    </>
  );
}

function ConnectedAccount() {
  const account = useCurrentAccount();
  if (!account) {
    return null;
  }

  return <div>Connected to {account.address}</div>;
}

export default App;
