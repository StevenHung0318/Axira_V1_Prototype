import Header from '../Header';

export default function HeaderExample() {
  return (
    <div className="min-h-screen bg-background">
      <Header
        isConnected={true}
        walletAddress="0xKEL...KELTRA"
        onConnect={() => console.log('Connect wallet')}
        onDisconnect={() => console.log('Disconnect wallet')}
      />
      <div className="p-8">
        <p className="text-muted-foreground">Header component example above</p>
      </div>
    </div>
  );
}
