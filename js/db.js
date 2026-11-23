/* Infinity Memory — armazenamento local (IndexedDB) */
const DB = (() => {
  let dbp;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open('infinity-memory', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore('decks', { keyPath: 'id' });
        const cards = db.createObjectStore('cards', { keyPath: 'id' });
        cards.createIndex('deckId', 'deckId');
        const logs = db.createObjectStore('logs', { keyPath: 'id' });
        logs.createIndex('ts', 'ts');
        db.createObjectStore('media', { keyPath: 'id' });
        db.createObjectStore('meta', { keyPath: 'key' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbp;
  }
  async function run(store, mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode);
      const st = tx.objectStore(store);
      let out;
      const r = fn(st);
      if (r) r.onsuccess = () => { out = r.result; };
      tx.oncomplete = () => resolve(out);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
  return {
    all: (s) => run(s, 'readonly', (st) => st.getAll()),
    get: (s, k) => run(s, 'readonly', (st) => st.get(k)),
    put: (s, v) => run(s, 'readwrite', (st) => st.put(v)),
    del: (s, k) => run(s, 'readwrite', (st) => st.delete(k)),
    clear: (s) => run(s, 'readwrite', (st) => st.clear()),
    async putMany(s, list) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(s, 'readwrite');
        const st = tx.objectStore(s);
        list.forEach((v) => st.put(v));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
    async delMany(s, keys) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(s, 'readwrite');
        const st = tx.objectStore(s);
        keys.forEach((k) => st.delete(k));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
    async getMeta(key, fallback) { const r = await this.get('meta', key); return r ? r.value : fallback; },
    setMeta(key, value) { return this.put('meta', { key, value }); },
  };
})();
