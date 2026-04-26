# 🚀 Setup VP Martins - Guia de Instalação

## ✅ Pré-requisitos

- **PHP 7.4+** (recomenda-se 8.0+)
- **MySQL 5.7+** ou **MariaDB 10.2+**
- **Apache 2.4+** ou outro servidor web
- **Composer** (já vem com PHPMailer incluído)

---

## 📋 Instalação Passo a Passo

### Passo 1: Preparar o Servidor Local

#### Opção A: XAMPP (Windows/Mac/Linux)
```bash
1. Download XAMPP de: https://www.apachefriends.org
2. Instale em sua máquina
3. Inicie Apache e MySQL através do painel de controle
4. Acesse: http://localhost/phpmyadmin
```

#### Opção B: Laragon (Windows - Recomendado)
```bash
1. Download em: https://laragon.org
2. Instale (bem mais leve que XAMPP)
3. Clique em "Start"
4. Acesse: http://localhost/phpmyadmin
```

### Passo 2: Criar o Banco de Dados

#### Via PHPMyAdmin (Interface Gráfica)
```
1. Acesse: http://localhost/phpmyadmin
2. Faça login (user: root, password: vazio)
3. Clique em "Novo"
4. Nome: vpmartins
5. Encoding: utf8mb4
6. Clique em "Criar"
7. Selecione o banco "vpmartins"
8. Vá para "SQL"
9. Cole o conteúdo do arquivo: banco_dados.sql
10. Clique em "Executar"
```

#### Via Linha de Comando (Terminal)
```bash
mysql -u root -p < banco_dados.sql
```

### Passo 3: Copiar os Arquivos do Site

```bash
# XAMPP
cp -r WebSite---VPMartins-main /Applications/XAMPP/htdocs/

# Laragon (Windows)
copy WebSite---VPMartins-main "C:\laragon\www\"
```

### Passo 4: Configurar Credenciais de Email

**Arquivo:** `servico_email.php` (linhas 51-52)

#### Usando Gmail:
```php
// Antes
$mail->Username = 'kellvesmano@gmail.com';
$mail->Password = "ryyxfpuadbetqkav";

// Depois (seu email)
$mail->Username = 'seu-email@gmail.com';
$mail->Password = "sua-app-password"; // NÃO sua senha normal!
```

**Como obter App Password do Gmail:**
```
1. Acesse: https://myaccount.google.com/
2. Segurança (esquerda)
3. Senhas de app (se não ver, ative 2FA primeiro)
4. Selecione "Mail" e "Windows"
5. Copie a senha gerada
```

### Passo 5: Testar o Site

```bash
# XAMPP
http://localhost/WebSite---VPMartins-main/

# Laragon
http://localhost/WebSite---VPMartins-main/
```

---

## 🧪 Testes Recomendados

### 1. Teste do Formulário
```
1. Acesse: http://localhost/WebSite---VPMartins-main/
2. Role até "Fale Conosco"
3. Preencha o formulário com dados válidos
4. Clique em "Enviar Mensagem"
5. Verifique se recebeu o email
6. Abra phpMyAdmin e verifique a tabela "mensagens"
```

### 2. Teste de Validação
```
1. Tente submeter formulário vazio
2. Tente email inválido
3. Tente telefone inválido
4. Verifique as mensagens de erro
```

### 3. Teste de Segurança
```
1. Inspecione elemento (F12)
2. Tente adicionar script malicioso no formulário
3. Verifique que é escapado no email
4. Verifique que não há erro no servidor
```

---

## 🔒 Configurações de Segurança Recomendadas

### Passo 1: Alterar Permissões (Linux/Mac)
```bash
chmod 755 /path/to/site
chmod 644 /path/to/site/*.html
chmod 644 /path/to/site/*.php
chmod 755 /path/to/site/css
chmod 755 /path/to/site/img
```

