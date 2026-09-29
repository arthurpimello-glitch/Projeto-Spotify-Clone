import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

async function carregarMusicas() {
    const musicasRef = collection(db, "songs");

    const snapshot = await getDocs(musicasRef);

    snapshot.forEach((documento) => {
        console.log(documento.id);
        console.log(documento.data());
    });
}

carregarMusicas();