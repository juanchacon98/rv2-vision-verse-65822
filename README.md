# RV2 - Recorridos Virtuales 360°

Proyecto web independiente con chatbot IA (RAI) y sistema de contacto por correo.

## 🚀 Configuración Rápida

### 1. Obtén tus API Keys

**GEMINI_API_KEY** (para el chatbot RAI):
- Ve a: https://ai.google.dev/gemini-api/docs/api-key
- Crea tu cuenta y genera una API Key gratuita

**RESEND_API_KEY** (para envío de correos):
- Ve a: https://resend.com/api-keys
- Crea tu cuenta (plan gratuito disponible)
- Valida tu dominio en: https://resend.com/domains
- Genera tu API Key

### 2. Configura el archivo .env

Crea un archivo `.env` en la raíz del proyecto copiando `.env.example`:

```bash
cp .env.example .env
```

Abre `.env` y coloca tus API Keys:

```env
# 🔑 COLOCA TUS API KEYS AQUÍ:
GEMINI_API_KEY="tu_api_key_de_gemini_aqui"
RESEND_API_KEY="tu_api_key_de_resend_aqui"

# 📧 DESTINATARIOS DE CORREOS (ya configurados):
RESEND_RECIPIENTS="juanchacon@rv2ven.com,juanchacon0298@gmail.com"

# ✅ Resto de configuración (no modificar):
RESEND_FORM_FROM="RV2 Web <onboarding@resend.dev>"
RESEND_CHAT_FROM="RV2 Chat <onboarding@resend.dev>"
PORT=8787
VITE_MAIL_API_URL="http://localhost:8787/api/send-mail"
VITE_CHAT_API_URL="http://localhost:8787/api/chat"
```

### 3. Instala e Inicia

```bash
# Instalar dependencias
npm i

# Iniciar frontend (puerto 5173)
npm run dev

# En otra terminal, iniciar servidor backend (puerto 8787)
npm run server
```

## ✨ Funcionalidades

- **RAI (Chatbot IA)**: Sales closer inteligente usando Gemini
- **Formulario de Contacto**: Envía correos a los emails configurados
- **Transcripciones**: Las conversaciones con RAI se envían por correo automáticamente

## 📧 Correos Electrónicos

Los correos se envían automáticamente a:
- juanchacon@rv2ven.com
- juanchacon0298@gmail.com

**Qué correos recibirás:**
1. Formularios de contacto completados por usuarios
2. Transcripciones de conversaciones con RAI cuando el usuario proporciona su email

## 🔧 Editar el Código

There are several ways of editing your application.

### Opción 1: Clonar repositorio y trabajar localmente

```bash
git clone <TU_URL_DE_GIT>
cd <NOMBRE_DEL_PROYECTO>
npm i
# Configura tu .env con las API Keys
npm run dev     # Terminal 1
npm run server  # Terminal 2
```

### Opción 2: Editar directamente en GitHub

- Ve al archivo que quieres modificar
- Click en "Edit" (ícono de lápiz)
- Haz tus cambios y commit

### Opción 3: GitHub Codespaces

- Click en "Code" → "Codespaces" → "New codespace"
- Edita y haz commit directamente desde el navegador

## 🛠️ Stack Tecnológico

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn-ui + Tailwind CSS
- **IA**: Google Gemini (chatbot RAI)
- **Correos**: Resend API
- **Backend**: Node.js (servidor local en `server/index.js`)

## 📦 Deploy en Producción

Para desplegar el proyecto en tu servidor:

1. Clona el repositorio en tu servidor
2. Configura el archivo `.env` con tus API Keys
3. Instala PM2 o similar para mantener el servidor corriendo:

```bash
npm install -g pm2
pm2 start server/index.js --name rv2-server
pm2 startup  # Para que inicie automáticamente
pm2 save
```

4. Configura nginx o apache como reverse proxy
5. Compila el frontend: `npm run build`
6. Sirve la carpeta `dist/` con tu servidor web

## 📝 Notas Importantes

- **API Keys**: NUNCA subas tu `.env` al repositorio
- **Correos**: Asegúrate de validar tu dominio en Resend
- **RAI**: Es un sales closer agresivo, optimizado para cerrar ventas
- **Transcripciones**: Solo se envían cuando el usuario proporciona su email

## 📞 Soporte

Para más información consulta `server/README.md` o contacta a:
- juanchacon@rv2ven.com
- juanchacon0298@gmail.com
