import { Heart } from 'lucide-react';
import { getFavoritesWithDetails } from '@/lib/actions/favorites';
import { getSavedPalettes } from '@/lib/actions/saved-palettes';
import { getVerifiedSession } from '@/lib/auth-utils';
import { FavoritesClient } from '@/components/favorites-client';

export default async function FavoritesPage() {
  const session = await getVerifiedSession();

  if (!session?.user) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-white mb-4">Sign In to View Favorites</h1>
          <p className="text-slate-400 mb-8">
            You need to be signed in with a verified email to view your favorites.
          </p>
        </div>
      </main>
    );
  }

  const [items, savedPalettes] = await Promise.all([
    getFavoritesWithDetails(session.user.id),
    getSavedPalettes(session.user.id),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
          <Heart className="fill-red-600 text-red-600" />
          Favorites
        </h1>
        <p className="text-slate-400">Your saved colors and gradients</p>
      </div>

      <FavoritesClient items={items} savedPalettes={savedPalettes} />
    </main>
  );
}
