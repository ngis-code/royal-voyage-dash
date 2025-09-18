import { toast } from "@/hooks/use-toast";

export interface ApiError {
  errorCode: number;
  userMessage: string;
  internalMessage: string;
  moreInfo?: string;
  validationErrors: any[];
}

export interface ApiErrorResponse {
  status: number;
  payload: null;
  errors: ApiError[];
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = `Request failed: ${response.statusText}`;

  try {
    const errorData: ApiErrorResponse = await response.json();
    
    if (response.status === 403) {
      // Handle permission errors specifically
      const permissionMessage = errorData.errors?.[0]?.userMessage || "You do not have permission to use this module";
      
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: permissionMessage,
      });
      
      throw new PermissionError(permissionMessage);
    }
    
    // Handle other error types
    if (errorData.errors && errorData.errors.length > 0) {
      errorMessage = errorData.errors[0].userMessage || errorData.errors[0].internalMessage || errorMessage;
    }
    
    // Show toast for non-permission errors
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
    
  } catch (parseError) {
    // If we can't parse the error response, show a generic error
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
  }

  throw new Error(errorMessage);
};