import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setDataSource as setDataServiceSource } from '@/services/dataService';

interface DataSourceStore {
  useMockData: boolean;
  toggleDataSource: (useMock: boolean) => void;
}

export const useDataSourceStore = create<DataSourceStore>()(
  persist(
    (set) => ({
      useMockData: true,

      toggleDataSource: (useMock: boolean) => {
        set({ useMockData: useMock });
        setDataServiceSource(useMock);
      }
    }),
    {
      name: 'useMockData', // Key in localStorage (matching the existing key)
      partialize: (state) => ({ useMockData: state.useMockData })
    }
  )
);
