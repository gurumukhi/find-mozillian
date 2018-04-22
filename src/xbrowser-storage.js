// constants
const DB_NAME = 'MozilliansDB';
const STORE_NAME = 'MozillianObjectStore';
const OPERATION_READWRITE = 'readwrite';
const INDEX_DB_VERSION = 1;
const MOZILLIAN_OBJECT_ID = 27;

// Store given data in browser
function storeInBrowser (names, details, dataDate) {
    return new Promise((resolve, reject) => {
        // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

        // Open (or create) the database
        var open = indexedDB.open(DB_NAME, INDEX_DB_VERSION);

        // Create the schema
        open.onupgradeneeded = function() {
            var db = open.result;
            var store = db.createObjectStore(STORE_NAME, {keyPath: "id"});
        };

        open.onsuccess = function() {
            // Start a new transaction
            var db = open.result;
            var tx = db.transaction(STORE_NAME, OPERATION_READWRITE);
            var store = tx.objectStore(STORE_NAME);

            // Add the data
            store.put({
                id: MOZILLIAN_OBJECT_ID,
                names,
                details,
                dataDate
            });

            let res = store.get(MOZILLIAN_OBJECT_ID);
            res.onsuccess = function () {
                resolve(res.result);
            }

            // Close the db when the transaction is done
            tx.oncomplete = function() {
                db.close();
            };
        }

        open.onerror = function () {
            reject(open.error);
        }
    });
}

// Fetch stored data from browser
function fetchDataFromBrowser () {
    return new Promise ((resolve, reject) => {

        // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

        // Open (or create) the database
        var open = indexedDB.open(DB_NAME, INDEX_DB_VERSION);

        // Create the schema
        open.onupgradeneeded = function() {
            var db = open.result;
            var store = db.createObjectStore(STORE_NAME, {keyPath: "id"});
        };

        open.onsuccess = function() {
            // Start a new transaction
            var db = open.result;
            var tx;
            try {
                tx = db.transaction(STORE_NAME, OPERATION_READWRITE);
            }
            catch (error) {
                reject(error);
                return;
            }
            var store = tx.objectStore(STORE_NAME);

            let res = store.get(MOZILLIAN_OBJECT_ID);
            res.onsuccess = function () {
                resolve(res.result);
            }

            res.onerror = function () {
                reject(res.error);
            }

            // Close the db when the transaction is done
            tx.oncomplete = function() {
                db.close();
            };
        }

        open.onerror = function () {
            reject(open.error);
        }
    });
}

module.exports = {storeInBrowser, fetchDataFromBrowser};