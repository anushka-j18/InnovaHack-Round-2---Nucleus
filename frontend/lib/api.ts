/**
 * Nucleus Context Compression Engine API Client
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface QAPair {
  question: string;
  expected_answer?: string;
}

export interface CompressRequest {
  text: string;
  qa_pairs?: QAPair[];
}

export interface CompressResponse {
  compressed_text: string;
  raw_tokens: number;
  compressed_tokens: number;
  compression_ratio: number;
  accuracy_retained?: number | null;
  stage2_provider?: string | null;
  validation_provider?: string | null;
  providerUsed?: string | null;
  cost_saved_usd: number;
  latency_speedup_ratio?: number | null;
  latency_speedup_is_estimated?: boolean | null;
}

export interface HealthResponse {
  status: string;
  python_version: string;
  cuda_available: boolean;
  gpu_device: string;
  pytorch_version: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Perform health check request to backend engine
 */
export async function health(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ApiError(`Health check failed with status ${response.status}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Could not connect to Nucleus backend server. Ensure backend is running at http://localhost:8000.", 503);
  }
}

/**
 * Execute context compression request against backend engine
 */
export async function compress(payload: CompressRequest): Promise<CompressResponse> {
  if (!payload.text || !payload.text.trim()) {
    throw new ApiError("Input context text cannot be empty.", 400);
  }

  if (payload.text.length > 50000) {
    throw new ApiError("Input text exceeds maximum allowed size of 50,000 characters.", 422);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/compress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorDetail = "Compression failed.";
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          if (typeof errorJson.detail === "string") {
            errorDetail = errorJson.detail;
          } else if (Array.isArray(errorJson.detail)) {
            errorDetail = errorJson.detail.map((err: { msg?: string }) => err.msg || JSON.stringify(err)).join(", ");
          }
        }
      } catch {
        errorDetail = `HTTP ${response.status} ${response.statusText}`;
      }

      if (response.status === 429) {
        throw new ApiError("Rate limit exceeded (30 requests/min). Please wait a moment before retrying.", 429);
      }
      if (response.status === 422) {
        throw new ApiError(`Validation Error: ${errorDetail}`, 422);
      }

      throw new ApiError(errorDetail, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network Error: Failed to communicate with Nucleus backend engine.", 500);
  }
}
