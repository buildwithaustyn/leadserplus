interface Query {
  searchQuery: string;
  location: string;
}

interface BatchProcessorOptions {
  rateLimit: number; // Queries per minute
  maxConcurrent: number; // Maximum concurrent requests
  onProgress: (status: {
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
    currentQuery?: string;
  }) => void;
}

export class BatchProcessor {
  private queue: Query[] = [];
  private processing: Set<string> = new Set();
  private completed: Set<string> = new Set();
  private failed: Set<string> = new Set();
  private options: BatchProcessorOptions;
  private isRunning = false;
  private lastRequestTime = 0;

  constructor(options: BatchProcessorOptions) {
    this.options = options;
  }

  addQueries(queries: Query[]) {
    this.queue.push(...queries);
    this.updateProgress();
  }

  private updateProgress() {
    this.options.onProgress({
      total: this.queue.length + this.processing.size + this.completed.size + this.failed.size,
      completed: this.completed.size,
      failed: this.failed.size,
      inProgress: this.processing.size,
      currentQuery: this.queue[0]?.searchQuery
    });
  }

  async processQuery(query: Query): Promise<any> {
    const queryKey = `${query.searchQuery}-${query.location}`;
    
    try {
      // Implement rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const minInterval = (60 * 1000) / this.options.rateLimit; // Convert rate limit to milliseconds
      
      if (timeSinceLastRequest < minInterval) {
        await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
      }
      
      this.lastRequestTime = Date.now();
      this.processing.add(queryKey);
      this.updateProgress();

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      this.processing.delete(queryKey);
      this.completed.add(queryKey);
      this.updateProgress();
      
      return data;
    } catch (error) {
      this.processing.delete(queryKey);
      this.failed.add(queryKey);
      this.updateProgress();
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    while (this.queue.length > 0 && this.isRunning) {
      if (this.processing.size >= this.options.maxConcurrent) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      const batch = this.queue.splice(0, 
        Math.min(
          this.options.maxConcurrent - this.processing.size,
          this.queue.length
        )
      );

      await Promise.all(
        batch.map(query => this.processQuery(query))
      );
    }

    this.isRunning = false;
  }

  stop() {
    this.isRunning = false;
  }

  clear() {
    this.queue = [];
    this.processing.clear();
    this.completed.clear();
    this.failed.clear();
    this.updateProgress();
  }
}
