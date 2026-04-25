import { headers } from 'next/headers';
import { Heart } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getFavoritesWithDetails } from '@/lib/actions/favorites';
import { FavoritesClient } from '@/components/favorites-client';

export default async function FavoritesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-white mb-4">Sign In to View Favorites</h1>
          <p className="text-slate-400 mb-8">
            You need to be signed in to view your favorite colors and gradients.
          </p>
        </div>
      </main>
    );
  }

  const items = await getFavoritesWithDetails(session.user.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
          <Heart className="fill-red-600 text-red-600" />
          Favorites
        </h1>
        <p className="text-slate-400">Your saved colors and gradients</p>
      </div>

      <FavoritesClient items={items} />
    </main>
  );
}
