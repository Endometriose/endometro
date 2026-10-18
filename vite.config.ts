import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { GoogleGenAI } from '@google/genai';

const geminiPlugin = () => ({
  name: 'gemini-chat-endpoint',
  configureServer(server: any) {
    server.middlewares.use('/api/chat', async (req: any, res: any) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
      }

      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          const { message } = JSON.parse(body || '{}');
          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }));
            return;
          }

          const ai = new GoogleGenAI({ apiKey });
          const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
          let generatedText = '';

          for (const model of candidateModels) {
            try {
              const response = await ai.models.generateContent({
                model,
                contents: message,
                config: {
                  systemInstruction: `Você é o "Endozinho", o assistente virtual acolhedor, gentil e educativo sobre endometriose da plataforma ENDOMETRIÔMETRO.
Responda em português com empatia, linguagem acessível, carinho e clareza médica preventiva.
Oriente sempre sobre a importância de consultar ginecologistas especialistas em dor pélvica e mapeamento por imagem.
Nunca prescreva medicamentos nem dê diagnósticos definitivos. Em situações de dor intensa incapacitante ou urgência, recomende procurar atendimento médico ou pronto-socorro.`,
                },
              });
              if (response.text) {
                generatedText = response.text;
                break;
              }
            } catch (err: any) {
              console.warn(`Tentando próximo modelo após aviso no ${model}:`, err?.message);
            }
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ text: generatedText }));
        } catch (error: any) {
          console.error('Erro na API Gemini:', error);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ text: '' }));
        }
      });
    });
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), geminiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@tanstack/react-query',
        '@tanstack/query-core',
      ],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

