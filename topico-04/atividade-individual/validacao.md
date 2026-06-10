
# Validação

## Testes realizados

### 1. Estado da firewall
- Comando: sudo ufw status
- Resultado esperado: firewall ativa com regras aplicadas

### 2. Serviço web acessível
- Método: acesso via browser
- Resultado esperado: site WordPress abre normalmente

### 3. Acesso SSH
- Método: ligação SSH ao servidor
- Resultado esperado: acesso permitido

### 4. Portas protegidas
- Método: verificação com ufw status
- Resultado esperado: porta 3306 bloqueada

## Resultado final

Após a aplicação das medidas de segurança:

- O serviço web continua funcional  
- A firewall está ativa  
- Apenas portas necessárias estão abertas  
- A base de dados está protegida  

O sistema mantém-se acessível e mais seguro.
