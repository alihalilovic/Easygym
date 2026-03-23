import { QueryClient } from '@tanstack/react-query';
import { notifyError } from '@/lib/utils';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
        mutations: {
            onError: (error) => {
                notifyError(error);
            },
        },
    },
});

