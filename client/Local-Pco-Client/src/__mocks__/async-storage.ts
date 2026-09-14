// src/__mocks__/async-storage.ts
const store: Record<string, string> = {};

export default {
    getItem: jest.fn((key: string) => Promise.resolve(store[key] || null)),
    setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
        delete store[key];
        return Promise.resolve();
    }),
    clear: jest.fn(() => {
        for (const key in store) delete store[key];
        return Promise.resolve();
    }),
};
