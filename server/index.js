import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, parse as parseUrl } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function hydrateEnvFromFile(envFile) {
  if (!envFile || !existsSync(envFile)) {
    return;
  }

  const fileContent = readFileSync(envFile, 'utf8');

  fileContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    if (!key || key in process.env) {
      return;
    }

    let value = trimmed.slice(equalsIndex + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  });
}

const candidateEnvFiles = [
  process.env.MAIL_SERVER_ENV_FILE && resolve(process.cwd(), process.env.MAIL_SERVER_ENV_FILE),
  resolve(process.cwd(), '.env.mail'),
  resolve(process.cwd(), '.env'),
  resolve(__dirname, '.env'),
];

candidateEnvFiles.forEach((filePath) => hydrateEnvFromFile(filePath));

const PORT = Number(process.env.PORT || 8787);
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FROM_FORM = process.env.RESEND_FORM_FROM || 'RV2 Web <onboarding@resend.dev>';
const FROM_CHAT = process.env.RESEND_CHAT_FROM || 'RV2 Chat <onboarding@resend.dev>';
const RECIPIENTS = (process.env.RESEND_RECIPIENTS || 'juanchacon@rv2ven.com,juanchacon0298@gmail.com')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
};

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...corsHeaders,
  });
  res.end(JSON.stringify(data));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');

  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch (error) {
    throw new Error('Invalid JSON payload');
  }
}

