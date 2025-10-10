import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
        mutations: {
            onError: (error) => {
                const message = error instanceof Error ? error.message : 'An unexpected error occurred';
                toast.error(message);
            },
        },
    },
});

