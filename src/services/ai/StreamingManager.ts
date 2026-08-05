export class StreamingManager {
  private currentAbortController: AbortController | null = null;
  private isStreaming = false;

  startStream(): AbortSignal {
    this.stopStream();
    this.currentAbortController = new AbortController();
    this.isStreaming = true;
    return this.currentAbortController.signal;
  }

  stopStream(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
    this.isStreaming = false;
  }

  getIsStreaming(): boolean {
    return this.isStreaming;
  }

  finishStream(): void {
    this.currentAbortController = null;
    this.isStreaming = false;
  }
}
