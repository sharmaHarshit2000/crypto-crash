const cache = {};

const cacheManager = {
  get: (key) => {
    const item = cache[key];
    if (!item) return null;

    if (Date.now() > item.expiry) {
      delete cache[key];
      return null;
    }
    return item.value;
  },

  set: (key, value, ttl = 10000) => {
    const expiry = Date.now() + ttl;
    cache[key] = { value, expiry };
  },
};

export default cacheManager;
