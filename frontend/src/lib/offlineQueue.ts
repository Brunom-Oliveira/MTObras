import { v4 as uuidv4 } from 'uuid';

export interface OfflineRequest {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body: any;
  createdAt: string;
  type: string;
  description: string;
}

const QUEUE_KEY = '@WMS:offlineQueue';

export const offlineQueue = {
  getQueue: (): OfflineRequest[] => {
    try {
      const q = localStorage.getItem(QUEUE_KEY);
      return q ? JSON.parse(q) : [];
    } catch (e) {
      console.error('Erro ao ler fila offline', e);
      return [];
    }
  },

  enqueue: (request: Omit<OfflineRequest, 'id' | 'createdAt'>) => {
    const queue = offlineQueue.getQueue();
    const newReq: OfflineRequest = {
      ...request,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    queue.push(newReq);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    
    // Dispara evento global para a UI (MainLayout) se atualizar instantaneamente
    window.dispatchEvent(new Event('offline-queue-updated'));
    return newReq;
  },

  remove: (id: string) => {
    const queue = offlineQueue.getQueue();
    const filtered = queue.filter(req => req.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('offline-queue-updated'));
  },

  clear: () => {
    localStorage.removeItem(QUEUE_KEY);
    window.dispatchEvent(new Event('offline-queue-updated'));
  }
};
