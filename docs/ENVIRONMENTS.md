# Ambientes

## Local

O ambiente local usa exclusivamente a stack iniciada pelo Supabase CLI. Inicie-a
com `pnpm supabase:start` e obtenha as URLs e os valores de conexão locais com
`pnpm supabase:status`. Pare os serviços com `pnpm supabase:stop` ao concluir.

O arquivo `supabase/config.toml` é versionado; somente o estado e o cache
gerados pelo CLI permanecem fora do repositório. O cadastro público continua
desabilitado também na configuração local.

Os scripts locais definem o profile explícito `supabase` somente para o processo
do CLI. Isso isola o ambiente de seletores globais de usuário sem alterar,
autenticar ou vincular qualquer perfil global ou projeto remoto.

## Development, homologação e produção

Development, homologação e produção devem usar projetos Supabase distintos.
Nenhum ambiente remoto é inferido, criado, vinculado ou alterado por este
repositório sem autorização explícita.

Criar ou vincular projetos, executar migrations remotas, configurar secrets ou
alterar as configurações de Auth são gates separados e exigem autorização
explícita. Isso inclui qualquer uso de credenciais privilegiadas.

Sucesso local prova somente o funcionamento da stack local; não comprova o
estado, a configuração, as migrations, a autenticação ou a segurança de um
ambiente remoto.

Dados de produção nunca são copiados para os ambientes local ou development.
Dados de teste devem ser sintéticos e mínimos.
