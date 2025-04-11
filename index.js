document.addEventListener("deviceready", function () {
    console.log("Cordova está pronto!");

    // Evita reinicializar o Framework7
    if (!window.app) {
        window.app = new Framework7({
            root: "#app",
            theme: "auto",
            panel: { swipe: true }
        });

        console.log("Framework7 inicializado!", window.app);
    } else {
        console.warn("Framework7 já estava inicializado!");
    }

    // Inicializa a barra de pesquisa se ainda não foi criada
    if (!window.searchbar) {
        var searchElement = document.querySelector(".searchbar");
        if (searchElement) {
            window.searchbar = window.app.searchbar.create({
                el: ".searchbar",
                searchContainer: "#race-list",
                searchIn: ".link-box3",
                on: {
                    search: function (sb, query) {
                        console.log("Pesquisando por:", query);
                    }
                }
            });

            console.log("Searchbar inicializada!", window.searchbar);
        } else {
            console.error("Erro: Barra de pesquisa não encontrada!");
        }
    } else {
        console.warn("Searchbar já estava inicializada!");
    }
});

// Evento para abrir e fechar o menu lateral
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM carregado!");

    var menuButton = document.querySelector(".panel-open");
    var closeButton = document.querySelector(".panel-close");

    if (menuButton) {
        menuButton.addEventListener("click", function (e) {
            e.preventDefault();
            console.log("Abrindo menu...");
            if (window.app) window.app.panel.open("left");
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", function (e) {
            e.preventDefault();
            console.log("Fechando menu...");
            if (window.app) window.app.panel.close();
        });
    }
});

// Função para voltar à página inicial
function voltarParaIndex() {
    window.location.href = "/www/index.html";
}

document.addEventListener("deviceready", function () {
    if (!window.app) {
      window.app = new Framework7({
        root: '#app',
        theme: 'auto',
        routes: [
          { path: '/index', url: 'index.html' },
          { path: '/pesquisa', url: 'pesquisa.html' },
          { path: '/ficha', url: 'ficha.html' },
          { path: '/raças', url: 'raças.html' },
          { path: '/origem', url: 'origem.html' },
          { path: '/atributos', url: 'atributos.html' },
          { path: '/classes', url: 'classes.html' },
          { path: '/base', url: 'base.html' },
          { path: '/pericias', url: 'pericias.html' },
          { path: '/habilidades', url: 'habilidades.html' },
          { path: '/magias', url: 'magias.html' },
          { path: '/armas', url: 'armas.html' },
          { path: '/itens', url: 'itens.html' }
        ]
      });
      console.log("Framework7 inicializado!");
    }
  });