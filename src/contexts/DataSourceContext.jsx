import { createContext, useContext, useState, useEffect } from "react";
import { setDataSource as setDataServiceSource, getDataSource } from "../services/dataService";

const DataSourceContext = createContext();

export const useDataSource = () => {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error("useDataSource must be used within a DataSourceProvider");
  }
  return context;
};

export const DataSourceProvider = ({ children }) => {
  const [useMockData, setUseMockData] = useState(() => getDataSource());

  const toggleDataSource = (useMock) => {
    setUseMockData(useMock);
    setDataServiceSource(useMock);
  };

  return (
    <DataSourceContext.Provider value={{ useMockData, toggleDataSource }}>
      {children}
    </DataSourceContext.Provider>
  );
};
