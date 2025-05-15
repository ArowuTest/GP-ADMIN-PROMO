import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// Define proper types for PrizeStructure and PrizeTier based on backend models
export interface PrizeTierData {
  id?: string;
  name: string;
  prizeType: string; // e.g., "Cash", "Airtime"
  valueNGN: number;
  winnerCount: number;
  order: number;
}

export interface PrizeStructureData {
  id?: string;
  name: string;
  description: string;
  isActive: boolean;
  validFrom: string; // ISO Date string
  validTo?: string | null; // ISO Date string or null
  prizeTiers: PrizeTierData[];
  createdAt?: string;
  updatedAt?: string;
}

const getAuthHeaders = (token: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all prize structures
const listPrizeStructures = async (token: string | null): Promise<PrizeStructureData[]> => {
  try {
    const response = await axios.get<PrizeStructureData[]>(`${API_URL}/admin/prize-structures/`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching prize structures:", error);
    
    // Only use mock data as absolute last resort if API is completely unreachable
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.warn("API unreachable, using minimal mock data as fallback");
      return [{
        id: "ps-001",
        name: "Daily Draw Week 1 (Active)",
        description: "Prize structure for daily draws in week 1",
        isActive: true,
        validFrom: "2025-01-01T00:00:00Z",
        validTo: "2025-12-31T23:59:59Z",
        prizeTiers: [
          {
            id: "pt-001",
            name: "Jackpot",
            prizeType: "Cash",
            valueNGN: 1000000,
            winnerCount: 1,
            order: 1
          },
          {
            id: "pt-002",
            name: "Consolation",
            prizeType: "Airtime",
            valueNGN: 10000,
            winnerCount: 5,
            order: 2
          }
        ],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      }];
    }
    
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to fetch prize structures due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to fetch prize structures due to an unexpected error.");
    } else {
      throw new Error("Failed to fetch prize structures due to an unexpected error.");
    }
  }
};

// Create a new prize structure
const createPrizeStructure = async (data: Omit<PrizeStructureData, "id" | "createdAt" | "updatedAt">, token: string | null): Promise<PrizeStructureData> => {
  try {
    const response = await axios.post<PrizeStructureData>(`${API_URL}/admin/prize-structures/`, data, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to create prize structure due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to create prize structure due to an unexpected error.");
    } else {
      throw new Error("Failed to create prize structure due to an unexpected error.");
    }
  }
};

// Get a single prize structure by ID
const getPrizeStructure = async (id: string, token: string | null): Promise<PrizeStructureData> => {
  try {
    const response = await axios.get<PrizeStructureData>(`${API_URL}/admin/prize-structures/${id}/`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to fetch prize structure due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to fetch prize structure due to an unexpected error.");
    } else {
      throw new Error("Failed to fetch prize structure due to an unexpected error.");
    }
  }
};

// Update a prize structure
const updatePrizeStructure = async (id: string, data: Partial<Omit<PrizeStructureData, "id" | "createdAt" | "updatedAt" | "prizeTiers">>, token: string | null): Promise<PrizeStructureData> => {
  // Note: Backend currently doesn"t support updating tiers via this endpoint directly.
  try {
    const response = await axios.put<PrizeStructureData>(`${API_URL}/admin/prize-structures/${id}/`, data, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to update prize structure due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to update prize structure due to an unexpected error.");
    } else {
      throw new Error("Failed to update prize structure due to an unexpected error.");
    }
  }
};

// Activate/Deactivate a prize structure
const activatePrizeStructure = async (id: string, isActive: boolean, token: string | null): Promise<PrizeStructureData> => {
  try {
    const response = await axios.put<PrizeStructureData>(`${API_URL}/admin/prize-structures/${id}/activate/`, { isActive }, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to update prize structure status due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to update prize structure status due to an unexpected error.");
    } else {
      throw new Error("Failed to update prize structure status due to an unexpected error.");
    }
  }
};

// Delete a prize structure
const deletePrizeStructure = async (id: string, token: string | null): Promise<{ message: string }> => {
  try {
    const response = await axios.delete<{ message: string }>(`${API_URL}/admin/prize-structures/${id}/`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to delete prize structure due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to delete prize structure due to an unexpected error.");
    } else {
      throw new Error("Failed to delete prize structure due to an unexpected error.");
    }
  }
};

export const prizeStructureService = {
  listPrizeStructures,
  createPrizeStructure,
  getPrizeStructure,
  updatePrizeStructure,
  activatePrizeStructure,
  deletePrizeStructure,
};
