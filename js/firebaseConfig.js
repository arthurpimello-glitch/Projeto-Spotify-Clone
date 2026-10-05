import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDeJnuI9hjyvou1-rtCxe6AJtIfF_6sdWk",
  authDomain: "spotify-clone-e8f6f.firebaseapp.com",
  projectId: "spotify-clone-e8f6f",
  storageBucket: "spotify-clone-e8f6f.firebasestorage.app",
  messagingSenderId: "399664363560",
  appId: "1:399664363560:web:12c56e7bdee6d3a9295d1d"
};

const app = initializeApp(firebaseConfig);

// ========================================
// FIRESTORE COM PERSISTÊNCIA OFFLINE
// ========================================

const db = initializeFirestore(
    app,
    {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
        })
    }
);

// ========================================
// AUTHENTICATION
// ========================================

const auth = getAuth(app);


export { db, auth };