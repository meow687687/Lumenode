import '@testing-library/jest-dom';

// Polyfill/mock localStorage for Node environment if missing or incomplete
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

const mockStorage = new LocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true,
});
Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true,
});
