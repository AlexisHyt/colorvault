'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900/80 backdrop-blur-md">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            ColorVault
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/palettes" className="text-slate-300 hover:text-white transition">
              Palettes
            </Link>
            <Link href="/websites" className="text-slate-300 hover:text-white transition">
              Website Colors
            </Link>
            <Link href="/gradients" className="text-slate-300 hover:text-white transition">
              Gradients
            </Link>
            {session?.user && (
              <Link href="/favorites" className="text-slate-300 hover:text-white transition">
                Favorites
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              {session.user.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
                    Admin
                  </Button>
                </Link>
              )}
              <span className="text-sm text-slate-400">{session.user.email}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="border-slate-600 text-slate-300 hover:text-white"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
