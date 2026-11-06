# VozKriolu Studio · Lab 1 (M7 · Engenharia de IA · Skodji Digital)

Aplicação web (PWA) para **gravar uma sessão de áudio, guardá-la no próprio aparelho, transcrevê-la para crioulo de Cabo Verde, exportar em PDF e preparar o envio por e-mail.**
Autor: André Sanches. Interfaces desenhadas no **Stitch**; app desenvolvida no **Google AI Studio** (requisitos próprios e prompts sucessivos). Esta pasta é a versão **estática e instalável (PWA)**, ajustada a partir do código que o AI Studio gerou, com assistência de IA (Claude Code): acrescentou-se o manifesto, o service worker e os ícones, e o gerador de PDF passou a vir incluído.

**Não precisa de servidor, de Node.js nem de instalar pacotes.** É só HTML, CSS e JavaScript.

## Como usar

1. **Num endereço https (recomendado, e o único que permite instalar no telemóvel).** Se a app estiver publicada, abra o endereço no Chrome ou Edge.
2. **No computador, a partir desta pasta:** duplo clique em **`INICIAR.bat`** (precisa de Python 3). Abre `http://localhost:8080`. Mac/Linux: `sh iniciar.sh`.
3. **Duplo clique em `index.html`:** abre, mas alguns navegadores bloqueiam o microfone e a instalação (PWA) em ficheiros locais. Prefira 1 ou 2.

## Instalar como app (PWA)
- **Android/Chrome:** menu ⋮ → «Instalar app» (ou «Adicionar ao ecrã principal»).
- **iPhone/Safari:** Partilhar → «Adicionar ao ecrã principal».
- **Computador (Chrome/Edge):** ícone de instalar na barra de endereços.
Depois de aberta uma vez, a app abre mesmo **sem Internet** (gravar, repositório, PDF); a **transcrição** precisa de Internet.

## Chave da Gemini (para a transcrição)
Carregue em **«Chave IA»** (cabeçalho) e cole a sua chave (grátis no Google AI Studio → «Get API key»). A chave fica **só neste aparelho** (localStorage) e é enviada apenas à Google. **Não vem no zip.** Sem chave, o resto funciona. **Quem quiser testar a transcrição tem de usar a sua própria chave** (grátis, leva um minuto a criar); gravar, repositório, PDF e e-mail funcionam sem ela.

## O que foi testado
- Versão no AI Studio (6/11/2026): gravar com o microfone, guardar e listar no Repositório, transcrever para crioulo (com repetição e modelo alternativo quando o serviço está ocupado), exportar PDF, preparar o e-mail no Gmail (enviado e recebido), mensagem clara quando falta a chave.
- Esta versão PWA, no Edge: o service worker fica ativo, 10 ficheiros ficam em cache e a app **abre com o servidor parado**; o gerador de PDF carrega do ficheiro local; o botão «Chave IA» mostra «Sem chave» quando não há chave.
- **Não testado nesta versão PWA:** instalar num telemóvel real, o microfone e a transcrição (o código é o mesmo da versão do AI Studio, que foi testada).

## Limites conhecidos (declarados)
- O crioulo é um **rascunho de IA** que precisa de revisão humana (o reconhecimento pode errar palavras, nomes e números).
- A transcrição depende de Internet, da chave e do estado do serviço da Gemini (a app tenta outra vez e usa um modelo alternativo). Cada pedido tem um **tempo-limite de 45 s**: se o modelo principal não responde, passa ao alternativo; se nada responde, a app avisa e a gravação fica guardada.
- O e-mail é **preparado**, não enviado pela app; o PDF não vai anexado.
- A persistência é do navegador (IndexedDB): some se se limparem os dados do site.
- Para atualizar a app instalada, mudar `VERSAO` em `sw.js` ao alterar os ficheiros.
- A chave fica no navegador de quem a cola; use só em aparelhos de confiança.
