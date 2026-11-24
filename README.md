# Infinity Memory ∞

Flashcards com **repetição espaçada** (no estilo do Anki), mais visual, moderno e prático, feito para o celular.

**Abrir o app:** https://biel1412.github.io/infinity-memory/

## O que dá para colocar num card

Cada lado (frente e verso) aceita vários blocos, na ordem que você quiser:

- 📝 **Texto**: com `**negrito**`, `*itálico*`, `==destaque==` e `` `código` ``, além de um botão para **ouvir em voz alta** no idioma do baralho
- 🖼️ **Imagem**: câmera, galeria ou colar (Ctrl+V no computador); toque para ampliar
- 🎙️ **Áudio**: gravado na hora (com visualização da onda) ou enviado como arquivo; pode tocar sozinho ao aparecer
- ⌨️ **Código**: realce de sintaxe para JavaScript, TypeScript, Python, Java, Kotlin, C/C++, C#, Go, Rust, PHP, SQL, HTML, CSS, Bash e JSON, com números de linha e botão de copiar

## Estudo

- Botões **Errei / Difícil / Bom / Fácil**, cada um mostrando quando o card volta
- Card que **vira em 3D**: toque para ver a resposta e **deslize** ← para errei ou → para bom
- **Desfazer** a última resposta
- Atalhos de teclado no computador: espaço revela a resposta, e as teclas 1 a 4 respondem
- Limite de cards novos por dia (geral ou por baralho)

## Organização e progresso

- **Seções** para organizar os baralhos (ex.: Idiomas, Faculdade, Trabalho): recolha, reordene e estude a seção inteira com um toque
- Baralhos com ícone, cor e idioma de leitura
- “Salvar e +1” para criar muitos cards em sequência, e opção de gerar o card **invertido**
- **Importar lista**: cole `frente ; verso` por linha, ou dados copiados do Excel/Planilhas
- Busca em todos os cards
- Progresso: sequência de dias 🔥, retenção, revisões por dia, previsão dos próximos 7 dias, cards dominados e mapa de constância
- Tema escuro, claro ou automático
- **Backup** completo (com imagens e áudios) em `.json`
- Funciona **offline** e pode ser instalado na tela inicial

## Algoritmo

Variante do SM-2 usada pelo Anki. Etapas de aprendizado de 1 e 10 min; depois do aprendizado, os intervalos começam em 1 dia (4 dias com “Fácil”). O fator de facilidade começa em 250% e muda com cada resposta. Quem erra uma revisão volta a reaprender por 10 minutos.

## Desenvolvimento

App estático, sem etapa de build:

```bash
python3 -m http.server 8080
```

```
index.html          estrutura
css/app.css         visual (temas escuro/claro)
js/db.js            IndexedDB (baralhos, cards, histórico, mídias)
js/srs.js           repetição espaçada
js/highlight.js     realce de sintaxe offline
js/app.js           telas, editor, estudo e estatísticas
sw.js               cache offline
```
