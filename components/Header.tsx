'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const Header = () => {
  const pathname = usePathname();

  return (
    <header>
      <div className="main-container inner flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.svg" alt="CoinPulse logo" width={132} height={40} />
        </Link>

        <nav className='flex items-center gap-6'>
          <Link
            href="/"
            className={cn('nav-link', {
              'is-active': pathname === '/',
              'is-home': true,
            })}
          >
            Home
          </Link>

          <p>Search Modal</p>

          <Link
            href="/coins"
            className={cn('nav-link', {
              'is-active': pathname === '/coins',
            })}
          >
            All Coins
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;