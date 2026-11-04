# Auditório Dr. Wolfgang Jorge Coelho

Nova página de homenagem, responsiva e com prioridade para celular. HTML, CSS e JavaScript sem dependências de execução ou etapa de compilação. O conteúdo que vai ao servidor está em `dist/`.

## Abrir e publicar

Abra `dist/index.html` no navegador, ou sirva a pasta `dist/` por um servidor HTTP estático. Na hospedagem existente, copie o conteúdo de `dist/` para a raiz do site. Não copie a pasta `.git` ou os metadados `.openai` para o domínio existente.

Na Vercel, basta importar este repositório: o `vercel.json` já aponta para `dist/`, sem etapa de compilação.

A publicação de prévia pelo Sites usa o identificador em `.openai/hosting.json` e mantém acesso privado. O domínio original não foi modificado.

## Arquivos

- `index.html`: textos, ordem das seções, referências às fotografias e estrutura da visita ao auditório.
- `styles.css`: cores em `:root`, tipografia, layouts e pontos de adaptação de tela em 1200, 900, 650 e 359 px.
- O cabeçalho ocupa toda a largura disponível; seu conteúdo não herda o limite de 1600 px das demais seções. A linha inferior também vai de ponta a ponta.
- A abertura usa um trecho real do tecido do auditório, comprimido em tempo real no canvas, com a abertura central da cortina verdadeira. Pausa de 0,7 s e abertura de 3,8 s (cerca de 5 s até liberar a página). O botão “Pular abertura”, a limpeza da animação e o respeito a movimento reduzido são integrações do site.
- `curtain.js`: cortina em canvas, sem dependências externas. O tecido fica embutido em base64 e os tempos em `CONFIG`.
- `tour.js`: visita interativa da seção 02, em WebGL, sem dependências. Textos e marcadores ficam em `CENAS`; abertura da imagem e paralaxe, em `AJUSTE`. As Luzes de LED só mudam pelo botão, e a troca de vista só pelos botões.
- `app.js`: menu móvel, abas, filtros, galeria ampliada por teclado ou gesto e progresso de leitura.
- `fonts.css` e `assets/`: fontes hospedadas localmente, licenças e fotografias restauradas em WebP. Em `assets/tour/` ficam as fotos da visita: cada vista tem a versão completa e a `-leve`, usada em celulares. Elas estão em arquivos `.js` com base64 porque o WebGL não aceita imagens de arquivos locais, e assim o site também funciona aberto direto do disco.

## Conteúdo e acervo

Fonte consultada em 30/10/2026: https://auditorio.cartoriomorrinhos.com.br/ . Fotos, marca e vídeo pertencem ao acervo do site de origem. A pedido do usuário, as sete fotografias e a capa do vídeo passaram por restauração com ImageGen, para melhorar definição, iluminação e artefatos de compressão. A restauração generativa pode reconstruir pequenos detalhes; os arquivos de origem foram preservados separadamente em `outputs/imagens-originais/`.

Os arquivos `*-hd.webp` das fotografias são exportações sem perdas dos resultados restaurados. Variantes em 600 e 1000 px, quando pertinentes, são escolhidas automaticamente por `srcset` conforme a tela e sua densidade. O lightbox usa `data-full` para abrir a versão integral, independentemente da miniatura exibida. O retrato mantém transparência e escala de cinza.

O original divergia entre “48 anos” e “mais de três décadas”; a nova redação evita fixar esse número. O vídeo de apresentação do auditório foi substituído pela visita interativa, feita com fotos do próprio espaço.

Para trocar uma fotografia, atualize `src`, `srcset`, `sizes`, `data-full`, dimensões, texto alternativo e legenda no HTML; o lightbox lê esses dados automaticamente.

A visita ocupa a tela de ponta a ponta. No celular em pé, os controles ficam logo abaixo da imagem; ao deitar o aparelho com a visita na tela, ela maximiza sozinha e volta ao ficar em pé.

Com a visita maximizada no celular, também é possível olhar em volta mexendo o aparelho. Isso usa o sensor de orientação, que exige HTTPS; no iPhone, o navegador pede permissão ao tocar em Maximizar. O botão com o ícone de celular liga e desliga o recurso, e ele some em aparelhos sem giroscópio.

A visita só começa a carregar quando a seção se aproxima da tela e para de desenhar quando sai dela. Na página, o gesto vertical e a roda do mouse continuam rolando o site; com a visita maximizada, servem para olhar para cima e para baixo e para o zoom. Sem WebGL ou sem JavaScript, aparece `assets/auditorio-visita.webp`.

## Acessibilidade e desempenho

Menu com estado anunciado, abas com navegação por setas, foco visível, link para pular conteúdo, dialog nativo com retorno do foco, navegação do lightbox por setas/Esc e gesto horizontal, visita navegável por setas com Esc para sair, respeito a `prefers-reduced-motion`, imagens posteriores sob demanda e fontes locais. Controles utilizáveis por toque. O conteúdo principal permanece disponível sem JavaScript.
