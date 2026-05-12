(function () {
  const canvas = document.getElementById("canvas-faixas");
  const contexto = canvas.getContext("2d");
  let faiscas = [];

  function ajustarCanvas() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }

  function criarFaisca() {
    const angulo = Math.random() * Math.PI * 2;
    const velocidade = 0.4 + Math.random() * 1.6;

    faiscas.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      velocidadeX: Math.cos(angulo) * velocidade,
      velocidadeY: Math.sin(angulo) * velocidade,
      vida: 1,
      tamanho: 0.7 + Math.random() * 1.5,
      rastro: []
    });
  }

  function animarFaiscas() {
    contexto.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.07) {
      criarFaisca();
    }

    faiscas = faiscas.filter((faisca) => faisca.vida > 0);

    faiscas.forEach((faisca) => {
      faisca.rastro.push({ x: faisca.x, y: faisca.y });

      if (faisca.rastro.length > 9) {
        faisca.rastro.shift();
      }

      faisca.x += faisca.velocidadeX;
      faisca.y += faisca.velocidadeY;
      faisca.velocidadeY += 0.012;
      faisca.vida -= 0.02;

      for (let i = 1; i < faisca.rastro.length; i += 1) {
        const transparencia = (i / faisca.rastro.length) * faisca.vida * 0.5;
        contexto.beginPath();
        contexto.moveTo(faisca.rastro[i - 1].x, faisca.rastro[i - 1].y);
        contexto.lineTo(faisca.rastro[i].x, faisca.rastro[i].y);
        contexto.strokeStyle = `rgba(245,196,0,${transparencia})`;
        contexto.lineWidth = faisca.tamanho * (i / faisca.rastro.length);
        contexto.stroke();
      }

      contexto.beginPath();
      contexto.arc(faisca.x, faisca.y, faisca.tamanho, 0, Math.PI * 2);
      contexto.fillStyle = `rgba(245,196,0,${faisca.vida})`;
      contexto.fill();
    });

    requestAnimationFrame(animarFaiscas);
  }

  ajustarCanvas();
  addEventListener("resize", ajustarCanvas);
  animarFaiscas();
})();

const barraNavegacao = document.getElementById("barra-navegacao");

addEventListener(
  "scroll",
  () => barraNavegacao.classList.toggle("rolada", scrollY > 40),
  { passive: true }
);

const observadorAparecer = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visivel");
        observadorAparecer.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".aparecer").forEach((elemento) => {
  observadorAparecer.observe(elemento);
});

document.querySelectorAll("a, button").forEach((elemento) => {
  elemento.addEventListener("click", (evento) => {
    const onda = document.createElement("span");
    const retangulo = elemento.getBoundingClientRect();
    const tamanho = Math.max(retangulo.width, retangulo.height);

    onda.style.cssText = `position:absolute;width:${tamanho}px;height:${tamanho}px;left:${evento.clientX - retangulo.left - tamanho / 2}px;top:${evento.clientY - retangulo.top - tamanho / 2}px;background:rgba(255,255,255,.18);border-radius:50%;transform:scale(0);animation:onda .5s linear;pointer-events:none;`;

    if (getComputedStyle(elemento).position === "static") {
      elemento.style.position = "relative";
    }

    elemento.style.overflow = "hidden";
    elemento.appendChild(onda);
    setTimeout(() => onda.remove(), 550);
  });
});

