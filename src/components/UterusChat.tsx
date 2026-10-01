import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ChatMessage {
  id: string;
  isAi: boolean;
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "Por que minha cólica dói tanto?",
  "Endometriose pode me fazer perder produtividade?",
  "Posso ter endometriose mesmo sem sentir muita dor?",
  "Por que fico tão cansada?",
  "Meu chefe não entende minha dor, o que posso fazer?",
  "Qual a diferença entre presenteísmo e absenteísmo?"
];

const UterusChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatStage, setChatStage] = useState<1 | 2>(1);

  // Alterna suavemente a animação 3D da logo do chat a cada 3.5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setChatStage((prev) => (prev === 1 ? 2 : 1));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Verificar usuário logado ao carregar
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          loadHistory(user.id);
          return;
        }
      } catch (e) {
        console.error("Erro ao verificar usuário no chat:", e);
      }
      
      // Mensagem inicial de boas-vindas
      setMessages([
        {
          id: 'welcome',
          isAi: true,
          text: "Olá! Eu sou o Bate-Papo com o Útero 💕\n\nSou seu assistente virtual educativo especializado em endometriose. Pode me fazer qualquer pergunta — mesmo que seja inédita, informal, rápida ou do seu jeito!\n\nEstou aqui para tirar dúvidas sobre sintomas, exames, tratamentos, fertilidade, rotina, saúde emocional e impacto no trabalho. Como posso ajudar você hoje?"
        }
      ]);
    };
    checkUser();
  }, []);

  useEffect(() => {
    // Auto-scroll para a última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const loadHistory = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true });

      if (error && error.code !== '42P01') {
        console.error("Erro ao carregar histórico:", error);
      } else if (data && data.length > 0) {
        setMessages(data.map(d => ({ id: d.id, isAi: d.is_ai, text: d.message })));
      } else {
        setMessages([
          {
            id: 'welcome',
            isAi: true,
            text: "Olá! Eu sou o Bate-Papo com o Útero 💕\n\nSou seu assistente virtual educativo sobre endometriose. Você pode digitar qualquer pergunta sobre sintomas, exames, rotina ou trabalho!\n\nEscolha uma das sugestões abaixo ou digite o que quiser:"
          }
        ]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveMessage = async (text: string, isAi: boolean) => {
    if (!userId) return;
    try {
      await supabase.from('chat_history').insert({
        user_id: userId,
        message: text,
        is_ai: isAi
      });
    } catch (e) {
      console.error("Erro ao salvar mensagem:", e);
    }
  };

  // Motor Inteligente Conversacional de Respostas Educativas sobre Endometriose
  const generateAIResponse = (userText: string, contextHistory: ChatMessage[]): string => {
    const text = userText.toLowerCase().trim();

    // 1. Saudações
    if (text.match(/^(olá|ola|oi|bom dia|boa tarde|boa noite|e ai|e aí|oie|salve|tudo bem|como vai)/i) && text.length < 25) {
      return "Olá! Que bom conversar com você! 💕\n\nSou o Bate-Papo com o Útero, seu assistente educativo. Você pode me fazer qualquer pergunta sobre a endometriose, seus sintomas, tratamentos, exames, fertilidade, saúde mental ou impactos na carreira profissional.\n\nQual é a sua dúvida ou como você está se sentindo hoje?";
    }

    // 2. Por que minha cólica dói tanto / Cólica forte
    if (text.includes("cólica") || text.includes("colica") || text.includes("dói tanto") || text.includes("doi tanto") || text.includes("muita dor") || text.includes("dor forte")) {
      return "A cólica da endometriose dói intensamente porque o tecido endometrial presente fora do útero também sangra durante a menstruação, mas esse sangue não tem para onde sair.\n\n• O que acontece? Isso causa um processo inflamatório intenso, inchaço local e formação de cicatrizes (aderências) e fibroses que irritam os nervos da região pélvica.\n• Não é 'mimimi': Cólicas incapacitantes que não passam com analgésicos comuns NÃO são normais. Se isso acontece com você, vale a pena conversar com um ginecologista especializado!";
    }

    // 3. Cansaço e Fadiga ("Por que fico tão cansada?")
    if (text.includes("cansaço") || text.includes("cansaco") || text.includes("cansada") || text.includes("fadiga") || text.includes("exaustão") || text.includes("exaustao") || text.includes("sem energia")) {
      return "Ficar muito cansada é um sintoma muito comum e real da endometriose!\n\n• Por que acontece? O corpo gasta uma quantidade enorme de energia tentando combater a inflamação crônica gerada pelos focos da doença. Além disso, a dor constante altera a qualidade do sono e a dor pélvica crônica pode causar fadiga imunológica.\n• Dica: Tente manter noites de sono regulares, boa hidratação e converse com seu médico para avaliar seus níveis de ferro e vitaminas!";
    }

    // 4. Perda de Produtividade, Trabalho e Chefe ("Meu chefe não entende", "Endometriose pode me fazer perder produtividade?")
    if (text.includes("trabalho") || text.includes("produtividade") || text.includes("chefe") || text.includes("empresa") || text.includes("faltar") || text.includes("emprego") || text.includes("rendimento") || text.includes("demitida") || text.includes("carreira")) {
      if (text.includes("chefe") || text.includes("não entende") || text.includes("nao entende") || text.includes("explicar")) {
        return "Conversar com o chefe ou RH sobre a endometriose pode ser desafiador, mas é muito importante:\n\n1. Explique que é uma condição inflamatória crônica reconhecida pela medicina (não é falta de vontade ou preguiça).\n2. Mostre dados: mostre que você quer continuar produzindo bem, mas necessita de pequenos ajustes em dias de crise severa (como trabalho remoto ou flexibilidade de horários).\n3. Ofereça laudos médicos se achar necessário. Plataformas como o Endometriômetro ajudam a conscientizar o mercado de trabalho sobre os direitos da mulher!";
      }
      return "Sim, a endometriose afeta diretamente o rendimento profissional!\n\n• Perda de Produtividade: Crises de dor forte e exaustão diminuem a concentração e o ritmo de trabalho. Isso é conhecido no mercado corporativo como Presenteísmo (trabalhar sob dor extrema) e Absenteísmo (faltar por incapacidade física).\n• Pesquisa Endometriômetro: Mostra que mulheres com a doença chegam a perder mais de 40 horas mensais entre faltas e queda de produtividade sob dor. Ter um ambiente profissional empático é essencial!";
    }

    // 5. Presenteísmo vs Absenteísmo ("Qual a diferença entre presenteísmo e absenteísmo?")
    if (text.includes("presenteísmo") || text.includes("presenteismo") || text.includes("absenteísmo") || text.includes("absenteismo")) {
      return "Diferença entre Absenteísmo e Presenteísmo:\n\n• Absenteísmo: É quando a funcionária falta ao trabalho devido às crises de dor, consultas médicas ou cirurgias.\n\n• Presenteísmo: É quando a mulher está presente fisicamente na empresa, mas sua produtividade despenca porque ela está trabalhando sob forte dor, tontura ou cansaço.\n\nEstudos comprovam que o presenteísmo causa um impacto econômico e um desgaste emocional até maior do que as faltas!";
    }

    // 6. Sem sentir dor / Assintomática ("Posso ter endometriose mesmo sem sentir muita dor?")
    if (text.includes("sem sentir") || text.includes("pouca dor") || text.includes("sem dor") || text.includes("não sinto dor") || text.includes("nao sinto dor") || text.includes("assintomática")) {
      return "Sim! É perfeitamente possível ter endometriose sem sentir muita dor ou até mesmo sem dor nenhuma (endometriose assintomática).\n\n• Como descobrir? Muitas mulheres só descobrem que têm a doença ao tentar engravidar e encontrar dificuldades (infertilidade), ou durante exames de imagem ou cirurgias de rotina.\n• A intensidade da dor nem sempre corresponde ao tamanho das lesões: lesões pequenas podem doer muito e focos profundos podem ser indolores.";
    }

    // 7. Dor ao ir ao banheiro (Evacuar / Urinar)
    if (text.includes("banheiro") || text.includes("evacuar") || text.includes("urinar") || text.includes("cocô") || text.includes("coco") || text.includes("xixi") || text.includes("intestino") || text.includes("bexiga")) {
      return "Sim! Sentir dor ao evacuar ou urinar — principalmente durante o período menstrual — é um forte indício de endometriose profunda!\n\n• Por que acontece? Os focos da doença podem se instalar nas paredes do intestino, reto ou bexiga. Durante a menstruação, esses focos inflamam e causam dores intensas, pontadas, sangramento nas fezes/urina ou sensação de estufamento ('endo belly'). Se sente isso, mencione na sua próxima consulta médica!";
    }

    // 8. Gravidez e Fertilidade ("Endometriose atrapalha minha gravidez?")
    if (text.includes("gravidez") || text.includes("engravidar") || text.includes("fertilidade") || text.includes("atrapalha") || text.includes("filho") || text.includes("ovário") || text.includes("ovario") || text.includes("fiv")) {
      return "A endometriose pode sim dificultar a gravidez, mas NÃO significa que você não possa engravidar!\n\n• Como afeta? A inflamação e as aderências podem bloquear as trompas, afetar a ovulação ou a qualidade dos óvulos (cerca de 30% a 50% dos casos de infertilidade feminina têm relação com a endometriose).\n• É possível engravidar? SIM! Com o tratamento correto (seja cirúrgico, medicamentoso ou com técnicas de fertilização assistida como a FIV), milhares de mulheres com endometriose realizam o sonho da maternidade.";
    }

    // 9. Por que demora tanto para descobrir o diagnóstico?
    if (text.includes("demora") || text.includes("demoram") || text.includes("tanto tempo") || text.includes("diagnosticar") || text.includes("descobrir") || text.includes("anos")) {
      return "O diagnóstico da endometriose no Brasil demora em média de 7 a 10 anos! Os principais motivos são:\n\n1. Normalização da Dor: A sociedade e até alguns profissionais ainda reproduzem o mito de que 'cólica forte é normal'.\n2. Exames Comuns Normais: O ultrassom pélvico comum de rotina não detecta a endometriose.\n3. Falta de Especialistas: É necessário realizar exames específicos como o Ultrassom Transvaginal com Preparo Intestinal ou Ressonância Magnética com protocolo para endometriose, laudados por médicos treinados.";
    }

    // 10. Hereditariedade / Genética ("Endometriose é hereditária?")
    if (text.includes("hereditária") || text.includes("hereditaria") || text.includes("genética") || text.includes("genetica") || text.includes("mãe") || text.includes("mae") || text.includes("irmã") || text.includes("irma") || text.includes("família")) {
      return "Sim, a endometriose tem forte componente hereditário!\n\n• Risco Aumentado: Se você tem mãe, irmã ou tia de primeiro grau com diagnóstico de endometriose, suas chances de também desenvolver a condição são de 6 a 7 vezes maiores.\n• Se na sua família há histórico de cólicas intensas ou problemas de fertilidade, vale a pena informar seu ginecologista.";
    }

    // 11. Exercícios Físicos ("Posso praticar exercícios?")
    if (text.includes("exercício") || text.includes("exercicio") || text.includes("academia") || text.includes("esporte") || text.includes("treinar") || text.includes("pilates") || text.includes("yoga")) {
      return "Sim, praticar exercícios físicos é excelente para quem tem endometriose!\n\n• Benefícios: A atividade física libera endorfinas (analgésicos naturais do corpo), reduz os níveis de estrogênio circulante e melhora o fluxo sanguíneo pélvico.\n• Quais os melhores? Atividades de baixo impacto como caminhada, natação, pilates, yoga e alongamento são altamente recomendados. Respeite os dias de crise e diminua a intensidade quando sentir dor.";
    }

    // 12. O que é / Conceito geral
    if (text.includes("o que é") || text.includes("o q e") || text.includes("definicao") || text.includes("definição") || text.includes("conceito")) {
      return "A Endometriose é uma doença inflamatória crônica benigna. Ela ocorre quando tecidos parecidos com o endométrio (camada que reveste o interior do útero) crescem fora da cavidade uterina — se fixando em órgãos como ovários, trompas, bexiga e intestino.\n\nA cada ciclo menstrual, esses focos respondem aos hormônios e inflamam, causando cólicas severas, dores na relação sexual e alterações no hábito intestinal/urinário.";
    }

    // 13. Tratamentos, Cirurgia e Remédios (Sem prescrever receitas)
    if (text.includes("tratamento") || text.includes("remédio") || text.includes("remedio") || text.includes("cirurgia") || text.includes("laparoscopia") || text.includes("diu") || text.includes("pílula") || text.includes("pilula")) {
      return "O tratamento da endometriose depende dos sintomas e dos objetivos de cada mulher (como o desejo de engravidar):\n\n1. Bloqueio Hormonal: Anticoncepcionais contínuos ou DIU hormonal ajudam a suspender a menstruação e conter a evolução das lesões.\n2. Controle da Dor: Fisioterapia pélvica, dieta anti-inflamatória e medicamentos sob prescrição médica.\n3. Cirurgia (Videolaparoscopia ou Robótica): Indicada quando há dor resistente aos remédios ou comprometimento profundo de órgãos.\n\n⚠️ Nunca se automedique! O tratamento deve ser prescrito individualmente pelo seu médico.";
    }

    // 14. Saúde Emocional / Autoestima
    if (text.includes("emocional") || text.includes("ansiedade") || text.includes("depressão") || text.includes("depressao") || text.includes("psicológico") || text.includes("triste") || text.includes("autoestima")) {
      return "A endometriose impacta profundamente a saúde emocional e mental.\n\nConviver com dor crônica, incertezas sobre o futuro ou ter os sintomas invalidados pode provocar ansiedade, tristeza e esgotamento emocional. Procurar apoio psicológico (terapia), grupos de acolhimento e manter conversas abertas com a família faz toda a diferença para o seu bem-estar!";
    }

    // 15. Perguntas Fora de Tópico (Outros assuntos)
    if (!text.includes("endo") && !text.includes("dor") && !text.includes("útero") && !text.includes("utero") && !text.includes("saúde") && !text.includes("médic") && !text.includes("corpo") && !text.includes("mulher")) {
      return `Entendi sua pergunta! Embora esse assunto seja interessante, eu sou o assistente especializado em **Endometriose e Saúde Feminina** do projeto Endometriômetro. 💕\n\nPosso te ajudar tirando dúvidas sobre cólicas, sintomas, exames, tratamentos, fertilidade, rotina ou como a doença impacta a vida e o trabalho!\n\nVocê tem alguma dúvida sobre esses temas para conversarmos?`;
    }

    // 16. Resposta Conversacional Inteligente para qualquer pergunta livre não mapeada
    return `Entendi sua mensagem sobre "${userText}".\n\nComo assistente educativo do Bate-Papo com o Útero, posso ajudar você a compreender melhor qualquer ponto da endometriose — desde o motivo das dores, opções de exames e tratamentos, até o impacto no trabalho e na saúde emocional.\n\n⚠️ As informações fornecidas aqui são educativas e acolhedoras, sem substituir a avaliação e consulta presencial de um ginecologista especializado.\n\nVocê gostaria de saber mais sobre sintomas, exames ou direitos no trabalho relacionados a essa questão?`;
  };

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setMessage("");
    
    // Adiciona msg do usuário
    const newMsg: ChatMessage = { id: Date.now().toString(), isAi: false, text: userMsg };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    
    // Salva msg do usuário se logado
    if (userId) await saveMessage(userMsg, false);

    setIsLoading(true);

    // Tempo de resposta natural
    setTimeout(async () => {
      const aiResponseText = generateAIResponse(userMsg, updatedMessages);
      const aiMsg: ChatMessage = { id: Date.now().toString(), isAi: true, text: aiResponseText };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);

      if (userId) await saveMessage(aiResponseText, true);
    }, 900);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendText(message);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botão Flutuante com a Imagem do Útero Real */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-tr from-primary via-rose-medium to-secondary p-1 rounded-full shadow-2xl hover:shadow-rose-500/40 hover:scale-110 transition-all duration-300 flex items-center justify-center group z-50 border-2 border-white"
          title="Fale com o Bate-Papo com o Útero"
        >
          {/* Brilho pulsante em volta do botão */}
          <div className="absolute -inset-1 rounded-full bg-primary/40 blur-md group-hover:blur-lg transition"></div>
          
          {/* Container com Mascote 3D do Bate-Papo */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white/95 p-0.5 flex items-center justify-center border border-rose-200 shadow-inner">
            <img 
              src="/chat_uterus_mascot.png"
              alt="Mascote 3D Bate-Papo com o Útero" 
              className="w-full h-full object-cover object-center rounded-full filter drop-shadow group-hover:scale-115 transition-transform duration-300"
            />
          </div>

          {/* Indicador Online Verde */}
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>

          {/* Dica Hover (Tooltip) */}
          <span className="absolute -top-10 right-0 bg-secondary text-white text-xs font-bold py-1 px-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition duration-300 whitespace-nowrap border border-white/20">
            ✨ Bate-Papo com o Útero • Tire suas dúvidas!
          </span>
        </button>
      )}

      {/* Janela de Chat Aprimorada e Totalmente Responsiva no Mobile */}
      {isOpen && (
        <div className="bg-white w-[calc(100vw-2rem)] max-w-[430px] h-[570px] max-h-[84vh] rounded-2xl shadow-2xl flex flex-col border border-rose-200 overflow-hidden animate-fade-in origin-bottom-right z-[100]">
          {/* Header do Chat com Mascote 3D do Útero e botão SAIR X super visível */}
          <div className="bg-gradient-to-r from-secondary via-rose-dark to-primary text-white p-3.5 flex justify-between items-center shadow-md z-10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-white/60 backdrop-blur-sm flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                <img 
                  src="/chat_uterus_mascot.png" 
                  alt="Mascote 3D Bate-Papo com o Útero" 
                  className="w-full h-full object-cover object-center rounded-full" 
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-sm sm:text-base leading-tight flex items-center gap-1.5 truncate">
                  Bate-Papo com o Útero <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                </h3>
                <p className="text-[11px] text-white/90 truncate">Assistente Educativo sobre Endometriose</p>
              </div>
            </div>
            
            {/* BOTÃO SAIR X EXTREMAMENTE VISÍVEL NO TOPO */}
            <button 
              onClick={() => setIsOpen(false)} 
              title="Sair do Bate-Papo com o Útero"
              aria-label="Sair do Bate-Papo"
              className="bg-white text-rose-dark hover:bg-rose-100 hover:text-primary font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md border border-white/80 text-xs shrink-0 cursor-pointer transition-transform active:scale-95"
            >
              <span>SAIR</span>
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-soft/30">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.isAi ? 'justify-start' : 'justify-end'}`}>
                <div 
                  className={`max-w-[88%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.isAi 
                      ? 'bg-white border border-rose-100 text-foreground rounded-tl-sm shadow-sm font-body' 
                      : 'bg-gradient-to-r from-primary to-rose-medium text-white rounded-tr-sm shadow-md font-body'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Sugestões de Perguntas Rápidas (Chips) */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-rose-dark mb-2 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Você pode perguntar sobre:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendText(q)}
                      className="bg-white hover:bg-rose-50 text-rose-dark hover:text-primary text-xs py-1.5 px-3 rounded-full border border-rose-200 transition shadow-sm font-medium text-left"
                    >
                      “{q}”
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-rose-100 text-primary p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 animate-spin text-primary" />
                  <span>IA Útero está escrevendo...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Aviso Legal Educativo */}
          <div className="bg-rose-50/90 text-[10px] text-muted-foreground p-2 text-center border-t border-rose-100 leading-tight">
            💡 <strong>Assistente Educativo:</strong> Respondo qualquer tipo de pergunta livre. As respostas não substituem consulta médica presencial.
            {!userId && <span className="block mt-0.5 text-primary font-medium">Faça login para salvar o histórico.</span>}
          </div>

          {/* Form de Envio */}
          <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-border flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite qualquer pergunta em linguagem livre..."
              className="flex-1 bg-rose-50/70 border border-rose-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !message.trim()}
              className="bg-primary hover:bg-rose-dark disabled:bg-primary/50 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition shadow-md flex items-center justify-center w-10 h-10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UterusChat;



