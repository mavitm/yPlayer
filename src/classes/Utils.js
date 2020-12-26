'use strict';

function storageLoadConfig(name, defValue = null, useLog = true, storeBack = false) {
    let str_value = localStorage.getItem(name);
    let value = null;
    let isLoaded = false;
    let isReplaced = false;
    let isDefault;
    if (str_value) {
        isLoaded = true;
        value = JSON.parse(str_value);
    }
    if (value === null || (defValue !== null && value.version !== defValue.version)) {
        if (isLoaded)
            isReplaced = true;
        isLoaded = false;
        isDefault = true;
        if (defValue !== null)
            value = Object.assign({}, defValue);
    } else {
        isDefault = dataEquals(value, defValue);
    }
    if (useLog) {
        //ac_log('Used %s %s', value !== null ? (isDefault ? 'default' : 'custom') : 'null', name);
    }
    if (value !== null && (isReplaced || (storeBack && !isLoaded)))
        localStorage.setItem(name, JSON.stringify(value));
    return value;
}

/**
 * Save JSON object to local storage.
 *
 * Default value is optional.
 * If it's provided and object has default value, it will be removed from local storage.
 */
function storageSaveConfig(name, value, defValue = null) {
    if (defValue === null || !dataEquals(value, defValue)) {
        if (defValue !== null && defValue.version && !value.version)
            value.version = defValue.version;
        localStorage.setItem(name, JSON.stringify(value));
    } else {
        localStorage.removeItem(name);
    }
}

// Objects deep equals
function dataEquals(obj1, obj2) {
    if (obj1 === null || obj2 === null) return obj1 === obj2;
    for (let p in obj1) {
        if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;
        switch (typeof (obj1[p])) {
            case 'object':
                if (!dataEquals(obj1[p], obj2[p])) return false;
                break;
            case 'function': // No compare functions.
                break;
            default:
                if (obj1[p] != obj2[p]) return false;
        }
    }
    for (let p in obj2) {
        if (typeof (obj1[p]) == 'undefined') return false;
    }
    return true;
}

/**
 * Database with single store and with copy of the store in memory - objects list
 * Purpose: make the list persistent.
 * Key is part of record, based on current time, unique and has name 'id'
 * Number of objects in store is limited, oldest objects will be deleted.
 * If needed, additional stores can be added: override open(),
 * and use get(), put(), clear(), delete() methods with store name.
 */
