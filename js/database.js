const DB_NAME = "MariaCateringDB";
const DB_VERSION = 2;

const STORES = {
    MENUS: "menus",
    BILLS: "bills",
    SETTINGS: "settings",
    CATEGORY_SUGGESTIONS: "categorySuggestions"
};

let db = null;

// Open Database
function openDatabase() {

    return new Promise((resolve, reject) => {

        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {

            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORES.MENUS)) {

                database.createObjectStore(
                    STORES.MENUS,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

            }

            if (!database.objectStoreNames.contains(STORES.BILLS)) {

                database.createObjectStore(
                    STORES.BILLS,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

            }
            if (!database.objectStoreNames.contains(STORES.SETTINGS)) {

                database.createObjectStore(
                    STORES.SETTINGS,
                    {
                        keyPath: "key"
                    }
                );

            }

            if (!database.objectStoreNames.contains(STORES.CATEGORY_SUGGESTIONS)) {

                database.createObjectStore(
                    STORES.CATEGORY_SUGGESTIONS,
                    {
                        keyPath: "category",
                    }
                );

            }

        };

    });

}

// Add
async function addData(storeName, data) {

    const database = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = database.transaction(storeName, "readwrite");

        const store = transaction.objectStore(storeName);

        const request = store.add(data);

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });

}

// Update
async function updateData(storeName, data) {

    const database = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = database.transaction(storeName, "readwrite");

        const store = transaction.objectStore(storeName);

        const request = store.put(data);

        request.onsuccess = () => resolve(true);

        request.onerror = () => reject(request.error);

    });

}

// Get One
async function getData(storeName, id) {

    const database = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = database.transaction(storeName, "readonly");

        const store = transaction.objectStore(storeName);

        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });

}

// Get All
async function getAllData(storeName) {

    const database = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = database.transaction(storeName, "readonly");

        const store = transaction.objectStore(storeName);

        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });

}

// Delete
async function deleteData(storeName, id) {

    const database = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = database.transaction(storeName, "readwrite");

        const store = transaction.objectStore(storeName);

        const request = store.delete(id);

        request.onsuccess = () => resolve();

        request.onerror = () => reject(request.error);

    });

}

// Clear Store
async function clearStore(storeName) {

    const database = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = database.transaction(storeName, "readwrite");

        const store = transaction.objectStore(storeName);

        const request = store.clear();

        request.onsuccess = () => resolve();

        request.onerror = () => reject(request.error);

    });

}

// Save category suggestions
async function saveCategorySuggestions(category, items){

    category = category.trim();

    if(!category || items.length === 0) return;

    let record = await getData(STORES.CATEGORY_SUGGESTIONS, category);

    if(!record){

        record = {
            category,
            items:[]
        };

    }

    items.forEach(item=>{

        item = item.trim();

        if(item && !record.items.includes(item)){

            record.items.push(item);

        }

    });

    await updateData(STORES.CATEGORY_SUGGESTIONS, record);

}

async function getCategorySuggestions(category){

    category = category.trim();

    const defaults = DEFAULT_SUGGESTIONS[category] || [];

    const record = await getData(
        STORES.CATEGORY_SUGGESTIONS,
        category
    );

    const learned = record ? record.items : [];

    return [...new Set([...defaults, ...learned])];

}
