function storeInBrowser (names, details, dataDate) {
    return new Promise((resolve, reject) => {
        console.log('storing data in db');
        // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

        // Open (or create) the database
        var open = indexedDB.open("MyDatabase", 1);

        // Create the schema
        open.onupgradeneeded = function() {
            var db = open.result;
            var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
        };

        open.onsuccess = function() {
            // Start a new transaction
            var db = open.result;
            var tx = db.transaction("MyObjectStore", "readwrite");
            var store = tx.objectStore("MyObjectStore");

            // Add the data
            store.put({
                id: 12345,
                names,
                details,
                dataDate
            });

            let res = store.get(12345);
            res.onsuccess = function () {
                console.log(res.result);
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


function fetchDataFromBrowser () {
    return new Promise ((resolve, reject) => {
        // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

        // Open (or create) the database
        var open = indexedDB.open("MyDatabase", 1);

        open.onsuccess = function() {
            // Start a new transaction
            var db = open.result;
            var tx = db.transaction("MyObjectStore", "readwrite");
            var store = tx.objectStore("MyObjectStore");

            // Close the db when the transaction is done
            tx.oncomplete = function() {
                db.close();
            };
            
            let res = store.get(12345);
            res.onsuccess = function () {
                resolve(res.result);
            }

            res.onerror = function () {
                reject(res.error);
            }
        }
    });
}

module.exports = {storeInBrowser, fetchDataFromBrowser};