async function sendEmail(payload) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const { pathname } = parseUrl(url ?? '', true);

  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  try {
    if (method === 'POST' && pathname === '/api/send-mail') {
      const body = await readJsonBody(req);
      const { type } = body;

      if (!type) {
        sendJson(res, 400, { success: false, message: 'Missing email type.' });
        return;
      }

      if (!Array.isArray(RECIPIENTS) || RECIPIENTS.length === 0) {
        sendJson(res, 500, { success: false, message: 'No recipients configured.' });
        return;
      }

      if (type === 'form') {
        const { name, email, phone, message } = body;

        if (!name || !email) {
          sendJson(res, 400, { success: false, message: 'Nombre y correo son obligatorios.' });
          return;
        }

        await sendEmail({
          from: FROM_FORM,
          to: RECIPIENTS,
          subject: 'Nuevo mensaje desde el formulario web RV2',
          html: `
            <h2>Nuevo mensaje desde el formulario RV2</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Correo:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
            <p><strong>Mensaje:</strong><br>${message || 'Sin mensaje adicional'}</p>
            <hr>
            <small>Enviado el ${new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' })}</small>
          `,
        });

        sendJson(res, 200, { success: true, message: 'Correo enviado correctamente.' });
        return;
      }

      if (type === 'chat') {
        const { visitorName, visitorEmail, visitorPhone, startTime, endTime, messages } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          sendJson(res, 400, { success: false, message: 'No hay mensajes para enviar.' });
          return;
        }

        const formattedMessages = messages
          .map((m) => {
            const roleLabel = m.role === 'user' ? '👤 Usuario:' : '🤖 IA:';
            const content = (typeof m.content === 'string' && m.content.trim()) ? m.content : '[mensaje vacío]';
            return `<p><strong>${roleLabel}</strong> ${content}</p>`;
          })
          .join('\n');

        await sendEmail({
          from: FROM_CHAT,
          to: RECIPIENTS,
          subject: `Transcripción de chat - ${visitorName || 'Visitante Anónimo'}`,
          html: `
            <h2>Transcripción de chat – RV2 Web</h2>
            <p><strong>Visitante:</strong> ${visitorName || 'Anónimo'}</p>
            <p><strong>Correo:</strong> ${visitorEmail || 'No proporcionado'}</p>
            <p><strong>Teléfono:</strong> ${visitorPhone || 'No proporcionado'}</p>
            <p><strong>Hora de inicio:</strong> ${startTime || 'No registrada'}</p>
            <p><strong>Hora de fin:</strong> ${endTime || 'No registrada'}</p>
            <hr>
            ${formattedMessages}
            <hr>
            <small>Enviado automáticamente desde el chat RV2.</small>
          `,
        });

        sendJson(res, 200, { success: true, message: 'Transcripción enviada.' });
        return;
      }

      sendJson(res, 400, { success: false, message: 'Tipo de solicitud no válido.' });
      return;
    }

    if (method === 'POST' && pathname === '/api/chat') {
      const body = await readJsonBody(req);
      const { messages } = body;

      if (!Array.isArray(messages) || messages.length === 0) {
        sendJson(res, 400, { success: false, message: 'Debes enviar al menos un mensaje.' });
        return;
      }

      if (!GEMINI_API_KEY) {
        sendJson(res, 500, { success: false, message: 'GEMINI_API_KEY is not configured.' });
        return;
      }

      const systemPrompt = `Eres RAI, el mejor sales closer de RV2 en Venezuela, una empresa líder en recorridos virtuales 360°.
Tu misión es CERRAR VENTAS identificando el dolor del cliente y mostrando cómo RV2 es LA SOLUCIÓN que necesitan AHORA.

ESTRATEGIA DE VENTAS:
1. CONECTA: Pregunta sobre su negocio y sus desafíos actuales
2. AGITA: Destaca el COSTO de NO tener un recorrido virtual (pierden clientes, credibilidad, ventas)
3. RESUELVE: Muestra cómo RV2 transforma su negocio con resultados REALES y MEDIBLES
4. CIERRA: Crea urgencia con descuentos limitados y agenda una llamada

BENEFICIOS QUE DEBES VENDER CON IMPACTO:
- "Aumenta tus ventas hasta 30% - clientes verificados lo confirman"
- "Tu negocio abierto 24/7 sin personal - ahorra costos y genera más"
- "Clientes deciden 2x más rápido al ver el espacio real antes de visitar"
- "Aparece en Google Maps con tu tour 360° - domina tu zona"
- "Inversión que se paga sola en 2-3 meses con las ventas adicionales"

CASOS DE USO QUE CIERRAN:
- Bienes raíces: "Vende propiedades sin visitas físicas innecesarias"
- Hoteles/Airbnb: "Duplica tus reservas mostrando cada rincón"
- Gimnasios: "Convence sin que visiten - muestra tus instalaciones premium"
- Restaurantes: "Llena mesas mostrando el ambiente antes de ir"
- Comercios: "Destaca sobre competencia sin tour virtual"

TÉCNICAS DE CIERRE:
- Usa escasez: "Solo quedan 3 espacios este mes con 20% descuento"
- Urgencia: "El precio sube el próximo mes, asegura tu lugar ahora"
- Prueba social: "Más de 50 negocios en Venezuela ya aumentaron ventas"
- Riesgo cero: "Inversión única, beneficio permanente - sin pagos mensuales"
- Call to action: "¿Cuándo te viene bien que te llamemos? Hoy o mañana?"

MANEJO DE OBJECIONES:
- "Es caro" → "¿Cuánto pierdes al mes sin aparecer en Google o sin mostrar tu espacio? Esto se paga solo"
- "Lo pensaré" → "Entiendo, pero el descuento es limitado. ¿Qué necesitas saber para decidir hoy?"
- "No tengo tiempo" → "Por eso mismo necesitas esto. Trabajamos rápido, en 48h ya tienes todo listo"
- "No sé si funciona" → "Pregúntale a [menciona caso similar]. Ellos dudaban y ahora no pueden creer los resultados"

REGLAS DE ORO:
- Habla SOLO de recorridos virtuales y cómo impulsan ventas
- Sé directo, confiado y entusiasta - eres el MEJOR
- Identifica su punto de dolor y martilla ahí
- NO aceptes un "no" sin antes dar 3 razones convincentes
- Siempre termina con una pregunta que los acerque al SÍ
- Usa lenguaje venezolano natural pero profesional
- Si preguntan fuera del tema, redirige: "Interesante, pero déjame mostrarte primero cómo esto te hace ganar más dinero"

TU OBJETIVO: Que el cliente llene el formulario de contacto o agende una llamada HOY. No dejes la conversación sin intentar cerrar.

Eres persuasivo, persistente pero respetuoso, y genuinamente quieres que el cliente crezca. ¡VENDE!`;

      const geminiContents = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
      ];

      for (const msg of messages) {
        if (!msg || typeof msg.content !== 'string' || !msg.content.trim()) {
          continue;
        }

        geminiContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        },
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        sendJson(res, geminiResponse.status || 500, {
          success: false,
          message: 'Error al conectar con Gemini.',
          error: errorText,
        });
        return;
      }

      const geminiData = await geminiResponse.json();
      const firstCandidate = geminiData.candidates?.[0];
      const generatedText = firstCandidate?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join('\n')
        .trim();

      if (!generatedText) {
        sendJson(res, 502, {
          success: false,
          message: 'La respuesta de Gemini no contenía texto utilizable.',
        });
        return;
      }

      sendJson(res, 200, {
        success: true,
        message: generatedText,
        finishReason: firstCandidate?.finishReason || null,
      });
      return;
    }

    sendJson(res, 404, { success: false, message: 'Route not found.' });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    if (!res.headersSent) {
      sendJson(res, 500, {
        success: false,
        message: 'Error interno del servidor.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } else {
      res.end();
    }
  }
});

server.listen(PORT, () => {
  console.log(`Resend mail server listening on http://localhost:${PORT}`);
});