class AbstractDb {
    constructor(dbName, storeName, maxSize) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.maxSize = maxSize; // max number of objects
        this.db = null;
        this.list = []; // default store copy in memory.
        this.idSeqNumber = -1; // to generate unique key.
    }

    // Create store unique key. (no more than 1 million in the same millisecond)
    // key must be part or record and have name 'id'
    createId(time) {
        this.idSeqNumber = (this.idSeqNumber + 1) % 1000000; // range 0..999999
        return time.toString() + '-' + ('00000' + this.idSeqNumber.toString()).slice(-6);
    }

    // Open the database, if needed create it.
    open() {
        return new Promise((resolve, reject) => {
            let r = indexedDB.open(this.dbName);
            r.onupgradeneeded = (e) => {
                e.target.result.createObjectStore(this.storeName, { keyPath: 'id' });
            };
            r.onsuccess = () => {
                this.db = r.result;
                resolve();
            };
            r.onerror = r.onblocked = () => { reject(r.error); };
        });
    }

    // load records to memory, ordered by time, if needed delete oldest records
    load() {
        return new Promise((resolve, reject) => {
            if (this.db === null) { reject('db is null'); return; }
            let trn = this.db.transaction(this.storeName, 'readwrite');
            trn.onerror = () => { reject(trn.error); }
            let store = trn.objectStore(this.storeName)
            let onsuccess = (list) => {
                this.list = list;
                let nDel = this.list.length - this.maxSize;
                if (nDel <= 0) {
                    resolve();
                } else {
                    let r = store.delete(IDBKeyRange.upperBound(this.list[nDel - 1].id));
                    r.onerror = () => { reject(r.error); }
                    r.onsuccess = () => {
                        this.list = this.list.splice(-maxSize);
                        resolve();
                    }
                }
            };
            let onerror = (e) => { reject(e); }
            let getAll = store.getAll ? this._getAllBuiltIn : this._getAllCursor;
            getAll(store, onsuccess, onerror);
        });
    }

    _getAllBuiltIn(store, onsuccess, onerror) { // Chrome, Firefox
        let r = store.getAll();
        r.onerror = () => onerror(r.error);
        r.onsuccess = () => onsuccess(r.result);
    }

    _getAllCursor(store, onsuccess, onerror) { // Edge
        let list = [];
        let r = store.openCursor();
        r.onerror = () => onerror(r.error);
        r.onsuccess = (e) => {
            let cursor = e.target.result;
            if (cursor) {
                list.push(cursor.value);
                cursor.continue();
            } else {
                onsuccess(list);
            }
        };
    }

    // Add new record. If needed delete oldest records
    add(record) {
        return new Promise((resolve, reject) => {
            if (this.db === null) { reject('db is null'); return; }
            let trn = this.db.transaction(this.storeName, 'readwrite');
            trn.onerror = () => { reject(trn.error); }
            let store = trn.objectStore(this.storeName)
            let r = store.add(record);
            r.onerror = () => { reject(r.error); }
            r.onsuccess = () => {
                this.list.push(record);
                let nDel = this.list.length - this.maxSize;
                if (nDel <= 0) {
                    resolve();
                } else {
                    r = store.delete(IDBKeyRange.upperBound(this.list[nDel - 1].id));
                    r.onerror = () => { reject(r.error); }
                    r.onsuccess = () => {
                        this.list = this.list.splice(-this.maxSize);
                        resolve();
                    }
                }
                window.App.appTriggerEvent('indexedDbAddRow', {data:record, dbName:this.dbName, storeName:this.storeName});
            }
        });
    }

    // Update record with some unique id.
    update(record) {
        let index = this.list.findIndex((r) => r.id === record.id);
        if (index == -1)
            return Promise.reject('Record is not found');
        this.list[index] = record;
        window.App.appTriggerEvent('indexedDbUpdateRow', {data:record, index, dbName:this.dbName, storeName:this.storeName});
        return this._exec('put', this.storeName, record);
    }

    // Delete record with the key (if store is default delete also from list)
    delete(id, storeName = this.storeName) {
        if (storeName === this.storeName) {
            let index = this.list.findIndex((r) => r.id === id);
            if (index === -1){
                return Promise.reject('Record is not found');
            }
            this.list.splice(index, 1);
        }
        return this._exec('delete', storeName, id);
    }

    // Clear all store records
    clear(storeName = this.storeName) {
        this.list = [];
        window.App.appTriggerEvent('indexedDbClear', {dbName:this.dbName, storeName:this.storeName});
        return this._exec('clear', storeName);
    }

    get(key, storeName) {
        return this._exec('get', storeName, key);
    }

    put(record, storeName) {
        return this._exec('put', storeName, record);
    }

    // Single transaction operation.
    _exec(op, storeName, data) {
        return new Promise((resolve, reject) => {
            if (this.db === null) { reject('db is null'); return; }
            let trn = this.db.transaction(storeName, 'readwrite');
            trn.onerror = () => { reject(trn.error); };
            let store = trn.objectStore(storeName);
            let r;
            switch (op) {
                case 'clear':
                    r = store.clear();
                    break;
                case 'delete':
                    r = store.delete(data);
                    break;
                case 'put':
                    r = store.put(data);
                    break;
                case 'get':
                    r = store.get(data);
                    break;
                default:
                    reject('db: wrong request');
                    return;
            }
            r.onerror = (e) => { console.error(e); reject(r.error); }
            r.onsuccess = () => {  resolve(r.result); }
        });
    }
}

class VideoDb extends AbstractDb {
    constructor(maxSize) {
        super('video_db', 'videos', maxSize);
    }
}
class CategoryDb extends AbstractDb {
    constructor(maxSize) {
        super('category_db', 'categories', maxSize);
    }
}

export {AbstractDb, VideoDb, CategoryDb, storageLoadConfig, dataEquals, storageSaveConfig}