export function simulateDelay(ms: number = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function shouldMockFail(probability: number = 0.05): boolean {
  // Configured to fail 5% of the time to show error states (can be modified in demo)
  return Math.random() < probability;
}

export class MockApiError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'MockApiError';
    this.status = status;
  }
}
