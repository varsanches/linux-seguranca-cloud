
# Superfície de Ataque

## Serviço utilizado
WordPress com Nginx no EC2 (Ubuntu)

## Serviços ativos
- SSH
- Nginx
- MySQL
- PHP

## Portas identificadas
- 22 → SSH (acesso remoto)
- 80 → HTTP (site)
- 443 → HTTPS (segurança futura)
- 3306 → MySQL (base de dados)

## Portas necessárias
- 22 → para administração do servidor
- 80 → para acesso ao site
- 443 → para segurança futura

## Riscos identificados
- Acesso SSH pode ser atacado (brute force)
- Comunicação HTTP não segura (sem HTTPS)
- Base de dados pode ser alvo se exposta
- Painel WordPress pode sofrer ataques de login
``
