const CACHE_NAME = "spotify-clone-static-v3";


const APP_SHELL = [

    "./",

    "./index.html",
    "./user.html",
    "./admin.html",

    "./manifest.webmanifest",

    "./css/login.css",
    "./css/style.css",
    "./css/admin.css",

    "./js/firebaseConfig.js",
    "./js/login.js",
    "./js/app.js",
    "./js/admin.js",
    "./js/pwa.js"

];


// ========================================
// INSTALL
// ========================================

self.addEventListener("install", (evento) => {

    evento.waitUntil(

        caches.open(CACHE_NAME)
            .then((cache) => {

                return cache.addAll(APP_SHELL);

            })

    );

    self.skipWaiting();

});


// ========================================
// ACTIVATE
// ========================================

self.addEventListener("activate", (evento) => {

    evento.waitUntil(

        caches.keys()
            .then((cachesExistentes) => {

                return Promise.all(

                    cachesExistentes
                        .filter(
                            (nome) =>
                                nome !== CACHE_NAME
                        )
                        .map(
                            (nome) =>
                                caches.delete(nome)
                        )

                );

            })

    );

    self.clients.claim();

});


// ========================================
// FETCH
// ========================================

self.addEventListener("fetch", (evento) => {

    const request = evento.request;

    // Só trabalhamos com GET
    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    // ----------------------------------------
    // Arquivos do nosso próprio site
    // ----------------------------------------

    const recursoLocal =
        url.origin === self.location.origin;

    // ----------------------------------------
    // SDK Firebase hospedado no Google
    // ----------------------------------------

    const recursoFirebase =
        url.origin === "https://www.gstatic.com" &&
        request.destination === "script";

    // ----------------------------------------
    // Recursos estáticos
    // ----------------------------------------

    const ehRecursoEstatico =
        recursoLocal &&
        [
            "document",
            "script",
            "style",
            "image",
            "font",
            "manifest"
        ].includes(request.destination);

    // ----------------------------------------
    // Ignora recursos que não queremos controlar
    // ----------------------------------------

    if (
        !ehRecursoEstatico &&
        !recursoFirebase
    ) {
        return;
    }

    // ----------------------------------------
    // CACHE FIRST + ATUALIZAÇÃO PELA REDE
    // ----------------------------------------

    evento.respondWith(

        caches.match(request)
            .then((respostaCache) => {

                const respostaRede =
                    fetch(request)
                        .then((resposta) => {

                            if (
                                resposta.ok ||
                                resposta.type === "opaque"
                            ) {

                                // IMPORTANTE:
                                // clonamos imediatamente
                                const respostaParaCache =
                                    resposta.clone();

                                evento.waitUntil(

                                    caches.open(CACHE_NAME)
                                        .then((cache) => {

                                            return cache.put(
                                                request,
                                                respostaParaCache
                                            );

                                        })

                                );

                            }

                            return resposta;

                        })
                        .catch(() => {

                            return respostaCache;

                        });

                // Se existe cache:
                // entrega imediatamente o cache.
                //
                // A rede continua atualizando o cache.

                return respostaCache || respostaRede;

            })

    );

});