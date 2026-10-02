import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { auth , db } from "./firebaseConfig.js";


// ========================================
// ELEMENTOS DO HTML
// ========================================

const listaMusicas = document.getElementById("lista-musicas");

const campoPesquisa = document.getElementById("campo-pesquisa");

const audioPlayer = document.getElementById("audio-player");

const musicaAtualTitulo = document.getElementById("musica-atual-titulo");

const btnLogout = document.getElementById("btn-logout");

// ========================================
// VARIÁVEIS
// ========================================

let musicas = [];


// ========================================
// REFERÊNCIA PARA A COLLECTION
// ========================================

const musicasRef = collection(db, "songs");


// ========================================
// CARREGAR MÚSICAS
// ========================================

async function carregarMusicas() {

    try {

        const snapshot = await getDocs(musicasRef);

        musicas = [];

        snapshot.forEach((documento) => {

            const musica = documento.data();

            musicas.push({
                id: documento.id,
                ...musica
            });

        });

        renderizarMusicas(musicas);

    } catch (erro) {

        console.error("Erro ao carregar músicas:", erro);

        listaMusicas.innerHTML = `
            <p>Não foi possível carregar as músicas.</p>
        `;

    }

}


// ========================================
// MOSTRAR MÚSICAS NA TELA
// ========================================

function renderizarMusicas(lista) {

    listaMusicas.innerHTML = "";


    if (lista.length === 0) {

        listaMusicas.innerHTML = `
            <p>Nenhuma música encontrada.</p>
        `;

        return;
    }


    lista.forEach((musica) => {

        const card = document.createElement("article");

        card.classList.add("card-musica");


        // ------------------------------
        // CAPA
        // ------------------------------

        const imagem = document.createElement("img");

        imagem.classList.add("capa-musica");

        imagem.src = musica.coverUrl || "https://via.placeholder.com/200";

        imagem.alt = `Capa de ${musica.titulo}`;


        // ------------------------------
        // INFORMAÇÕES
        // ------------------------------

        const informacoes = document.createElement("div");

        informacoes.classList.add("informacoes-musica");


        const titulo = document.createElement("h3");

        titulo.textContent = musica.titulo || "Sem título";


        const artista = document.createElement("p");

        artista.textContent = musica.artista || "Artista desconhecido";


        const album = document.createElement("p");

        album.textContent = musica.album || "Álbum desconhecido";


        informacoes.appendChild(titulo);

        informacoes.appendChild(artista);

        informacoes.appendChild(album);


        // ------------------------------
        // BOTÃO
        // ------------------------------

        const botaoOuvir = document.createElement("button");

        botaoOuvir.textContent = "▶ Ouvir";


        botaoOuvir.addEventListener("click", () => {

            reproduzirMusica(musica);

        });


        // ------------------------------
        // MONTAR CARD
        // ------------------------------

        card.appendChild(imagem);

        card.appendChild(informacoes);

        card.appendChild(botaoOuvir);


        listaMusicas.appendChild(card);

    });

}


// ========================================
// REPRODUZIR MÚSICA
// ========================================

function reproduzirMusica(musica) {

    if (!musica.audioUrl) {

        alert("Essa música ainda não possui uma URL de áudio.");

        return;
    }


    audioPlayer.src = musica.audioUrl;

    musicaAtualTitulo.textContent =
        `${musica.titulo} - ${musica.artista}`;


    audioPlayer.play();

}


// ========================================
// PESQUISA
// ========================================

campoPesquisa.addEventListener("input", () => {

    const texto = campoPesquisa.value
        .toLowerCase()
        .trim();


    const resultado = musicas.filter((musica) => {

        const titulo = musica.titulo?.toLowerCase() || "";

        const artista = musica.artista?.toLowerCase() || "";

        const album = musica.album?.toLowerCase() || "";


        return (
            titulo.includes(texto) ||
            artista.includes(texto) ||
            album.includes(texto)
        );

    });


    renderizarMusicas(resultado);

});

// ========================================
// btn logout
// ========================================

btnLogout.addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href = "./index.html";

    } catch (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );

    }

});

// ========================================
// INICIALIZAÇÃO
// ========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "./index.html";

        return;
    }


    carregarMusicas();

});