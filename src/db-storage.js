
export function storeInDB (names, details) {
    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    // Open (or create) the database
    var open = indexedDB.open("MyDatabase", 1);

    // Create the schema
    open.onupgradeneeded = function() {
        var db = open.result;
        var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
        var index = store.createIndex("NameIndex", {});
        console.log('onupgradeneeded done');
    };

    open.onsuccess = function() {
        // Start a new transaction
        var db = open.result;
        var tx = db.transaction("MyObjectStore", "readwrite");
        var store = tx.objectStore("MyObjectStore");
        var index = store.index("NameIndex");

        // // Add some data
        // store.put({
        //     id: 12345,
        //     names: ['ram', 'not ram'],
        //     details: [{
        //         name: 'ram2',
        //         mail: 'vaishnav.rd@gmail.com2',
        //         citation: 'good bwoy2'
        //         }, {
        //         name: 'ram',
        //         mail: 'vaishnav.rd@gmail.com',
        //         citation: 'good bwoy'
        //         }]
        // });


        // Add some data
        store.put({
            id: 12345,
            names,
            details
        });

        // Close the db when the transaction is done
        tx.oncomplete = function() {
            db.close();
        };
        console.log('onsuccess done');
    }
}


export function fetchFromDB () {
    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    // Open (or create) the database
    var open = indexedDB.open("MyDatabase", 1);

    open.onsuccess = function() {
        // Start a new transaction
        var db = open.result;
        var tx = db.transaction("MyObjectStore", "readwrite");
        var store = tx.objectStore("MyObjectStore");
        var index = store.index("NameIndex");

        // Close the db when the transaction is done
        tx.oncomplete = function() {
            db.close();
        };
        return store.get(12345).onsuccess;
    }
}