
# Firewall (UFW)

## Estado da firewall
A firewall UFW foi ativada com sucesso.

## Regras aplicadas

- Porta 22 (SSH): permitida para acesso remoto
- Porta 80 (HTTP): permitida para acesso ao site
- Porta 443 (HTTPS): permitida para segurança futura
- Porta 3306 (MySQL): bloqueada para impedir acesso externo

## Comandos utilizados

sudo ufw enable  
sudo ufw allow 22  
sudo ufw allow 80  
sudo ufw allow 443  
sudo ufw deny 3306  
sudo ufw status  

## Observação

Foi garantido que a porta SSH (22) estava aberta antes de ativar a firewall, evitando perda de acesso ao servidor.
