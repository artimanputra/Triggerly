export interface Zap {
  id: string;
  triggerId: string;
  userId: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  actions: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    metadata: Record<string, unknown>;   // <-- add this
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    metadata: Record<string, unknown>;   // <-- add this
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
}