(function () {
  const trilha = document.getElementById("trilha-carrossel");
  const area = document.getElementById("area-carrossel");
  const botaoAnterior = document.getElementById("botao-anterior");
  const botaoProximo = document.getElementById("botao-proximo");
  const paginacao = document.getElementById("paginacao-carrossel");

  if (!trilha || !area || !botaoAnterior || !botaoProximo || !paginacao) {
    return;
  }

  const slides = Array.from(trilha.querySelectorAll(".slide-carrossel"));
  let indiceAtual = 0;
  const ultimoIndice = slides.length - 1;
  let inicioX = 0;
  let arrastando = false;
  let deslocamentoBase = 0;
  let temporizador = null;

  slides.forEach((_, indice) => {
    const bolinha = document.createElement("div");
    bolinha.className = indice === 0 ? "bolinha-paginacao ativa" : "bolinha-paginacao";
    bolinha.addEventListener("click", () => irParaSlide(indice));
    paginacao.appendChild(bolinha);
  });

  function atualizarControles() {
    paginacao.querySelectorAll(".bolinha-paginacao").forEach((bolinha, indice) => {
      bolinha.classList.toggle("ativa", indice === indiceAtual);
    });

    botaoAnterior.classList.toggle("desativado", indiceAtual === 0);
    botaoProximo.classList.toggle("desativado", indiceAtual === ultimoIndice);
  }

  function calcularDeslocamento(indice) {
    const larguraSlide = slides[0].offsetWidth + 16;
    const larguraArea = area.clientWidth;
    const deslocamento = indice * larguraSlide - (larguraArea / 2 - larguraSlide / 2);
    return -Math.max(0, deslocamento);
  }

  function irParaSlide(indice) {
    indiceAtual = Math.max(0, Math.min(indice, ultimoIndice));
    trilha.style.transition = "transform .45s cubic-bezier(.25,.46,.45,.94)";
    trilha.style.transform = `translateX(${calcularDeslocamento(indiceAtual)}px)`;
    atualizarControles();
  }

  function iniciarTrocaAutomatica() {
    temporizador = setInterval(() => {
      irParaSlide(indiceAtual < ultimoIndice ? indiceAtual + 1 : 0);
    }, 4500);
  }

  function pararTrocaAutomatica() {
    clearInterval(temporizador);
  }

  botaoAnterior.addEventListener("click", () => irParaSlide(indiceAtual - 1));
  botaoProximo.addEventListener("click", () => irParaSlide(indiceAtual + 1));

  area.addEventListener("pointerdown", (evento) => {
    inicioX = evento.clientX;
    deslocamentoBase = calcularDeslocamento(indiceAtual);
    arrastando = true;
    trilha.style.transition = "none";
    area.setPointerCapture(evento.pointerId);
    pararTrocaAutomatica();
  });

  area.addEventListener("pointermove", (evento) => {
    if (!arrastando) {
      return;
    }

    trilha.style.transform = `translateX(${deslocamentoBase + (evento.clientX - inicioX)}px)`;
  });

  area.addEventListener("pointerup", (evento) => {
    if (!arrastando) {
      return;
    }

    arrastando = false;
    const diferenca = evento.clientX - inicioX;

    if (diferenca < -50) {
      irParaSlide(indiceAtual + 1);
    } else if (diferenca > 50) {
      irParaSlide(indiceAtual - 1);
    } else {
      irParaSlide(indiceAtual);
    }

    pararTrocaAutomatica();
    iniciarTrocaAutomatica();
  });

  area.addEventListener("pointercancel", () => {
    if (!arrastando) {
      return;
    }

    arrastando = false;
    irParaSlide(indiceAtual);
    pararTrocaAutomatica();
    iniciarTrocaAutomatica();
  });

  addEventListener("resize", () => {
    irParaSlide(indiceAtual);
  });

  irParaSlide(0);
  iniciarTrocaAutomatica();
})();

(function () {
  const numeros = document.querySelectorAll(".numero-estatistica[data-target]");

  const observadorContador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) {
          return;
        }

        const elemento = entrada.target;
        const valorFinal = Number(elemento.dataset.target);
        const sufixo = elemento.dataset.suf || "";
        let tempoInicial = null;

        function animarNumero(tempoAtual) {
          if (!tempoInicial) {
            tempoInicial = tempoAtual;
          }

          const progresso = Math.min((tempoAtual - tempoInicial) / 1100, 1);
          const suavizacao = progresso < 0.5 ? 2 * progresso * progresso : (4 - 2 * progresso) * progresso - 1;
          elemento.textContent = Math.round(suavizacao * valorFinal) + sufixo;

          if (progresso < 1) {
            requestAnimationFrame(animarNumero);
          }
        }

        requestAnimationFrame(animarNumero);
        observadorContador.unobserve(elemento);
      });
    },
    { threshold: 0.85 }
  );

  numeros.forEach((numero) => {
    observadorContador.observe(numero);
  });
})();
