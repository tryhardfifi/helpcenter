import { createContext, useContext, useState, ReactNode } from "react";
import { setDataSource as setDataServiceSource, getDataSource } from "../services/dataService";

interface DataSourceContextType {
  useMockData: boolean;
  toggleDataSource: (useMock: boolean) => void;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

export const useDataSource = (): DataSourceContextType => {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error("useDataSource must be used within a DataSourceProvider");
  }
  return context;
};

interface DataSourceProviderProps {
  children: ReactNode;
}

export const DataSourceProvider = ({ children }: DataSourceProviderProps) => {
  const [useMockData, setUseMockData] = useState<boolean>(() => getDataSource());

  const toggleDataSource = (useMock: boolean): void => {
    setUseMockData(useMock);
    setDataServiceSource(useMock);
  };

  return (
    <DataSourceContext.Provider value={{ useMockData, toggleDataSource }}>
      {children}
    </DataSourceContext.Provider>
  );
};
