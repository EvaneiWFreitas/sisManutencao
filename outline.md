# Estrutura do Sistema de Manutenção

## Arquivos Principais

### Frontend (HTML/CSS/JS)
1. **index.html** - Página inicial com formulário de solicitação
2. **admin.html** - Dashboard administrativo completo
3. **ordens.html** - Gerenciamento de ordens de serviço
4. **clientes.html** - Controle de clientes e histórico

### Backend (PHP)
1. **config.php** - Configurações do banco de dados
2. **api/solicitacao.php** - Processar novas solicitações
3. **api/admin.php** - Endpoints administrativos
4. **api/ordens.php** - Gerenciamento de ordens
5. **api/clientes.php** - Controle de clientes

### Recursos
1. **database.sql** - Estrutura do banco de dados
2. **main.js** - JavaScript principal com interações
3. **resources/** - Imagens e assets visuais

## Funcionalidades

### Pública
- Formulário de solicitação de serviço
- Acompanhamento de ordens
- Informações de contato

### Administrativa
- Dashboard com métricas
- Gerenciamento de ordens (CRUD)
- Controle de clientes
- Relatórios e estatísticas
- Sistema de status de serviço