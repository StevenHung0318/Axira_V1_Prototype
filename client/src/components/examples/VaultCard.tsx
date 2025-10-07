import VaultCard from '../VaultCard';
import { vaults } from '../../data';

export default function VaultCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-background">
      {vaults.map(vault => (
        <VaultCard 
          key={vault.id}
          vault={vault}
          onDeposit={(vaultId) => console.log('Deposit clicked for:', vaultId)}
        />
      ))}
    </div>
  );
}