import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { GoogleGenAI } from '@google/genai';

const geminiPlugin = () => ({
  name: 'gemini-chat-endpoint',
  configureServer(server: any) {
    server.middlewares.use('/api/chat', (req: any, res: any) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
      }

      const chunks: Buffer[] = [];
      req.on('data', (chunk: any) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      req.on('end', async () => {
        try {
          const bodyStr = Buffer.concat(chunks).toString('utf8');
          const { message } = JSON.parse(bodyStr || '{}');

          let apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            try {
              const fs = await import('fs');
              if (fs.existsSync('/app/.dev.env.json')) {
                const devEnv = JSON.parse(fs.readFileSync('/app/.dev.env.json', 'utf8'));
                apiKey = devEnv.GEMINI_API_KEY;
              } else if (fs.existsSync('.env')) {
                const envContent = fs.readFileSync('.env', 'utf8');
                const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
                if (match) apiKey = match[1].trim();
              }
            } catch {}
          }

          if (!apiKey) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }));
            return;
          }

          const ai = new GoogleGenAI({
            apiKey: apiKey || process.env.GEMINI_API_KEY,
          });

          // Modelos permitidos (gemini-3.1-flash-lite com latência ultra-baixa prioritário)
          const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
          let generatedText = '';

          const systemPrompt = `Você é o "Endozinho", o assistente virtual acolhedor, gentil, didático e altamente especializado em endometriose da plataforma ENDOMETRIÔMETRO.
Sua missão é responder com empatia, conhecimento médico seguro e linguagem acessível a QUALQUER pergunta relacionada à endometriose, adenomiose e saúde feminina:
• Sintomas e manifestações clínicas: cólicas intensas, dor pélvica crônica, dispareunia (dor na relação sexual), alterações intestinais/urinárias no período menstrual, inchaço abdominal (endo belly), fadiga extrema, dor ciática/lombar e impacto emocional.
• Diagnóstico padrão-ouro: ultrassonografia transvaginal com preparo intestinal, ressonância magnética da pelve com protocolo específico para endometriose e avaliação clínica com ginecologista especialista.
• Tratamentos clínicos e cirúrgicos: bloqueios hormonais (dienogeste, DIU hormonal, implantes, análogos/antagonistas de GnRH), fisioterapia pélvica especializada, nutrição anti-inflamatória, videolaparoscopia e cirurgia robótica de excisão completa dos focos.
• Fertilidade e planejamento familiar: preservação de fertilidade, contagem de folículos e hormônio antimülleriano (AMH), técnicas de reprodução assistida (FIV) e chances reais de gravidez.
• Impacto no trabalho e direitos: absenteísmo, presenteísmo, atestados médicos, sigilo diagnóstico garantido por lei (LGPD) e acolhimento por políticas corporativas de RH.
Oriente sempre com empatia, reforçando que cólica incapacitante NÃO é normal. Mantenha tom amigável e acolhedor (use emojis delicados como 💕 e ✨), utilize formatação clara com tópicos e negritos, e lembre com carinho que as respostas têm caráter educativo e não substituem uma consulta médica presencial especializada. Em sinais de emergência ou dor aguda insuportável, recomende procurar pronto-atendimento.`;

          for (const model of candidateModels) {
            try {
              const response = await ai.models.generateContent({
                model,
                contents: message,
                config: {
                  systemInstruction: systemPrompt,
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

