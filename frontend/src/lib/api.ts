export interface CompressionResult {
  compressed_text: string;
  raw_tokens: number;
  compressed_tokens: number;
  compression_ratio: number;
  accuracy_retained?: number;
  stage2_provider?: string;
  validation_provider?: string;
  providerUsed?: string;
  cost_saved_usd: number;
  latency_speedup_ratio?: number;
  latency_speedup_is_estimated?: boolean;
}

export async function compressContext(text: string, qaPairs: { question: string; expected_answer?: string }[]): Promise<CompressionResult> {
  const payload: Record<string, unknown> = { text };
  if (qaPairs && qaPairs.length > 0) {
    payload.qa_pairs = qaPairs;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const response = await fetch(`${apiUrl}/compress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API error: ${response.status}`);
  }

  return response.json();
}
