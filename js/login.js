import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { auth } from "./firebaseConfig.js";


// ========================================
// CONFIGURAÇÃO
// ========================================

// UID DA CONTA ADMIN
const ADMIN_UID = "8wDYmklQzHf3zTU6m9vHXCvrast2";


// ========================================
// ELEMENTOS
// ========================================

const formLogin = document.getElementById("form-login");

const formCadastro = document.getElementById("form-cadastro");

const mensagem = document.getElementById("mensagem");


// ========================================
// SE JÁ ESTIVER LOGADO
// ========================================

// onAuthStateChanged(auth, (user) => {

//     if (!user) {
//         return;
//     }


//     if (user.uid === ADMIN_UID) {

//         window.location.href = "./admin.html";

//     } else {

//         window.location.href = "./user.html";

//     }

// });


// ========================================
// LOGIN
// ========================================

formLogin.addEventListener("submit", async (evento) => {

    evento.preventDefault();


    const email =
        document.getElementById("email").value;

    const senha =
        document.getElementById("senha").value;


    try {

        const resultado =
            await signInWithEmailAndPassword(
                auth,
                email,
                senha
            );


        const user = resultado.user;


        if (user.uid === ADMIN_UID) {

            window.location.href = "./admin.html";

        } else {

            window.location.href = "./user.html";

        }

    } catch (erro) {

        console.error(erro);

        mensagem.textContent =
            "E-mail ou senha incorretos.";

    }

});


// ========================================
// CADASTRO
// ========================================

formCadastro.addEventListener("submit", async (evento) => {

    evento.preventDefault();


    const email =
        document.getElementById("cadastro-email").value;

    const senha =
        document.getElementById("cadastro-senha").value;


    try {

        await createUserWithEmailAndPassword(
            auth,
            email,
            senha
        );


        mensagem.textContent =
            "Conta criada com sucesso!";


        window.location.href = "./user.html";

    } catch (erro) {

        console.error(erro);

        mensagem.textContent =
            "Não foi possível criar a conta.";

    }

});