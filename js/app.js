import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    arrayUnion,
    arrayRemove,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { db, auth } from "./firebaseConfig.js";


// ========================================
// ELEMENTOS DO HTML
// ========================================

const listaMusicas = document.getElementById("lista-musicas");

const campoPesquisa = document.getElementById("campo-pesquisa");

const audioPlayer = document.getElementById("audio-player");

const musicaAtualTitulo = document.getElementById("musica-atual-titulo");

const btnLogout = document.getElementById("btn-logout");

// PLAYLISTS

const formPlaylist = document.getElementById("form-playlist");

const nomePlaylist = document.getElementById("nome-playlist");

const listaPlaylists = document.getElementById("lista-playlists");

const playlistNome = document.getElementById("playlist-nome");

const playlistMusicas = document.getElementById("playlist-musicas");

// ========================================
// VARIÁVEIS
// ========================================

let musicas = [];

let playlists = [];

let playlistSelecionadaId = null;

let usuarioAtual = null;

// ========================================
// REFERÊNCIA PARA A COLLECTION
// ========================================

const musicasRef = collection(db, "songs");

const playlistsRef = collection(db, "playlists");

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

        listaMusicas.innerHTML =
            "<p>Nenhuma música encontrada.</p>";

        return;
    }


    lista.forEach((musica) => {

        const card =
            document.createElement("article");

        card.classList.add("card-musica");


        // CAPA

        const imagem =
            document.createElement("img");

        imagem.classList.add("capa-musica");

        imagem.src =
            musica.coverUrl ||
            "https://via.placeholder.com/200";

        imagem.alt =
            `Capa de ${musica.titulo}`;


        // INFORMAÇÕES

        const informacoes =
            document.createElement("div");

        informacoes.classList.add(
            "informacoes-musica"
        );


        const titulo =
            document.createElement("h3");

        titulo.textContent =
            musica.titulo || "Sem título";


        const artista =
            document.createElement("p");

        artista.textContent =
            musica.artista || "Artista desconhecido";


        const album =
            document.createElement("p");

        album.textContent =
            musica.album || "Álbum desconhecido";


        informacoes.appendChild(titulo);

        informacoes.appendChild(artista);

        informacoes.appendChild(album);


        // BOTÃO OUVIR

        const botaoOuvir =
            document.createElement("button");

        botaoOuvir.textContent =
            "▶ Ouvir";


        botaoOuvir.addEventListener(
            "click",
            () => {

                reproduzirMusica(musica);

            }
        );


        // BOTÃO PLAYLIST

        const botaoPlaylist =
            document.createElement("button");

        botaoPlaylist.textContent =
            "+ Playlist";


        botaoPlaylist.addEventListener(
            "click",
            () => {

                adicionarMusicaAPlaylist(
                    musica.id
                );

            }
        );


        // MONTAR CARD

        card.appendChild(imagem);

        card.appendChild(informacoes);

        card.appendChild(botaoOuvir);

        card.appendChild(botaoPlaylist);


        listaMusicas.appendChild(card);

    });

}



// ========================================
// CARREGAR PLAYLIST
// ========================================

async function carregarPlaylists() {

    try {

        const consulta =
            query(
                playlistsRef,
                where(
                    "userId",
                    "==",
                    usuarioAtual.uid
                )
            );


        const snapshot =
            await getDocs(consulta);


        playlists = [];


        snapshot.forEach((documento) => {

            playlists.push({

                id: documento.id,

                ...documento.data()

            });

        });


        renderizarPlaylists();

    } catch (erro) {

        console.error(
            "Erro ao carregar playlists:",
            erro
        );

    }

}

// ========================================
// RENDERIZAR PLAYLIST
// ========================================

function renderizarPlaylists() {

    listaPlaylists.innerHTML = "";


    if (playlists.length === 0) {

        listaPlaylists.innerHTML =
            "<p>Você ainda não possui playlists.</p>";

        return;

    }


    playlists.forEach((playlist) => {

        const container =
            document.createElement("div");

        container.classList.add(
            "playlist-item"
        );


        const botao =
            document.createElement("button");

        botao.textContent =
            playlist.nome;


        botao.addEventListener(
            "click",
            () => {

                selecionarPlaylist(
                    playlist.id
                );

            }
        );


        const botaoExcluir =
            document.createElement("button");

        botaoExcluir.textContent =
            "Excluir";


        botaoExcluir.addEventListener(
            "click",
            () => {

                excluirPlaylist(
                    playlist.id
                );

            }
        );


        container.appendChild(botao);

        container.appendChild(
            botaoExcluir
        );


        listaPlaylists.appendChild(
            container
        );

    });

}

// ========================================
// CRIAR PLAYLIST
// ========================================

