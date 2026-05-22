import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface PdfFile {
  id: string;
  name: string;
  size: string;
  pages: number;
  date: string;
  isFavorite: boolean;
  color: string;
}

interface FilesContextType {
  files: PdfFile[];
  recentFiles: PdfFile[];
  favoriteFiles: PdfFile[];
  addFile: (file: Omit<PdfFile, "id">) => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  toggleFavorite: (id: string) => void;
  refreshFiles: () => void;
}

const FilesContext = createContext<FilesContextType | null>(null);

const STORAGE_KEY = "@pdf_editor_files";

const SAMPLE_FILES: PdfFile[] = [
  {
    id: "1",
    name: "Annual_Report_2024.pdf",
    size: "1.2 MB",
    pages: 11,
    date: "04/25 21:06",
    isFavorite: false,
    color: "#E53935",
  },
  {
    id: "2",
    name: "Project_Proposal_Final.pdf",
    size: "608 KB",
    pages: 6,
    date: "04/25 09:15",
    isFavorite: true,
    color: "#1565C0",
  },
  {
    id: "3",
    name: "Design_Guidelines.pdf",
    size: "180 KB",
    pages: 18,
    date: "04/12 19:21",
    isFavorite: false,
    color: "#283593",
  },
  {
    id: "4",
    name: "Meeting_Notes_Q1.pdf",
    size: "265 KB",
    pages: 31,
    date: "04/11 20:35",
    isFavorite: false,
    color: "#2E7D32",
  },
  {
    id: "5",
    name: "Invoice_March_2024.pdf",
    size: "192 KB",
    pages: 15,
    date: "04/08 20:41",
    isFavorite: true,
    color: "#F57C00",
  },
  {
    id: "6",
    name: "Contract_Agreement.pdf",
    size: "344 KB",
    pages: 17,
    date: "04/07 14:22",
    isFavorite: false,
    color: "#6A1B9A",
  },
  {
    id: "7",
    name: "Research_Paper.pdf",
    size: "2.1 MB",
    pages: 42,
    date: "04/01 10:05",
    isFavorite: false,
    color: "#00796B",
  },
];

export function FilesProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<PdfFile[]>([]);

  const loadFiles = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFiles(JSON.parse(stored));
      } else {
        setFiles(SAMPLE_FILES);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_FILES));
      }
    } catch {
      setFiles(SAMPLE_FILES);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const saveFiles = async (updated: PdfFile[]) => {
    setFiles(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const addFile = (file: Omit<PdfFile, "id">) => {
    const newFile: PdfFile = {
      ...file,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updated = [newFile, ...files];
    saveFiles(updated);
  };

  const deleteFile = (id: string) => {
    saveFiles(files.filter((f) => f.id !== id));
  };

  const renameFile = (id: string, name: string) => {
    saveFiles(files.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const toggleFavorite = (id: string) => {
    saveFiles(
      files.map((f) => (f.id === id ? { ...f, isFavorite: !f.isFavorite } : f))
    );
  };

  const recentFiles = files.slice(0, 5);
  const favoriteFiles = files.filter((f) => f.isFavorite);

  return (
    <FilesContext.Provider
      value={{
        files,
        recentFiles,
        favoriteFiles,
        addFile,
        deleteFile,
        renameFile,
        toggleFavorite,
        refreshFiles: loadFiles,
      }}
    >
      {children}
    </FilesContext.Provider>
  );
}

export function useFiles() {
  const ctx = useContext(FilesContext);
  if (!ctx) throw new Error("useFiles must be used within FilesProvider");
  return ctx;
}
