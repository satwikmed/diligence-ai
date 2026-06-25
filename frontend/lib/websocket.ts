type MessageHandler = (data: Record<string, unknown>) => void;

import { getWsUrl } from '@/lib/api';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private handlers: MessageHandler[] = [];
  private documentId: string;

  constructor(documentId: string) {
    this.documentId = documentId;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const wsUrl = getWsUrl();
    if (!wsUrl) return;

    this.ws = new WebSocket(`${wsUrl}/ws/${this.documentId}`);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlers.forEach((h) => h(data));
      } catch {
        /* ignore */
      }
    };

    this.ws.onclose = () => {
      if (getWsUrl()) {
        setTimeout(() => this.connect(), 3000);
      }
    };
  }

  onMessage(handler: MessageHandler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }

  ping() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send('ping');
    }
  }
}
