"use strict";
// Visita interativa ao auditório (seção 02). Usa WebGL, sem dependências.
// As fotos de cada vista ficam em assets/tour/*.js, em base64: WebGL não aceita
// imagens carregadas de arquivo local, e assim o site funciona também aberto do disco.
(() => {
  /* Edite aqui os textos e os pontos de interesse.
     lon = esquerda (-) / direita (+), lat = cima (-) / baixo (+), em graus. */
  const ESCULTURA = {
    nome: "Anna Maria Brandão Coelho",
    resumo:
      "Esta escultura traduz a trajetória de uma mulher sábia e ponderada, sensível e acolhedora, que edifica o lar e a família com amor e serenidade.",
    texto: [
      "Esta escultura traduz a trajetória de uma mulher sábia e ponderada, sensível e acolhedora, que edifica o lar e a família com amor e serenidade. Respeitosa, gentil e educada com todos, vive com sabedoria, força e ternura – virtudes que se refletem em cada traço desta forma.",
      "A postura do corpo, em leve movimento, expressa firmeza e suavidade ao mesmo tempo – como quem enfrentou os desafios da vida com calma, coragem e esperança.",
      "A cabeça erguida revela o orgulho sereno de quem tem paz com a própria história, sem arrogância, mas com a autoridade de uma vida construída sobre valores sólidos.",
      "O rosto e o cabelo, em traços minimalistas, lembram que a verdadeira beleza não está nos adornos, mas na dignidade e na luz que emanam de gestos e atitudes.",
      "O vestido longo simboliza o tempo — uma vida plena de fases, histórias e conquistas. Seu movimento contínuo evoca o fluir da existência: o tempo passa, mas não apaga; ela segue inspirando e deixando sua marca nas gerações futuras.",
    ],
  };

  const CENAS = {
    A: {
      olhar: { yaw: 0.5, pitch: 5 },
      centroLuz: 1,
      panini: 0.5,
      abertura: { largura: 1.2, altura: 0.6, retrato: 0.8 },
      pontos: [
        {
          lon: 4.6,
          lat: 8.5,
          titulo: "Escultura",
          historia: ESCULTURA,
          foco: { lon: 0.5, lat: 6.5, zoom: 1.9 },
        },
      ],
    },
    B: {
      olhar: { yaw: -2, pitch: -2 },
      centroLuz: 0,
      panini: 0.12, // parede plana: quase sem curvatura
      pontos: [
        {
          lon: -3,
          lat: -2,
          titulo: "Tela de projeção",
          texto: "O centro das palestras e apresentações realizadas no auditório.",
        },
        {
          lon: 26,
          lat: 1,
          titulo: "Bandeiras",
          rotulo: "Símbolos",
          texto: "Da esquerda para a direita, as bandeiras do estado, do país e do município.",
          foco: { lon: 28, lat: 5, zoom: 1.6 },
          bandeiras: [
            {
              nome: "Goiás",
              img: "./assets/bandeiras/goias.svg",
              texto: "Bandeira do estado, adotada em 1919, com as cinco estrelas do Cruzeiro do Sul.",
            },
            {
              nome: "Brasil",
              img: "./assets/bandeiras/brasil.svg",
              texto: "Bandeira Nacional, adotada em 1889, com o lema “Ordem e Progresso”.",
            },
            {
              nome: "Morrinhos",
              img: "./assets/bandeiras/morrinhos.svg",
              texto: "Bandeira do município onde fica o cartório, com o brasão municipal.",
            },
          ],
        },
        {
          lon: -21,
          lat: 3,
          titulo: "Quadro de vidro",
          texto: "Quadro móvel de apoio para aulas e apresentações.",
        },
      ],
    },
    C: {
      olhar: { yaw: 4, pitch: -1 },
      centroLuz: 30,
      panini: 0.5,
      pontos: [
        {
          lon: 11.5,
          lat: 4,
          titulo: "Escultura",
          historia: ESCULTURA,
          foco: { lon: 8, lat: 4.5, zoom: 1.5 },
        },
      ],
    },
  };

  /* Ajustes da imagem */
  const AJUSTE = {
    meiaLargura: 0.76, // limite da abertura horizontal; menor = menos distorção e mais giro
    paralaxe: 0.05, // quanto a sala se desloca com o mouse
  };

  const FOTOS_ESCULTURA = [
    { src: "./assets/escultura-1-hd.webp", alt: "Escultura vista de lado, com as cadeiras e a cortina ao fundo" },
    { src: "./assets/escultura-2-hd.webp", alt: "Escultura vista de trás, voltada para as janelas" },
    { src: "./assets/escultura-3-hd.webp", alt: "Escultura vista de frente, em detalhe" },
  ];

  const META = {"A": {"lon": [-55.0357, 54.5], "lat": [-32.1071, 41.3214]}, "B": {"lon": [-52.27777777777778, 51.888888888888886], "lat": [-32.75, 27.805555555555557]}, "C": {"lon": [-50.861111111111114, 52.02777777777777], "lat": [-31.444444444444443, 29.361111111111114]}};
  const PROF = {"A": "data:image/png;base64,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", "B": "data:image/png;base64,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", "C": "data:image/png;base64,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"};

  const raiz = document.getElementById("tour");
  if (!raiz) return;

  const RAD = Math.PI / 180;
  const canvas = raiz.querySelector(".tour-canvas");
  const palco = raiz.querySelector(".tour-stage");
  const caixaPontos = raiz.querySelector(".tour-points");
  const dica = raiz.querySelector(".tour-hint");
  const aviso = raiz.querySelector(".tour-status");
  const body = document.body;
  const toque = matchMedia("(pointer: coarse)").matches;
  const leve = toque || screen.width < 900; // fotos mais leves em aparelhos pequenos

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const suave = (t) => t * t * (3 - 2 * t);
  const carrega = (src) =>
    new Promise((ok, erro) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = erro;
      i.src = src;
    });

  /* ---------- Shader ----------
     Projeção Panini: mantém as verticais retas e estica bem menos as laterais do
     que a perspectiva comum. O olhar para cima e para baixo desloca a imagem em vez
     de inclinar a câmera, por isso as paredes não convergem. */
  const VS = `attribute vec2 p; varying vec2 v; void main(){ v=p; gl_Position=vec4(p,0.,1.); }`;
  const FS = `precision highp float;
  varying vec2 v;
  uniform vec2 tanV, giro;
  uniform vec3 par;
  uniform vec4 ret;
  uniform sampler2D texOff, texOn, texProf;
  uniform float desloc, luz, centro, brilho, D;

  vec3 raio(vec2 q){
    float k = q.x * q.x / ((D + 1.) * (D + 1.));
    float clon = (-k * D + sqrt(k * k * D * D - (k + 1.) * (k * D * D - 1.))) / (k + 1.);
    float S = (D + 1.) / (D + clon);
    float lon = atan(q.x, S * clon), lat = atan(q.y, S);
    vec3 d = vec3(sin(lon) * cos(lat), sin(lat), cos(lon) * cos(lat));
    return vec3(giro.x * d.x + giro.y * d.z, d.y, -giro.y * d.x + giro.x * d.z);
  }

  vec2 uvDe(vec3 d){
    return vec2((atan(d.x, d.z) - ret.x) / ret.z, (asin(clamp(d.y, -1., 1.)) - ret.y) / ret.w);
  }

  void main(){
    vec3 r = raio(vec2(v.x * tanV.x, -v.y * tanV.y + desloc));
    vec3 d = r;
    for (int i = 0; i < 2; i++) {
      float inv = texture2D(texProf, uvDe(d)).r * 1.2;
      d = normalize(r / max(inv, .03) + par);
    }
    vec2 uv = uvDe(d);
    // As luzes acendem do centro da parede para as laterais
    float dist = abs(atan(d.x, d.z) - centro) / 1.9;
    float k = smoothstep(dist - .1, dist + .1, luz * 1.22 - .11);
    vec3 c = mix(texture2D(texOff, uv).rgb, texture2D(texOn, uv).rgb, k);
    gl_FragColor = vec4(c * brilho, 1.);
  }`;

  let gl = null;
  let webgl2 = false;
  let maximoTextura = 4096;
  const U = {};

  function preparaGL() {
    const shader = (tipo, src) => {
      const s = gl.createShader(tipo);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aP = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(aP);
    gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);

    ["tanV", "giro", "par", "ret", "texOff", "texOn", "texProf", "desloc", "luz", "centro", "brilho", "D"].forEach(
      (n) => {
        U[n] = gl.getUniformLocation(prog, n);
      },
    );
    ["texOff", "texOn", "texProf"].forEach((n, i) => gl.uniform1i(U[n], i));
    webgl2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
    maximoTextura = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), toque ? 4096 : 8192);
  }

  /* ---------- Texturas: cada vista só é carregada quando é escolhida ---------- */
  function textura(img, mip) {
    let fonte = img;
    const maior = Math.max(img.width, img.height);
    if (maior > maximoTextura) {
      const e = maximoTextura / maior;
      const c = document.createElement("canvas");
      c.width = (img.width * e) | 0;
      c.height = (img.height * e) | 0;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      fonte = c;
    }
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fonte);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (mip && webgl2) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    return t;
  }

  // Cada arquivo assets/tour/cena-*.js chama esta função quando termina de carregar
  const chegando = {};
  window.AuditorioTour = {
    dados(c, fotos) {
      if (chegando[c]) chegando[c].ok(fotos);
    },
  };

  function baixa(c) {
    return new Promise((ok, erro) => {
      chegando[c] = { ok };
      const s = document.createElement("script");
      s.src = `./assets/tour/cena-${c}${leve ? "-leve" : ""}.js`;
      s.onerror = erro;
      s.onload = () => s.remove();
      document.head.append(s);
    });
  }

  const tex = {};
  const baixando = {};
  async function garante(c) {
    if (tex[c]) return tex[c];
    if (!baixando[c]) baixando[c] = baixa(c);
    let fotos;
    try {
      fotos = await baixando[c];
    } catch (e) {
      delete baixando[c];
      throw e;
    }
    const [off, on, prof] = await Promise.all([carrega(fotos.off), carrega(fotos.on), carrega(PROF[c])]);
    if (tex[c]) return tex[c];
    gl.activeTexture(gl.TEXTURE0 + 5);
    tex[c] = { off: textura(off, true), on: textura(on, true), prof: textura(prof, false) };
    if (toque) delete baixando[c]; // no celular guarda só a vista em uso
    return tex[c];
  }

  function solta(c) {
    if (!tex[c]) return;
    Object.values(tex[c]).forEach((t) => gl.deleteTexture(t));
    delete tex[c];
  }

  function ligaCena(c) {
    [tex[c].off, tex[c].on, tex[c].prof].forEach((t, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
    });
    const M = META[c];
    gl.uniform4f(U.ret, M.lon[0] * RAD, M.lat[0] * RAD, (M.lon[1] - M.lon[0]) * RAD, (M.lat[1] - M.lat[0]) * RAD);
    gl.uniform1f(U.centro, CENAS[c].centroLuz * RAD);
    gl.uniform1f(U.D, CENAS[c].panini);
  }

  /* ---------- Câmera ---------- */
  let cena = "A";
  let yaw = 0,
    pitch = 0,
    fov = 60;
  let alvoYaw = 0,
    alvoPitch = 0,
    alvoFov = 60;
  let velYaw = 0,
    velPitch = 0;
  let mx = 0,
    my = 0,
    pmx = 0,
    pmy = 0;
  let luzAlvo = 0,
    luz = 0;
  let cw = 1,
    ch = 1,
    aspecto = 1;
  let iniciado = false;
  let retorno = null, // posição para voltar depois do zoom na escultura
    lento = false;
  let brilho = 0,
    fase = 0, // 0 parado, 1 escurecendo, 2 carregando, 3 clareando
    destino = null;
  const mapa = {}; // onde cada foto tem imagem válida

  const meiaAltura = (f) => Math.tan((f * RAD) / 2);

  function fovBase(c) {
    // Em tela larga a abertura diminui: é o que evita o esticado nas pontas
    const a = CENAS[c].abertura || { largura: AJUSTE.meiaLargura, altura: 0.5, retrato: 0.72 };
    if (aspecto >= 1) return (2 * Math.atan(Math.min(a.altura, a.largura / aspecto))) / RAD;
    // Tela bem alta (celular em pé, maximizado): fecha um pouco para sobrar espaço para girar
    const t = aspecto < 0.6 ? Math.min(a.retrato, CENAS[c].abertura ? 0.62 : 0.5) : a.retrato;
    return (2 * Math.atan(t)) / RAD;
  }

  function dirDe(D, y, s, qx, qy) {
    const q = qy + s;
    const k = (qx * qx) / ((D + 1) * (D + 1));
    const clon = (-k * D + Math.sqrt(k * k * D * D - (k + 1) * (k * D * D - 1))) / (k + 1);
    const S = (D + 1) / (D + clon);
    const lon = Math.atan2(qx, S * clon),
      lat = Math.atan2(q, S);
    const dx = Math.sin(lon) * Math.cos(lat),
      dy = Math.sin(lat),
      dz = Math.cos(lon) * Math.cos(lat);
    const c = Math.cos(y),
      n = Math.sin(y);
    return [c * dx + n * dz, dy, -n * dx + c * dz];
  }

  function valido(c, d) {
    const m = mapa[c],
      M = META[c];
    const lon = Math.atan2(d[0], d[2]) / RAD,
      lat = Math.asin(clamp(d[1], -1, 1)) / RAD;
    const u = (lon - M.lon[0]) / (M.lon[1] - M.lon[0]),
      v = (lat - M.lat[0]) / (M.lat[1] - M.lat[0]);
    if (u < 0 || u > 1 || v < 0 || v > 1) return false;
    return m.d[(((v * (m.h - 1)) | 0) * m.w + ((u * (m.w - 1)) | 0)) * 4 + 1] > 128;
  }

  function dentro(c, yDeg, pDeg, f) {
    const ty = meiaAltura(f),
      tx = ty * aspecto,
      y = yDeg * RAD,
      s = Math.tan(pDeg * RAD),
      D = CENAS[c].panini;
    for (let i = 0; i <= 8; i++) {
      const e = i / 4 - 1;
      if (
        !valido(c, dirDe(D, y, s, e * tx, -ty)) ||
        !valido(c, dirDe(D, y, s, e * tx, ty)) ||
        !valido(c, dirDe(D, y, s, -tx, e * ty)) ||
        !valido(c, dirDe(D, y, s, tx, e * ty))
      )
        return false;
    }
    return true;
  }

  // Maior abertura que cabe na foto, procurando também a melhor altura
  function ajusta(c, y, p) {
    for (let f = fovBase(c); f > 22; f -= 0.5) {
      for (let dp = 0; dp <= 16; dp++) {
        if (dentro(c, y, p + dp, f)) return { f, p: p + dp };
        if (dentro(c, y, p - dp, f)) return { f, p: p - dp };
      }
    }
    return { f: 22, p };
  }

  function posiciona(c, y0) {
    const o = CENAS[c].olhar;
    const y = y0 === undefined ? o.yaw : y0;
    const a = ajusta(c, y, o.pitch);
    const f = a.f < fovBase(c) - 0.5 && !CENAS[c].abertura ? a.f * 0.95 : a.f;
    fov = alvoFov = f;
    yaw = alvoYaw = y;
    pitch = alvoPitch = a.p;
  }

  function ajustaTela() {
    const novoW = palco.clientWidth,
      novoH = palco.clientHeight;
    if (!novoW || !novoH) return;
    const mudouForma = Math.abs(novoW / novoH - aspecto) > 0.02;
    cw = novoW;
    ch = novoH;
    aspecto = cw / ch;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const limite = toque ? 1.7e6 : 3e6;
    const fator = Math.sqrt(Math.min(1, limite / (cw * ch * dpr * dpr)));
    canvas.width = Math.round(cw * dpr * fator);
    canvas.height = Math.round(ch * dpr * fator);
    medeBarra();
    if (!iniciado) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (mudouForma) {
      retorno = null;
      lento = false;
      fechaCartao();
      const cabe = dentro(cena, yaw, CENAS[cena].olhar.pitch, 22);
      posiciona(cena, cabe ? yaw : undefined);
    }
  }

  // Marcadores não ficam atrás da barra quando ela está sobre a imagem
  let margemBarra = 24;
  const barra = raiz.querySelector(".tour-bar");
  function medeBarra() {
    margemBarra = getComputedStyle(barra).position === "absolute" ? barra.offsetHeight + 34 : 24;
  }

  /* ---------- Movimento: para na borda da foto ---------- */
  function ate(yDe, yPara, teste) {
    if (teste(yPara)) return yPara;
    let a = yDe,
      b = yPara;
    for (let i = 0; i < 10; i++) {
      const m = (a + b) / 2;
      if (teste(m)) a = m;
      else b = m;
    }
    return a;
  }

  function gira(dYaw, dPitch) {
    const y = ate(alvoYaw, alvoYaw + dYaw, (v) => dentro(cena, v, alvoPitch, alvoFov));
    if (Math.abs(y - (alvoYaw + dYaw)) > 1e-3) velYaw = 0;
    alvoYaw = y;
    const p = ate(alvoPitch, alvoPitch + dPitch, (v) => dentro(cena, alvoYaw, v, alvoFov));
    if (Math.abs(p - (alvoPitch + dPitch)) > 1e-3) velPitch = 0;
    alvoPitch = p;
  }

  /* ---------- Troca de vista: só pelos botões, escurecendo a sala ---------- */
  function irPara(nova) {
    if (!iniciado || (fase === 0 && nova === cena)) return;
    destino = nova;
    if (fase === 0) fase = 1;
    retorno = null;
    lento = false;
    fechaCartao();
    marcaBotoes(nova);
  }

  async function troca() {
    fase = 2;
    const de = cena,
      nova = destino;
    try {
      await garante(nova);
    } catch (e) {
      destino = null;
      marcaBotoes(cena);
      avisa("Não foi possível carregar esta vista. Verifique a conexão e tente de novo.");
      fase = 3;
      return;
    }
    cena = nova;
    destino = null;
    velYaw = velPitch = 0;
    ligaCena(cena);
    posiciona(cena);
    if (toque && de !== cena) solta(de);
    fase = 3;
  }

  /* ---------- Quadro: só roda com a seção visível ou maximizada ---------- */
  let ult = 0,
    rodando = false,
    visivel = false;

  function acorda() {
    if (!iniciado || rodando) return;
    rodando = true;
    ult = 0;
    requestAnimationFrame(quadro);
  }

  function quadro(agora) {
    if (!(visivel || maximizado) || document.hidden || !gl || gl.isContextLost()) {
      rodando = false;
      return;
    }
    const real = ult ? (agora - ult) / 1000 : 0.016;
    const dt = Math.min(0.05, real);
    ult = agora;
    const f = lento ? 1 - Math.exp(-Math.min(0.1, real) * 3.2) : 1 - Math.exp(-dt * 11);
    if (
      lento &&
      Math.abs(alvoFov - fov) < 0.04 &&
      Math.abs(alvoYaw - yaw) < 0.04 &&
      Math.abs(alvoPitch - pitch) < 0.04
    )
      lento = false;

    if (!arrasto && (Math.abs(velYaw) > 0.002 || Math.abs(velPitch) > 0.002)) {
      gira(velYaw * dt * 60, velPitch * dt * 60);
      const atrito = Math.exp(-dt * 5);
      velYaw *= atrito;
      velPitch *= atrito;
    }

    aplicaGiro();

    yaw += (alvoYaw - yaw) * f;
    pitch += (alvoPitch - pitch) * f;
    fov += (alvoFov - fov) * f;
    pmx += (mx - pmx) * (1 - Math.exp(-dt * 4));
    pmy += (my - pmy) * (1 - Math.exp(-dt * 4));
    luz += (luzAlvo - luz) * (1 - Math.exp(-Math.min(0.2, real) * 2.4));

    if (fase === 1) {
      brilho = Math.max(0, brilho - Math.min(0.1, real) / 0.26);
      if (brilho === 0) troca();
    } else if (fase === 3) {
      brilho = Math.min(1, brilho + Math.min(0.1, real) / 0.5);
      if (brilho === 1) {
        fase = 0;
        if (destino && destino !== cena) fase = 1;
        else destino = null;
      }
    }

    const ty = meiaAltura(fov);
    const cy = Math.cos(yaw * RAD),
      sy = Math.sin(yaw * RAD);
    const ex = pmx * AJUSTE.paralaxe,
      ey = pmy * AJUSTE.paralaxe * 0.5;
    gl.uniform2f(U.tanV, ty * aspecto, ty);
    gl.uniform2f(U.giro, cy, sy);
    gl.uniform1f(U.desloc, Math.tan(pitch * RAD));
    gl.uniform3f(U.par, cy * ex, ey, -sy * ex);
    gl.uniform1f(U.luz, luz);
    gl.uniform1f(U.brilho, suave(brilho));
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    posicionaPontos(ty);
    requestAnimationFrame(quadro);
  }

  /* ---------- Pontos de interesse ---------- */
  const elementos = [];
  for (const [c, dados] of Object.entries(CENAS)) {
    for (const p of dados.pontos) {
      const b = document.createElement("button");
      b.className = "tour-point";
      b.type = "button";
      b.innerHTML = "<b></b><span></span>";
      b.lastChild.textContent = p.titulo;
      b.setAttribute("aria-label", p.titulo);
      b.hidden = true;
      b.addEventListener("click", () => abreCartao(p, b));
      caixaPontos.append(b);
      elementos.push({ c, b, lon: p.lon * RAD, lat: p.lat * RAD });
    }
  }

  function posicionaPontos(ty) {
    const tx = ty * aspecto,
      s = Math.tan(pitch * RAD),
      D = CENAS[cena].panini;
    const fundo = margemBarra;
    for (const e of elementos) {
      if (e.c !== cena || fase !== 0 || retorno) {
        e.b.hidden = true;
        continue;
      }
      const l = e.lon - yaw * RAD;
      if (Math.abs(l) > 1.5) {
        e.b.hidden = true;
        continue;
      }
      const S = (D + 1) / (D + Math.cos(l));
      const sx = ((S * Math.sin(l)) / tx) * 0.5 * cw + cw * 0.5;
      const sy = ((S * Math.tan(e.lat) - s) / ty) * 0.5 * ch + ch * 0.5;
      if (sx < 24 || sy < 24 || sx > cw - 24 || sy > ch - fundo) {
        e.b.hidden = true;
        continue;
      }
      e.b.hidden = false;
      e.b.style.transform = `translate(${sx | 0}px,${sy | 0}px)`;
      if (e.b === ancora) posicionaCartao(sx, sy);
    }
  }

  // Cartões sem zoom (tela, quadro) aparecem ao lado do ponto clicado
  let ancora = null;
  function posicionaCartao(x, y) {
    const m = 12,
      gap = 34,
      w = cartao.offsetWidth,
      h = cartao.offsetHeight;
    let left, top;
    if (cw <= 650) {
      // Celular em pé: largura cheia, logo abaixo ou acima do ponto
      left = m;
      top = y + gap + h <= ch - m ? y + gap : y - gap - h;
      cartao.style.width = `${cw - 2 * m}px`;
    } else {
      left = x + gap + w <= cw - m ? x + gap : x - gap - w;
      top = y - h / 2;
    }
    left = clamp(left, m, Math.max(m, cw - w - m));
    top = clamp(top, m, Math.max(m, ch - h - m));
    cartao.style.left = `${left | 0}px`;
    cartao.style.top = `${top | 0}px`;
  }

  /* ---------- Cartão e zoom na escultura ---------- */
  const cartao = raiz.querySelector(".tour-card");

  // Vai até o objeto com um zoom suave, deixando espaço para o cartão
  function focar(alvo) {
    if (!retorno) retorno = { yaw: alvoYaw, pitch: alvoPitch, fov: alvoFov };
    const f = Math.max(24, retorno.fov / alvo.zoom);
    const largo = cw > 760 && aspecto >= 1;
    const y = alvo.lon + (largo ? f * aspecto * 0.13 : 0);
    const p = alvo.lat + (largo ? 0 : f * 0.14);
    alvoFov = f;
    alvoYaw = ate(alvoYaw, y, (v) => dentro(cena, v, alvoPitch, f));
    alvoPitch = ate(alvoPitch, p, (v) => dentro(cena, alvoYaw, v, f));
    velYaw = velPitch = 0;
    lento = true;
  }

  function abreCartao(p, botao) {
    if (ancora) ancora.classList.remove("is-open");
    ancora = p.foco || p.historia || p.bandeiras ? null : botao || null;
    if (ancora) ancora.classList.add("is-open"); // o nome do ponto fica escondido enquanto o cartão está aberto
    cartao.classList.toggle("is-anchored", !!ancora);
    cartao.style.left = cartao.style.top = cartao.style.width = "";
    const h = p.historia;
    const rotulo = cartao.querySelector(".tour-card-label");
    rotulo.textContent = h ? "Escultura" : p.rotulo || "";
    rotulo.hidden = !rotulo.textContent;
    const lista = cartao.querySelector(".tour-flags");
    lista.replaceChildren();
    lista.hidden = !p.bandeiras;
    (p.bandeiras || []).forEach((b) => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      img.src = b.img;
      img.alt = `Bandeira de ${b.nome}`;
      img.width = 50;
      img.height = 35;
      const txt = document.createElement("div");
      const nome = document.createElement("strong");
      nome.textContent = b.nome;
      const desc = document.createElement("span");
      desc.textContent = b.texto;
      txt.append(nome, desc);
      li.append(img, txt);
      lista.append(li);
    });
    cartao.classList.toggle("has-flags", !!p.bandeiras);
    cartao.querySelector("h3").textContent = h ? h.nome : p.titulo;
    cartao.querySelector("p").textContent = h ? h.resumo : p.texto;
    botaoHistoria.hidden = !h;
    usou();
    cartao.dataset.fechado = "false";
    if (p.foco) focar(p.foco);
  }

  function fechaCartao() {
    cartao.dataset.fechado = "true";
    if (ancora) ancora.classList.remove("is-open");
    ancora = null;
    if (retorno) {
      alvoYaw = retorno.yaw;
      alvoPitch = retorno.pitch;
      alvoFov = retorno.fov;
      retorno = null;
      lento = true;
    }
  }
  raiz.querySelector(".tour-card-close").addEventListener("click", fechaCartao);

  /* História completa da escultura, em uma tela de leitura */
  const botaoHistoria = raiz.querySelector(".tour-story-open");
  const historia = raiz.querySelector(".tour-story");
  historia.querySelector("h2").textContent = ESCULTURA.nome;
  ESCULTURA.texto.forEach((par) => {
    const p = document.createElement("p");
    p.textContent = par;
    historia.querySelector(".tour-story-text").append(p);
  });
  botaoHistoria.addEventListener("click", () => {
    historia.showModal();
    historia.querySelector(".tour-story-body").scrollTop = 0;
    body.classList.add("dialog-open");
  });
  historia.querySelector(".tour-story-close").addEventListener("click", () => historia.close());
  historia.addEventListener("click", (e) => {
    if (e.target === historia) historia.close();
  });
  historia.addEventListener("close", () => {
    if (!maximizado) body.classList.remove("dialog-open");
  });

  /* Fotos de outros ângulos, no mesmo visual da galeria do site */
  const foto = raiz.querySelector(".tour-lightbox");
  const fotoImg = foto.querySelector(".lightbox-image");
  let fotoAtual = 0;

  function mostraFoto(i) {
    fotoAtual = (i + FOTOS_ESCULTURA.length) % FOTOS_ESCULTURA.length;
    const f = FOTOS_ESCULTURA[fotoAtual];
    fotoImg.src = f.src;
    fotoImg.alt = f.alt;
    foto.querySelector(".lightbox-caption").textContent = ESCULTURA.nome;
    foto.querySelector(".lightbox-counter").textContent =
      `${String(fotoAtual + 1).padStart(2, "0")} / ${String(FOTOS_ESCULTURA.length).padStart(2, "0")}`;
  }
  raiz.querySelectorAll(".tour-thumbs button").forEach((b, i) =>
    b.addEventListener("click", () => {
      mostraFoto(i);
      foto.showModal();
      body.classList.add("dialog-open");
      foto.querySelector(".lightbox-close").focus();
    }),
  );
  foto.querySelector(".lightbox-close").addEventListener("click", () => foto.close());
  foto.addEventListener("close", () => {
    if (!maximizado && !historia.open) body.classList.remove("dialog-open");
  });
  foto.querySelector(".lightbox-prev").addEventListener("click", () => mostraFoto(fotoAtual - 1));
  foto.querySelector(".lightbox-next").addEventListener("click", () => mostraFoto(fotoAtual + 1));
  let origemToque = null;
  foto.addEventListener(
    "touchstart",
    (e) => {
      origemToque = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    },
    { passive: true },
  );
  foto.addEventListener(
    "touchend",
    (e) => {
      if (!origemToque || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - origemToque.x,
        dy = e.changedTouches[0].clientY - origemToque.y;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) mostraFoto(fotoAtual + (dx < 0 ? 1 : -1));
      origemToque = null;
    },
    { passive: true },
  );
  foto.addEventListener("click", (e) => {
    if (e.target === foto || e.target.classList.contains("lightbox-stage")) foto.close();
  });
  foto.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
      mostraFoto(fotoAtual + (e.key === "ArrowLeft" ? -1 : 1));
    }
  });

  /* ---------- Botões ---------- */
  const botoes = [...raiz.querySelectorAll("[data-cena]")];
  botoes.forEach((b) => b.addEventListener("click", () => irPara(b.dataset.cena)));
  function marcaBotoes(c) {
    botoes.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cena === c)));
  }

  // O LED só muda por este botão
  const botaoLuz = raiz.querySelector(".tour-led");
  function ligaLuz(ligada) {
    luzAlvo = ligada ? 1 : 0;
    botaoLuz.setAttribute("aria-pressed", String(ligada));
  }
  botaoLuz.addEventListener("click", () => ligaLuz(luzAlvo < 0.5));

  /* ---------- Maximizar ---------- */
  const botaoMax = raiz.querySelector(".tour-max");
  let maximizado = false;

  async function maximiza(ativo) {
    if (ativo === maximizado) return;
    maximizado = ativo;
    raiz.classList.toggle("is-max", ativo);
    body.classList.toggle("dialog-open", ativo);
    botaoMax.setAttribute("aria-label", ativo ? "Reduzir a visita" : "Maximizar a visita");
    botaoMax.querySelector("use").setAttribute("href", ativo ? "#shrink" : "#expand");
    botaoMax.querySelector("span").textContent = ativo ? "Reduzir" : "Maximizar";
    botaoGiro.hidden = !(ativo && temSensor);
    if (ativo) {
      if (querGiro) pedeGiro().then(ligaGiro);
    } else {
      desligaGiro();
    }
    ajustaTela();
    acorda();
    atualizaDica();

    const pedir = raiz.requestFullscreen || raiz.webkitRequestFullscreen;
    const sair = document.exitFullscreen || document.webkitExitFullscreen;
    const atual = () => document.fullscreenElement || document.webkitFullscreenElement;
    try {
      if (ativo) {
        // Sem esse recurso (iPhone), a visita ocupa toda a área da página
        if (pedir) await pedir.call(raiz, { navigationUI: "hide" });
        if (toque && screen.orientation && screen.orientation.lock) await screen.orientation.lock("landscape");
      } else {
        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
        if (atual()) await sair.call(document);
      }
    } catch (e) {
      /* o aparelho pode recusar; a página segue normal */
    }
    canvas.focus({ preventScroll: true });
  }
  botaoMax.addEventListener("click", () => {
    maxAutomatico = false;
    maximiza(!maximizado);
  });
  ["fullscreenchange", "webkitfullscreenchange"].forEach((n) =>
    document.addEventListener(n, () => {
      if (!(document.fullscreenElement || document.webkitFullscreenElement) && maximizado) maximiza(false);
    }),
  );

  /* ---------- Mover com o celular: usa o giroscópio, só com a visita maximizada ----------
     Soma apenas o quanto o aparelho girou desde a última leitura. Assim, não importa
     para onde a pessoa está virada, e ao chegar na borda da foto a imagem só para. */
  const botaoGiro = raiz.querySelector(".tour-gyro");
  const temSensor = toque && "DeviceOrientationEvent" in window;
  const pedePermissao = temSensor && typeof DeviceOrientationEvent.requestPermission === "function"; // iPhone
  let querGiro = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  let permitido = !pedePermissao;
  let giroLigado = false,
    recebeuDados = false,
    esperaDados = 0,
    dicaGiroVista = false,
    dicaAgora = "",
    esperaDica = 0;
  let frente = null,
    rumo = null,
    inclinacao = null,
    giroYaw = 0,
    giroPitch = 0;

  function aoGirar(e) {
    if (e.alpha === null || e.beta === null || e.gamma === null) return;
    if (!recebeuDados) {
      recebeuDados = true;
      clearTimeout(esperaDados);
      if (!dicaGiroVista) {
        dicaGiroVista = true;
        dicaRapida("Mexa o celular para olhar em volta");
      }
    }
    // Para onde a traseira do aparelho aponta: leste, norte e alto
    const ca = Math.cos(e.alpha * RAD),
      sa = Math.sin(e.alpha * RAD),
      cb = Math.cos(e.beta * RAD),
      sb = Math.sin(e.beta * RAD),
      cg = Math.cos(e.gamma * RAD),
      sg = Math.sin(e.gamma * RAD);
    const novo = [-ca * sg - sa * sb * cg, -sa * sg + ca * sb * cg, -cb * cg];
    if (frente) frente = frente.map((v, i) => v + (novo[i] - v) * 0.4); // filtra o tremor do sensor
    else frente = novo;

    const [x, y, z] = frente;
    const plano = Math.hypot(x, y);
    const r = Math.atan2(x, y) / RAD;
    const i = -Math.atan2(z, plano) / RAD; // na visita, positivo é olhar para baixo
    // Apontando quase para o chão ou o teto, o rumo fica instável e é ignorado
    if (rumo !== null && plano > 0.3) giroYaw += ((r - rumo + 540) % 360) - 180;
    if (inclinacao !== null) giroPitch += i - inclinacao;
    rumo = r;
    inclinacao = i;
  }

  function aplicaGiro() {
    if (!giroLigado) return;
    if (arrasto || retorno || lento || fase !== 0) {
      giroYaw = giroPitch = 0;
      return;
    }
    if (Math.abs(giroYaw) < 0.03 && Math.abs(giroPitch) < 0.03) return;
    gira(giroYaw, giroPitch);
    giroYaw = giroPitch = 0;
  }

  async function pedeGiro(avisar) {
    if (permitido || !temSensor) return;
    try {
      permitido = (await DeviceOrientationEvent.requestPermission()) === "granted";
    } catch (e) {
      permitido = false; // sem toque na tela, o iPhone não deixa perguntar
    }
    if (!permitido && avisar) dicaRapida("O navegador não permitiu usar o movimento");
  }

  function ligaGiro() {
    if (giroLigado || !permitido || !maximizado || !querGiro) return;
    giroLigado = true;
    recebeuDados = false;
    frente = rumo = inclinacao = null;
    giroYaw = giroPitch = 0;
    addEventListener("deviceorientation", aoGirar);
    botaoGiro.setAttribute("aria-pressed", "true");
    // Aparelho sem giroscópio ou página sem HTTPS: não chega nenhuma leitura
    esperaDados = setTimeout(() => {
      if (recebeuDados) return;
      desligaGiro();
      botaoGiro.hidden = true;
    }, 1800);
  }

  function desligaGiro() {
    giroLigado = false;
    clearTimeout(esperaDados);
    removeEventListener("deviceorientation", aoGirar);
    botaoGiro.setAttribute("aria-pressed", "false");
  }

  botaoGiro.addEventListener("click", () => {
    if (giroLigado) {
      querGiro = false;
      desligaGiro();
    } else {
      querGiro = true;
      pedeGiro(true).then(ligaGiro);
    }
  });

  function dicaRapida(texto) {
    dicaAgora = texto;
    atualizaDica();
    clearTimeout(esperaDica);
    esperaDica = setTimeout(() => {
      dicaAgora = "";
      atualizaDica();
    }, 4000);
  }

  // Celular deitado com a visita na tela: ela ocupa tudo sozinha, e volta ao ficar em pé
  let maxAutomatico = false,
    metadeNaTela = false;
  const deitado = matchMedia("(orientation: landscape) and (max-height: 500px)");
  deitado.addEventListener("change", (e) => {
    if (!toque || !iniciado) return;
    if (e.matches && !maximizado) {
      // Vale o que estava na tela antes de girar: depois do giro a página muda de altura
      if (metadeNaTela) {
        maxAutomatico = true;
        maximiza(true);
      }
    } else if (!e.matches && maxAutomatico) {
      maxAutomatico = false;
      maximiza(false);
      requestAnimationFrame(() => palco.scrollIntoView({ block: "center", behavior: "instant" }));
    }
  });

  let tocou = false;
  function atualizaDica() {
    if (dicaAgora && maximizado) {
      dica.textContent = dicaAgora;
      dica.hidden = false;
      return;
    }
    if (toque && maximizado && aspecto < 1) {
      dica.textContent = "Deite o celular para ver mais da sala";
      dica.hidden = false;
      return;
    }
    dica.textContent = toque ? "Arraste para os lados" : "Arraste para olhar em volta";
    dica.hidden = tocou;
  }

  function avisa(texto) {
    aviso.textContent = texto;
    aviso.hidden = !texto;
  }

  /* ---------- Arrastar, zoom, teclado ---------- */
  let arrasto = null,
    ultimoMov = 0,
    pinca = 0,
    arrastou = 0;
  const toques = new Map();

  const usou = () => {
    if (!tocou) {
      tocou = true;
      atualizaDica();
    }
  };

  canvas.addEventListener("pointerdown", (e) => {
    if (!iniciado) return;
    canvas.setPointerCapture(e.pointerId);
    toques.set(e.pointerId, e);
    // Cartões sem zoom somem com qualquer toque na sala, de clique ou de arrasto
    if (ancora && cartao.dataset.fechado === "false") fechaCartao();
    arrasto = { x: e.clientX, y: e.clientY };
    velYaw = velPitch = 0;
    arrastou = 0;
    lento = false;
    canvas.classList.add("is-grabbing");
    usou();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") {
      const r = canvas.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    if (!arrasto) return;
    toques.set(e.pointerId, e);

    if (toques.size === 2) {
      const [a, b] = [...toques.values()];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (pinca) zoom((pinca - d) * 0.09);
      pinca = d;
      arrastou += 10;
      arrasto = { x: e.clientX, y: e.clientY };
      return;
    }
    const dx = e.clientX - arrasto.x,
      dy = e.clientY - arrasto.y;
    arrastou += Math.abs(dx) + Math.abs(dy);
    arrasto = { x: e.clientX, y: e.clientY };
    const k = alvoFov / ch;
    velYaw = -dx * k * 0.9;
    velPitch = -dy * k * 0.6;
    ultimoMov = performance.now();
    gira(velYaw, velPitch);
  });

  canvas.addEventListener("pointerleave", () => {
    mx = my = 0;
  });

  const soltaDedo = (e) => {
    toques.delete(e.pointerId);
    pinca = 0;
    if (toques.size) {
      const [r] = toques.values();
      arrasto = { x: r.clientX, y: r.clientY };
      return;
    }
    if (!arrasto) return;
    arrasto = null;
    canvas.classList.remove("is-grabbing");
    if (performance.now() - ultimoMov > 80) velYaw = velPitch = 0;
    // Um toque fecha o cartão; com zoom na escultura ou nas bandeiras, arrastar e soltar também sai do zoom
    if (e.type === "pointerup" && (arrastou < 6 || retorno)) fechaCartao();
  };
  canvas.addEventListener("pointerup", soltaDedo);
  canvas.addEventListener("pointercancel", soltaDedo);

  function zoom(d) {
    const f = clamp(alvoFov + d, 26, fovBase(cena));
    if (dentro(cena, alvoYaw, alvoPitch, f)) alvoFov = f;
  }

  // Na página, a roda do mouse continua rolando o site; o zoom é só com a visita maximizada
  canvas.addEventListener(
    "wheel",
    (e) => {
      if (!maximizado || !iniciado) return;
      e.preventDefault();
      zoom(e.deltaY * 0.025);
      usou();
    },
    { passive: false },
  );

  raiz.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (foto.open || historia.open) return;
      if (cartao.dataset.fechado === "false") fechaCartao();
      else if (maximizado) maximiza(false);
      return;
    }
    if (e.target !== canvas || !iniciado) return;
    const passo = { ArrowLeft: [-4, 0], ArrowRight: [4, 0] }[e.key];
    const vertical = { ArrowUp: [0, -2.5], ArrowDown: [0, 2.5] }[e.key];
    // Na página, as setas para cima e para baixo continuam rolando o site
    const p = passo || (maximizado && vertical);
    if (p) {
      gira(p[0], p[1]);
      usou();
      e.preventDefault();
    }
  });

  /* ---------- Início: carrega só quando a seção está chegando na tela ---------- */
  new ResizeObserver(ajustaTela).observe(palco);

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    raiz.classList.remove("is-ready");
  });
  canvas.addEventListener("webglcontextrestored", async () => {
    Object.keys(tex).forEach((c) => delete tex[c]);
    Object.keys(baixando).forEach((c) => delete baixando[c]);
    preparaGL();
    await garante(cena);
    ligaCena(cena);
    gl.viewport(0, 0, canvas.width, canvas.height);
    raiz.classList.add("is-ready");
    acorda();
  });

  async function inicia() {
    const opcoes = { antialias: false, alpha: false, powerPreference: "high-performance" };
    gl = canvas.getContext("webgl2", opcoes) || canvas.getContext("webgl", opcoes);
    if (!gl) {
      raiz.classList.add("no-webgl");
      avisa("Seu navegador não permite a visita interativa. A foto mostra o auditório.");
      return;
    }
    try {
      preparaGL();
      for (const c of Object.keys(CENAS)) {
        const img = await carrega(PROF[c]);
        const k = document.createElement("canvas");
        k.width = img.width;
        k.height = img.height;
        const x = k.getContext("2d", { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        mapa[c] = { w: img.width, h: img.height, d: x.getImageData(0, 0, img.width, img.height).data };
      }
      await garante("A");
    } catch (e) {
      raiz.classList.add("no-webgl");
      avisa("Não foi possível carregar a visita. Verifique a conexão e recarregue a página.");
      return;
    }
    ajustaTela();
    posiciona("A");
    iniciado = true;
    gl.viewport(0, 0, canvas.width, canvas.height);
    ligaCena("A");
    marcaBotoes("A");
    brilho = 1;
    raiz.classList.add("is-ready");
    atualizaDica();
    acorda();
    if (!toque) {
      garante("B").catch(() => {});
      garante("C").catch(() => {});
    }
  }

  // A visita fica no topo: espera as cortinas abrirem para não travar a animação
  function depoisDaCortina() {
    if (document.getElementById("opening-curtains")) setTimeout(depoisDaCortina, 200);
    else inicia();
  }

  let comecou = false;
  new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !comecou) {
        comecou = true;
        depoisDaCortina();
      }
    },
    { rootMargin: "500px 0px" },
  ).observe(raiz);

  new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    if (visivel) acorda();
  }).observe(raiz);

  new IntersectionObserver(
    ([e]) => {
      metadeNaTela = e.intersectionRatio >= 0.5;
    },
    { threshold: [0, 0.5] },
  ).observe(palco);

  document.addEventListener("visibilitychange", acorda);
})();
