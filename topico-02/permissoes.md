##Ambiente utilizado
Ubuntu Server - Virtual Box

##Utilizador e grupos
utilizador identificado com whoami, grupos com id e groups

##Ficheiros criados
- publico.txt
- restrito.txt
- script.sh

#Permissoes aplicadas
|publico.txt |644|  leitura para todos, escrita so para dono|
|restrito.txt|640| acesso limitado ao grupo|
|script.sh|  |u+x| permite execucao apenas ao dono|

##Relacoes com o principio do menor privilegio
As permissoes sao limitadas para evitar acessos nao autorizados
