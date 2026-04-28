import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

interface UseAdminDataResult<T> {
	data: T | null;
	isLoading: boolean;
	reload: () => Promise<void>;
}

/**
 * Hook générique pour charger des données côté admin.
 * Vérifie automatiquement que l'utilisateur est connecté et a le rôle "admin"
 * avant d'appeler le `loader`.
 *
 * @param loader - Fonction async qui retourne la donnée à charger.
 */
export function useAdminData<T>(
	loader: () => Promise<T>,
): UseAdminDataResult<T> {
	const { data: session } = useSession();
	const [data, setData] = useState<T | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const load = useCallback(async () => {
		if (session?.user && session.user.role === "admin") {
			setIsLoading(true);
			try {
				const result = await loader();
				setData(result);
			} finally {
				setIsLoading(false);
			}
		}
	}, [session, loader]);

	useEffect(() => {
		load();
	}, [load]);

	return { data, isLoading, reload: load };
}
