
# Monitorização

## Objetivo
Garantir que o sistema e o serviço web estão operacionais.

## Itens monitorizados

| Elemento | Comando | Frequência |
|----------|--------|-----------|
| Serviço Nginx | systemctl status nginx | Diário |
| Espaço disco | df -h | Diário |
| Memória RAM | free -h | Diário |
| Logs erro | error.log | Diário |
| Acessos | access.log | Semanal |

## Evidências
Ver pasta /evidencias
