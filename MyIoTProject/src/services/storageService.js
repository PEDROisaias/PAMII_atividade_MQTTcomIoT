import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = 'mqtt_messages';
const MAX_ITEMS = 1000;

const isWeb = Platform?.OS === 'web';

const storageBackend = {
  async getItem(key) {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      return Promise.resolve(window.localStorage.getItem(key));
    }
    return AsyncStorageLib.getItem(key);
  },
  async setItem(key, value) {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return AsyncStorageLib.setItem(key, value);
  },
  async removeItem(key) {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return Promise.resolve();
    }
    return AsyncStorageLib.removeItem(key);
  },
};

const storageService = {
  async saveMessage(topic, payload) {
    try {
      const item = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        topic,
        payload,
        timestamp: Date.now(),
      };

      const raw = await storageBackend.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push(item);
      if (list.length > MAX_ITEMS) list.splice(0, list.length - MAX_ITEMS);
      await storageBackend.setItem(STORAGE_KEY, JSON.stringify(list));
      return item;
    } catch (e) {
      console.warn('storageService.saveMessage error', e);
      throw e;
    }
  },

  async getMessages() {
    try {
      const raw = await storageBackend.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('storageService.getMessages error', e);
      return [];
    }
  },

  async getMessagesByTopic(topic) {
    try {
      const all = await this.getMessages();
      return all.filter((m) => m.topic === topic);
    } catch (e) {
      console.warn('storageService.getMessagesByTopic error', e);
      return [];
    }
  },

  async clearMessages() {
    try {
      await storageBackend.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('storageService.clearMessages error', e);
      throw e;
    }
  },
};

export default storageService;
