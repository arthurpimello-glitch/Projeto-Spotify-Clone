if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            const registro =
                await navigator.serviceWorker.register(
                    "./sw.js"
                );


            console.log(
                "Service Worker registrado:",
                registro.scope
            );

        } catch (erro) {

            console.error(
                "Erro ao registrar Service Worker:",
                erro
            );

        }

    });

}