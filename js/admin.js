import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { auth , db } from "./firebaseConfig.js";

// UID DA CONTA ADMIN
const ADMIN_UID = "8wDYmklQzHf3zTU6m9vHXCvrast2";

// ========================================
// ELEMENTOS DO HTML
// ========================================
const formulario = document.getElementById("form-musica");

const musicaId = document.getElementById("musica-id");

const titulo = document.getElementById("titulo");
const artista = document.getElementById("artista");
const album = document.getElementById("album");
const duracao = document.getElementById("duracao");
const genero = document.getElementById("genero");
const audioUrl = document.getElementById("audio-url");
const coverUrl = document.getElementById("cover-url");

const listaMusicas = document.getElementById("lista-musicas");

const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");

const btnLogout = document.getElementById("btn-logout");

// pegar a referência da coleção "songs" do firebase
const musicasRef = collection(db, "songs");

// ========================================
// READ
// função que vai ser responsável por carregar
// as músicas na tela
// ========================================
async function carregarMusicas() {

    try {

        const snapshot = await getDocs(musicasRef);

        listaMusicas.innerHTML = "";

        snapshot.forEach((documento) => {

            const musica = documento.data();

            const linha = document.createElement("tr");

            const colunaTitulo = document.createElement("td");
            colunaTitulo.textContent = musica.titulo || "-";

            const colunaArtista = document.createElement("td");
            colunaArtista.textContent = musica.artista || "-";

            const colunaAlbum = document.createElement("td");
            colunaAlbum.textContent = musica.album || "-";

            const colunaDuracao = document.createElement("td");
            colunaDuracao.textContent = musica.duracao || "-";

            const colunaGenero = document.createElement("td");
            colunaGenero.textContent = musica.genero || "-";

            const colunaAcoes = document.createElement("td");

            const btnEditar = document.createElement("button");
            btnEditar.textContent = "Editar";

            btnEditar.addEventListener("click", () => {
                editarMusica(documento.id, musica);
            });

            const btnExcluir = document.createElement("button");
            btnExcluir.textContent = "Excluir";

            btnExcluir.addEventListener("click", () => {
                excluirMusica(documento.id);
            });

            colunaAcoes.appendChild(btnEditar);
            colunaAcoes.appendChild(btnExcluir);

            linha.appendChild(colunaTitulo);
            linha.appendChild(colunaArtista);
            linha.appendChild(colunaAlbum);
            linha.appendChild(colunaDuracao);
            linha.appendChild(colunaGenero);
            linha.appendChild(colunaAcoes);

            listaMusicas.appendChild(linha);
        });

    } catch (erro) {

        console.error("Erro ao carregar músicas:", erro);

    }
}

// ========================================
// CREATE / UPDATE
// ========================================
formulario.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const dadosMusica = {

        titulo: titulo.value,
        artista: artista.value,
        album: album.value,
        duracao: Number(duracao.value),
        genero: genero.value,
        audioUrl: audioUrl.value,
        coverUrl: coverUrl.value
    };


    try {
        // CREATE
        if (musicaId.value === "") {

            // Criar uma nova música
            await addDoc(musicasRef, dadosMusica);

            console.log("Música adicionada!");

        } 

        // UPDTADE
        else {

            // Editar uma música existente
            const musicaRef = doc(db, "songs", musicaId.value);

            await updateDoc(musicaRef, dadosMusica);

            console.log("Música atualizada!");

        }

        limparFormulario();

        await carregarMusicas();

    } catch (erro) {

        console.error("Erro ao salvar música:", erro);

    }

});

// ========================================
// EDIT
// ========================================
function editarMusica(id, musica) {

    musicaId.value = id;

    titulo.value = musica.titulo || "";
    artista.value = musica.artista || "";
    album.value = musica.album || "";
    duracao.value = musica.duracao || "";
    genero.value = musica.genero || "";
    audioUrl.value = musica.audioUrl || "";
    coverUrl.value = musica.coverUrl || "";

    btnSalvar.textContent = "Salvar alterações";
}

// ========================================
// DELETE
// ========================================
async function excluirMusica(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir esta música?"
    );


    if (!confirmar) {
        return;
    }


    try {

        const musicaRef = doc(
            db,
            "songs",
            id
        );

        await deleteDoc(musicaRef);

        console.log("Música excluída!");

        await carregarMusicas();

    } catch (erro) {

        console.error(
            "Erro ao excluir música:",
            erro
        );

    }

}

// ========================================
// LIMPAR FORMULÁRIO
// ========================================
function limparFormulario() {

    formulario.reset();

    musicaId.value = "";

    btnSalvar.textContent = "Adicionar música";
}

btnCancelar.addEventListener("click", () => {

    limparFormulario();

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


    if (user.uid !== ADMIN_UID) {

        window.location.href = "./user.html";

        return;
    }


    carregarMusicas();

});