### Passo 2: Criar arquivo .htaccess (Apache)
```apache
# Prevent direct access to PHP files
<FilesMatch "\.php$">
    Deny from all
</FilesMatch>

# Allow only through index
<Files "servico_email.php">
    Allow from all
</Files>

# Prevent directory listing
Options -Indexes

# Enable HTTPS redirect
# RewriteEngine On
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Passo 3: Usar HTTPS em Produção
```
1. Obtenha certificado SSL (Let's Encrypt é gratuito)
2. Configure no servidor
3. Redirecione HTTP para HTTPS
```

---

## 📊 Estrutura do Banco de Dados

### Tabela: mensagens
```
id              | INT (Auto Increment)
nome            | VARCHAR(100)
email           | VARCHAR(100)
telefone        | VARCHAR(15)
mensagem        | TEXT
data_criacao    | TIMESTAMP
lido            | BOOLEAN
respondido      | BOOLEAN
data_resposta   | TIMESTAMP
```

### Exemplo de Query para Ver Mensagens
```sql
SELECT * FROM mensagens ORDER BY data_criacao DESC;

-- Ver apenas não lidas
SELECT * FROM mensagens WHERE lido = 0 ORDER BY data_criacao DESC;

-- Ver estatísticas
SELECT 
    COUNT(*) as total_mensagens,
    SUM(CASE WHEN lido = 1 THEN 1 ELSE 0 END) as mensagens_lidas,
    SUM(CASE WHEN respondido = 1 THEN 1 ELSE 0 END) as mensagens_respondidas
FROM mensagens;
```

---

## 🐛 Troubleshooting

### Problema: "Connection refused"
```
Solução:
1. Verifique se MySQL está rodando
2. XAMPP/Laragon > Start MySQL
3. Verifique credenciais em servico_email.php
```

### Problema: "Table doesn't exist"
```
Solução:
1. Execute o arquivo banco_dados.sql novamente
2. Verifique se o banco "vpmartins" foi criado
3. Recrie o banco
```

### Problema: Email não chega
```
Solução:
1. Verifique credenciais do Gmail
2. Ative "Apps de menor segurança" se não usa App Password
3. Verifique pasta de SPAM
4. Veja error_log do PHP
```

### Problema: CSS/JS não carregam
```
Solução:
1. Verifique os caminhos dos arquivos
2. Abra Console (F12) para ver erros
3. Verifique permissões de arquivo
4. Limpe cache do navegador (Ctrl+Shift+Del)
```

### Problema: Animações não funcionam
```
Solução:
1. Verifique internet (CDNs requerem conexão)
2. Verifique Console do navegador
3. Atualize a página
4. Use navegador moderno (Chrome, Firefox, Safari)
```

---

## 🚀 Deploy em Produção

### Opção 1: Hospedagem Compartilhada (Recomendado para começo)

1. **Contratar hospedagem** com suporte a PHP/MySQL
   - Sugestões: Hostgator, Bluehost, UOL Host, Locaweb

2. **Upload via FTP**
   ```
   - Baixe FileZilla
   - Conecte com credenciais FTP
   - Copie arquivos para public_html/
   ```

3. **Criar banco via cPanel**
   ```
   - MySQL Databases
   - Create Database
   - Execute SQL do arquivo banco_dados.sql
   ```

4. **Atualizar credenciais**
   ```
   - Atualize host/user/password em servico_email.php
   - Atualize host/user/password do email SMTP
   ```

### Opção 2: VPS (Amazon, DigitalOcean, Linode)

```bash
# SSH para servidor
ssh root@seu-servidor

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Apache, PHP, MySQL
apt install apache2 php php-mysql mysql-server -y

# Habilitar mod_rewrite
a2enmod rewrite

# Copiar arquivos
scp -r WebSite---VPMartins-main root@servidor:/var/www/html/

# Configurar permissões
chown -R www-data:www-data /var/www/html/WebSite---VPMartins-main
chmod -R 755 /var/www/html/WebSite---VPMartins-main
```

### Opção 3: Docker (Avançado)

```dockerfile
FROM php:8.0-apache
RUN docker-php-ext-install mysqli
COPY WebSite---VPMartins-main /var/www/html/
EXPOSE 80
```

---

## 📱 Teste de Responsividade

Teste em diferentes tamanhos:
```
Desktop:  1920x1080
Tablet:   768x1024
Mobile:   375x667 (iPhone)
Mobile:   360x640 (Android)
```

Use as Ferramentas do Desenvolvedor (F12):
- Toggle device toolbar
- Selecione diferentes dispositivos
- Teste hover, cliques e scroll

---

## 📈 Monitoramento e Manutenção

### Checklist Mensal
- [ ] Verificar formulário funcionando
- [ ] Verificar emails chegando
- [ ] Backup do banco de dados
- [ ] Atualizar dependências (PHPMailer)
- [ ] Revisar logs de erro

### Checklist Trimestral
- [ ] Atualizar PHP/MySQL
- [ ] Revisar segurança
- [ ] Limpar tabela de mensagens antigas
- [ ] Testar SSL/HTTPS

---

## 📞 Contato para Suporte

Se tiver dúvidas:
1. Verifique este documento
2. Verifique MODERNIZACOES.md
3. Consulte documentação oficial dos frameworks usados
4. Procure comunidades online (Stack Overflow, GitHub)

---

## ✨ Próximos Passos após Setup

1. ✅ Teste completamente o site
2. ✅ Configure domínio (se houver)
3. ✅ Ative HTTPS
4. ✅ Configure redes sociais
5. ✅ Comece a usar as páginas de sucesso

---

**Sucesso na instalação!** 🎉

Seu site VP Martins está pronto para impressionar clientes!
