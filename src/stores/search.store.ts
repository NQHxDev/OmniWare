import { create } from 'zustand';

interface SearchState {
   query: string;
   debouncedQuery: string;
   setQuery: (query: string) => void;
   clearQuery: () => void;
}

let debounceTimer: NodeJS.Timeout | null = null;

export const useSearchStore = create<SearchState>((set) => ({
   query: '',
   debouncedQuery: '',
   setQuery: (query) => {
      set({ query });
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
         set({ debouncedQuery: query });
      }, 300);
   },
   clearQuery: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      set({ query: '', debouncedQuery: '' });
   },
}));
