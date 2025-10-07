import type { RewardToken } from '@shared/schema';

interface TokenIconProps {
  token: RewardToken;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tokenConfig = {
  BTC: {
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    name: 'Bitcoin'
  },
  SUI: {
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png',
    name: 'Sui'
  },
  ETH: {
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    name: 'Ethereum'
  },
  USDC: {
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    name: 'USD Coin'
  }
};

const sizeConfig = {
  sm: 'w-4 h-4 text-xs',
  md: 'w-6 h-6 text-sm',
  lg: 'w-8 h-8 text-base'
};

export default function TokenIcon({ token, size = 'md', className = '' }: TokenIconProps) {
  const config = tokenConfig[token];
  const sizeClass = sizeConfig[size];

  return (
    <img 
      src={config.image}
      alt={config.name}
      className={`${sizeClass} ${className} rounded-full`}
      title={config.name}
      data-testid={`icon-token-${token.toLowerCase()}`}
    />
  );
}
