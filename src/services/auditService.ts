import { apiClient, getAuthHeaders } from './apiClient';

export interface DataUploadAudit {
  id: string;
  uploadedByUserId: string;
  fileName: string;
  recordCount: number;
  successfullyImported: number;
  duplicatesSkipped: number;
  errorsEncountered: number;
  status: string;
  notes: string;
  operationType: string;
  uploadTimestamp: string; // ISO 8601 date string
}

export interface AuditLogResponse {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  summary: string; // Changed from details to match backend
  details: string;
}

export const getDataUploadAudits = async (token: string): Promise<DataUploadAudit[]> => {
  try {
    const response = await apiClient.get('/admin/reports/data-uploads', {
      headers: getAuthHeaders(token)
    });
    // Handle nested response structure
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching data upload audits:", error);
    throw error;
  }
};

export const getAuditLogs = async (
  page: number = 1, 
  pageSize: number = 10, 
  filters: Record<string, string> = {},
  token: string
): Promise<{ data: AuditLogResponse[], total: number, page: number, pageSize: number }> => {
  try {
    const response = await apiClient.get('/admin/audit-logs', {
      params: {
        page,
        pageSize,
        ...filters
      },
      headers: getAuthHeaders(token)
    });
    // Handle nested response structure with pagination
    const responseData = response.data;
    return {
      data: responseData.data || [],
      total: responseData.pagination?.totalItems || 0,
      page: responseData.pagination?.page || 1,
      pageSize: responseData.pagination?.pageSize || 10
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};

export const auditService = {
  getDataUploadAudits,
  getAuditLogs
};
