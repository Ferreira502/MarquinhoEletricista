const topoSite = document.querySelector(".topo-site");
const botaoMenu = document.querySelector(".botao-menu");
const menuSite = document.querySelector(".menu-site");
const itensParaSurgir = document.querySelectorAll(".surgir");
const numerosAnimados = document.querySelectorAll(".numero-destaque");
const gruposDeAbas = document.querySelectorAll("[data-grupo-abas]");
const linksDoMenu = document.querySelectorAll('.menu-site a[href^="#"]');
const linksQueRolam = document.querySelectorAll('a[href^="#"]');

function atualizarTopoSite() {
  if (!topoSite) {
    return;
  }

  topoSite.classList.toggle("topo-baixo", window.scrollY > 18);
}

function fecharMenuSite() {
  if (!botaoMenu || !menuSite) {
    return;
  }

  botaoMenu.setAttribute("aria-expanded", "false");
  menuSite.classList.remove("aberto");
}

function rolarAteSecao(idDaSecao) {
  if (idDaSecao === "#inicio") {
    const inicioAtual = window.scrollY;
    const duracao = 650;
    let inicioDaAnimacao = null;

    function animarVoltaAoTopo(tempoAtual) {
      if (!inicioDaAnimacao) {
        inicioDaAnimacao = tempoAtual;
      }

      const tempoPassado = tempoAtual - inicioDaAnimacao;
      const progresso = Math.min(tempoPassado / duracao, 1);
      const progressoSuave = 1 - Math.pow(1 - progresso, 3);

      window.scrollTo(0, inicioAtual * (1 - progressoSuave));

      if (progresso < 1) {
        requestAnimationFrame(animarVoltaAoTopo);
      }
    }

    requestAnimationFrame(animarVoltaAoTopo);
    return;
  }

  const secao = document.querySelector(idDaSecao);

  if (!secao) {
    return;
  }

  const alturaDoTopo = topoSite ? topoSite.offsetHeight : 0;
  const posicaoDaSecao = secao.getBoundingClientRect().top + window.scrollY - alturaDoTopo - 12;
  const inicio = window.scrollY;
  const distancia = posicaoDaSecao - inicio;
  const duracao = 650;
  let inicioDaAnimacao = null;

  function animarRolagem(tempoAtual) {
    if (!inicioDaAnimacao) {
      inicioDaAnimacao = tempoAtual;
    }

    const tempoPassado = tempoAtual - inicioDaAnimacao;
    const progresso = Math.min(tempoPassado / duracao, 1);
    const progressoSuave = 1 - Math.pow(1 - progresso, 3);

    window.scrollTo(0, inicio + distancia * progressoSuave);

    if (progresso < 1) {
      requestAnimationFrame(animarRolagem);
    }
  }

  requestAnimationFrame(animarRolagem);
}

if (botaoMenu && menuSite) {
  botaoMenu.addEventListener("click", () => {
    const menuEstaAberto = botaoMenu.getAttribute("aria-expanded") === "true";
    botaoMenu.setAttribute("aria-expanded", String(!menuEstaAberto));
    menuSite.classList.toggle("aberto", !menuEstaAberto);
  });

  menuSite.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", fecharMenuSite);
  });

  window.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      fecharMenuSite();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      fecharMenuSite();
    }
  });
}

linksQueRolam.forEach((link) => {
  link.addEventListener("click", (evento) => {
    const destino = link.getAttribute("href");

    if (!destino || !destino.startsWith("#")) {
      return;
    }

    const secaoExiste = document.querySelector(destino);

    if (!secaoExiste) {
      return;
    }

    evento.preventDefault();
    fecharMenuSite();
    rolarAteSecao(destino);
  });
});

window.addEventListener("scroll", atualizarTopoSite, { passive: true });
window.addEventListener("load", atualizarTopoSite);

gruposDeAbas.forEach((grupo) => {
  const botoesDasAbas = Array.from(grupo.querySelectorAll("[data-botao-aba]"));
  const paineisDasAbas = Array.from(grupo.querySelectorAll("[data-painel-aba]"));

  if (botoesDasAbas.length === 0 || paineisDasAbas.length === 0) {
    return;
  }

  function pausarVideosDasAbas() {
    paineisDasAbas.forEach((painel) => {
      painel.querySelectorAll("video").forEach((video) => {
        video.pause();
      });
    });
  }

  function abrirAba(nomeDaAba) {
    botoesDasAbas.forEach((botao) => {
      const estaAtiva = botao.dataset.botaoAba === nomeDaAba;
      botao.classList.toggle("ativo", estaAtiva);
      botao.setAttribute("aria-selected", String(estaAtiva));
    });

    paineisDasAbas.forEach((painel) => {
      const estaAtivo = painel.dataset.painelAba === nomeDaAba;
      painel.classList.toggle("ativo", estaAtivo);
      painel.hidden = !estaAtivo;
    });

    pausarVideosDasAbas();
  }

  botoesDasAbas.forEach((botao) => {
    botao.addEventListener("click", () => {
      abrirAba(botao.dataset.botaoAba);
    });
  });

  abrirAba(botoesDasAbas[0].dataset.botaoAba);
});

if ("IntersectionObserver" in window) {
  const observadorDosBlocos = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) {
          return;
        }

        entrada.target.classList.add("visivel");
        observadorDosBlocos.unobserve(entrada.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );

  itensParaSurgir.forEach((item) => observadorDosBlocos.observe(item));

  const observadorDosNumeros = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) {
          return;
        }

        const numero = entrada.target;
        const valorFinal = Number(numero.dataset.valorFinal || 0);
        const sufixo = numero.dataset.sufixo || "";
        const tempoDaAnimacao = 1200;
        let instanteInicial = null;

        function animarNumero(instanteAtual) {
          if (!instanteInicial) {
            instanteInicial = instanteAtual;
          }

          const andamento = Math.min((instanteAtual - instanteInicial) / tempoDaAnimacao, 1);
          const andamentoSuave = 1 - Math.pow(1 - andamento, 3);
          numero.textContent = `${Math.round(valorFinal * andamentoSuave)}${sufixo}`;

          if (andamento < 1) {
            requestAnimationFrame(animarNumero);
          }
        }

        requestAnimationFrame(animarNumero);
        observadorDosNumeros.unobserve(numero);
      });
    },
    { threshold: 0.45 }
  );

  numerosAnimados.forEach((numero) => observadorDosNumeros.observe(numero));
} else {
  itensParaSurgir.forEach((item) => item.classList.add("visivel"));
  numerosAnimados.forEach((numero) => {
    numero.textContent = `${numero.dataset.valorFinal || "0"}${numero.dataset.sufixo || ""}`;
  });
}
