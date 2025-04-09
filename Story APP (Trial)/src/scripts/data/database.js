import { openDB } from 'idb';
 
const DATABASE_NAME = 'Story APP';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-stories';
const CACHE_NAME = 'cache-stories';
 
const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id',
    });
    database.createObjectStore(CACHE_NAME, {
      keyPath: 'id',
    });
  },
});

const Database = {
    async putStories(story) {
      if (!Object.hasOwn(story, 'id')) {
        throw new Error('`id` is required to save.');
      }
      return (await dbPromise).put(OBJECT_STORE_NAME, story);
    },
    async getStoriesDetail(id) {
        if (!id) {
          throw new Error('`id` is required.');
        }
        return (await dbPromise).get(OBJECT_STORE_NAME, id);
    },
    async getAllStories() {
        return (await dbPromise).getAll(OBJECT_STORE_NAME);
    },
    async removeStories(id) {
        return (await dbPromise).delete(OBJECT_STORE_NAME, id);
    },
    async putcacheStories(story) {
      if (!Object.hasOwn(story, 'id')) {
        throw new Error('`id` is required to save.');
      }
      return (await dbPromise).put(CACHE_NAME, story);
    },
    async getcacheStoriesDetail(id) {
        if (!id) {
          throw new Error('`id` is required.');
        }
        return (await dbPromise).get(CACHE_NAME, id);
    },
    async getAllcacheStories() {
        return (await dbPromise).getAll(CACHE_NAME);
    },
    async removecacheStories(id) {
        return (await dbPromise).delete(CACHE_NAME, id);
    },
};
export default Database;