formPlaylist.addEventListener(
    "submit",
    async (evento) => {

        evento.preventDefault();


        const nome =
            nomePlaylist.value.trim();


        if (nome === "") {
            return;
        }


        try {

            const novaPlaylist =
                await addDoc(
                    playlistsRef,
                    {

                        nome: nome,

                        userId:
                            usuarioAtual.uid,

                        songIds: [],

                        createdAt:
                            serverTimestamp()

                    }
                );


            playlistSelecionadaId =
                novaPlaylist.id;


            nomePlaylist.value = "";


            await carregarPlaylists();


            selecionarPlaylist(
                novaPlaylist.id
            );


        } catch (erro) {

            console.error(
                "Erro ao criar playlist:",
                erro
            );

        }

    }
);

// ========================================
// SELECIONAR PLAYLIST
// ========================================

function selecionarPlaylist(id) {

    playlistSelecionadaId = id;


    const playlist =
        playlists.find(
            (playlist) => playlist.id === id
        );


    if (!playlist) {
        return;
    }


    playlistNome.textContent =
        playlist.nome;


    renderizarMusicasDaPlaylist(
        playlist
    );

}

//========================================
// RENDERIZAR MÚSICAS DA PLAYLIST
// ========================================

function renderizarMusicasDaPlaylist(
    playlist
) {

    playlistMusicas.innerHTML = "";


    const songIds =
        playlist.songIds || [];


    if (songIds.length === 0) {

        playlistMusicas.innerHTML =
            "<p>Essa playlist está vazia.</p>";

        return;

    }


    songIds.forEach((songId) => {

        const musica =
            musicas.find(
                (musica) =>
                    musica.id === songId
            );


        if (!musica) {
            return;
        }


        const item =
            document.createElement("div");

        item.classList.add(
            "playlist-musica"
        );


        const informacoes =
            document.createElement("div");


        informacoes.innerHTML = `
            <strong>${musica.titulo}</strong>
            <span>${musica.artista}</span>
        `;


        const botaoOuvir =
            document.createElement("button");

        botaoOuvir.textContent =
            "▶";


        botaoOuvir.addEventListener(
            "click",
            () => {

                reproduzirMusica(
                    musica
                );

            }
        );


        const botaoRemover =
            document.createElement("button");

        botaoRemover.textContent =
            "Remover";


        botaoRemover.addEventListener(
            "click",
            () => {

                removerMusicaDaPlaylist(
                    musica.id
                );

            }
        );


        item.appendChild(informacoes);

        item.appendChild(botaoOuvir);

        item.appendChild(botaoRemover);


        playlistMusicas.appendChild(item);

    });

}

// ========================================
// ADICIONAR MUSICA A PLAYLIST
// ========================================

async function adicionarMusicaAPlaylist(
    songId
) {

    if (!playlistSelecionadaId) {

        alert(
            "Selecione uma playlist primeiro."
        );

        return;
    }


    try {

        const playlistRef =
            doc(
                db,
                "playlists",
                playlistSelecionadaId
            );


        await updateDoc(
            playlistRef,
            {

                songIds:
                    arrayUnion(songId)

            }
        );


        await carregarPlaylists();


        selecionarPlaylist(
            playlistSelecionadaId
        );


    } catch (erro) {

        console.error(
            "Erro ao adicionar música:",
            erro
        );

    }

}

// ========================================
// REMOVER MUSICA DA PLAYLIST
// ========================================

async function removerMusicaDaPlaylist(
    songId
) {

    if (!playlistSelecionadaId) {
        return;
    }


    try {

        const playlistRef =
            doc(
                db,
                "playlists",
                playlistSelecionadaId
            );


        await updateDoc(
            playlistRef,
            {

                songIds:
                    arrayRemove(songId)

            }
        );


        await carregarPlaylists();


        selecionarPlaylist(
            playlistSelecionadaId
        );


    } catch (erro) {

        console.error(
            "Erro ao remover música:",
            erro
        );

    }

}

// ========================================
// EXCLUIR PLAYLIST
// ========================================

async function excluirPlaylist(id) {

    const confirmar =
        confirm(
            "Deseja excluir esta playlist?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const playlistRef =
            doc(
                db,
                "playlists",
                id
            );


        await deleteDoc(
            playlistRef
        );


        if (
            playlistSelecionadaId === id
        ) {

            playlistSelecionadaId =
                null;

            playlistNome.textContent =
                "Nenhuma playlist selecionada";

            playlistMusicas.innerHTML =
                "";

        }


        await carregarPlaylists();


    } catch (erro) {

        console.error(
            "Erro ao excluir playlist:",
            erro
        );

    }

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

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "./index.html";

            return;
        }


        usuarioAtual = user;


        await carregarMusicas();

        await carregarPlaylists();

    }
);