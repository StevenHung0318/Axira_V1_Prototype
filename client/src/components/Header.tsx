import { Button } from "@/components/ui/button";

interface HeaderProps {
  isConnected: boolean;
  walletAddress?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Header({
  isConnected,
  walletAddress,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center ml-4">
            <img
              src="/assets/Keltra.png"
              alt="Keltra"
              className="h-10 w-auto scale-150"
              data-testid="img-logo"
            />
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center gap-1 md:gap-2">
                <span
                  className="text-xs md:text-sm text-white hidden sm:block"
                  data-testid="text-wallet-address"
                >
                  {walletAddress}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDisconnect}
                  data-testid="button-disconnect"
                  className="text-white text-xs md:text-sm"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={onConnect}
                data-testid="button-connect"
                size="sm"
                className="text-xs md:text-sm"
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
