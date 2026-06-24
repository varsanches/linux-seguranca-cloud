# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## What this repository is

This is **not a software project** — it is a **coursework / documentation portfolio**
for the module **M3 – Linux e Segurança na Cloud** ("Linux and Cloud Security").
It holds the practical activities (atividades) produced while learning to set up,
secure, and operate Linux servers, both on a local VM (VirtualBox) and on the cloud
(AWS EC2 — Ubuntu Server).

Author: André Sanches.

There is **no build, no test suite, no package manager, and no application to run**.
The deliverables are Markdown reports, plain-text command logs, screenshots, PDFs,
and a small static HTML site. Treat the content as documentation, not as code to
compile or execute.

## Language and writing conventions

- **All content is written in Portuguese (pt-PT).** When creating or editing files,
  keep writing in Portuguese to match the existing material. Accented characters
  (á, ç, ã, ó, etc.) are used and should be preserved.
- Reports are written from a student's first-person perspective, documenting what
  was done, which commands were used, and what was observed.
- Keep the tone factual and concise, matching the existing `.md` files.

## Repository structure

The repo is organised by topic (`topico-NN`). Each topic is a self-contained
activity with its own evidence. Two folder layouts appear:

```
linux-seguranca-cloud/
├── README.md                       # Top-level overview (PT)
├── topico-01/                      # Preparação do ambiente Linux
│   ├── README.md
│   ├── comandos-topico-01.txt      # Command log
│   └── evidencias/                 # Screenshots (.png) + text captures (.txt)
├── topico-02/                      # Utilizadores, permissões e SSH
│   ├── README.md (none — uses .md reports directly)
│   ├── permissoes.md
│   ├── acesso-remoto.md
│   ├── comandos-utilizados.txt
│   ├── evidencias/
│   └── teste/                      # Sample files created during the exercise
├── topico-03/atividade-individual/ # Serviço Web (publish a site on EC2)
│   ├── README.md, publicacao.md, validacao.md, comandos.txt
│   └── site/                       # Static HTML/CSS (index.html, sobre.html, style.css)
├── topico-04/                      # Segurança e hardening
│   ├── atividade-individual/       # firewall.md, hardening.md, superficie-ataque.md, validacao.md
│   └── trabalho-grupo/             # Group work: WordPress + Nginx security plan (PDF + evidências)
└── topico-05/atividade-individual/ # Monitorização, logs, backup, continuidade
    ├── monitorizacao.md, logs.md, manutencao.md, backup-recuperacao.md, continuidade.md
    ├── comandos.txt, README.md
    └── evidencias/
```

### Conventions to follow when adding to a topic

- **`atividade-individual/`** holds individual assignments; **`trabalho-grupo/`**
  holds group assignments. Newer topics nest the work under `atividade-individual/`;
  older topics (01, 02) keep files directly under the topic folder. When extending an
  existing topic, mirror that topic's existing layout rather than imposing a new one.
- **`README.md`** in a topic gives a short summary: objetivo, ambiente, estrutura,
  resultado, and often the autor. Follow this heading style (`# Tópico NN - ...`).
- **`comandos.txt` / `comandos-*.txt`** are plain-text logs of shell commands, often
  annotated with `comando -> explicação`. Keep one command (and its purpose) per line.
- **`evidencias/`** stores proof of the work: screenshots (`.png`) and saved command
  output (`.txt`). Reference it from reports as "Ver pasta /evidencias".
- Markdown reports use short `##` sections (Objetivo, Ambiente, Comandos utilizados,
  Resultado, Observação, Dificuldades, Próximos passos). Tables are used for
  permissions and monitoring matrices.

## Environments referenced

- **topico-01, 02**: local VM — Ubuntu Server on VirtualBox.
- **topico-03, 04, 05**: cloud — AWS EC2 running Ubuntu Server with Nginx.

Commands documented are standard Linux/admin tooling: `whoami`, `pwd`, `ls -la`,
`uname -a`, `cat /etc/os-release`, file permissions (`chmod` 644/640, `u+x`),
`ufw` firewall rules, `systemctl status nginx`, `df -h`, `free -h`, Nginx
access/error logs, etc. These are documented, not run by the repo.

## How to work in this repo

- **Editing/adding content**: write Markdown or plain-text files in Portuguese,
  placing them in the correct `topico-NN` and (where applicable) `atividade-individual/`
  or `trabalho-grupo/` subfolder. Add supporting screenshots/output to `evidencias/`.
- **The static site** (`topico-03/atividade-individual/site/`) is plain HTML/CSS with
  no tooling — open the `.html` files directly in a browser to preview. Keep it
  dependency-free.
- **Do not** add build systems, linters, CI, or package manifests unless explicitly
  requested — they are out of scope for a documentation portfolio.
- Preserve existing files and accented text; some filenames contain spaces and
  accents (e.g. the topico-05 PDF) — quote paths in shell commands.

## Git workflow

- Default branch: `main`. Commits are made directly per activity; messages are short
  and descriptive (often in Portuguese, e.g. "Adiciona atividade individual topico-04").
- Match the existing commit-message style: a brief imperative summary of what was
  added or changed. English or Portuguese is acceptable; keep it consistent within a
  change.
- Only create a pull request when the user explicitly asks for one.
