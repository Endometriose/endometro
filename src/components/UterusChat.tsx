import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, HelpCircle, Minus, Info, ChevronDown, ChevronUp, BarChart2, ShieldCheck, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

interface ChatMessage {
  id: string;
  isAi: boolean;
  text: string;
  timestamp?: string;
}

const SUGGESTED_QUESTIONS = [
  "Por que minha cólica dói tanto?",
  "Quais são os sintomas da endometriose?",
  "Como é feito o diagnóstico?",
  "Endometriose afeta a fertilidade?",
  "Como lidar com a dor no trabalho?",
  "Quais tratamentos existem?"
];

const INITIAL_MESSAGES = [
  "Oi! Eu sou o Endozinho 💕",
  "Sou seu assistente virtual sobre endometriose. Pode perguntar do seu jeito, sem pressa e sem julgamento.",
  "Posso ajudar com sintomas, exames, tratamentos, fertilidade, rotina, saúde emocional e trabalho. Por onde você quer começar?"
];

const UterusChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [initialSequenceDone, setInitialSequenceDone] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showEndometriometroModal, setShowEndometriometroModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen, isMinimized, showSuggestions]);

  // Ouve evento do menu para abrir o modal do Endometri\u00f4metro
  useEffect(() => {
    const handler = () => setShowEndometriometroModal(true);
    window.addEventListener("open-endometriometro-modal", handler);
    return () => window.removeEventListener("open-endometriometro-modal", handler);
  }, []);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`;
    }
  }, [message]);

  useEffect(() => {
    const initSession = async () => {
      let uid = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          uid = user.id;
          setUserId(uid);
          await loadHistory(uid);
          return;
        }
      } catch (e) {
        console.error("Erro ao verificar usuário no chat:", e);
      }
      
      // Se não tem usuário ou histórico, envia as mensagens iniciais animadas
      if (!hasStarted && messages.length === 0) {
        playInitialSequence();
      }
    };
    initSession();
  }, []);

  const playInitialSequence = async () => {
    setHasStarted(true);
    let currentMsgs: ChatMessage[] = [];
    
    for (let i = 0; i < INITIAL_MESSAGES.length; i++) {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 800)); // pausa curta
      
      const newMsg: ChatMessage = {
        id: `init-${i}`,
        isAi: true,
        text: INITIAL_MESSAGES[i],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      currentMsgs = [...currentMsgs, newMsg];
      setMessages([...currentMsgs]);
      setIsLoading(false);
    }
    // Sinaliza que a sequência inicial terminou — chips podem aparecer
    setInitialSequenceDone(true);
  };

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
        setHasStarted(true);
        setMessages(data.map(d => ({ 
          id: d.id, 
          isAi: d.is_ai, 
          text: d.message,
          timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
        setShowSuggestions(false); // Já conversou
      } else {
        if (!hasStarted) playInitialSequence();
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

  const generateAIResponse = (userText: string, contextHistory: ChatMessage[]): string => {
    const text = userText.toLowerCase().trim();

    // 0. Sinais de urgência / emergência
    if (text.includes("dor insuportável") || text.includes("dor insuportavel") || text.includes("desmai") || text.includes("sangramento muito forte") || text.includes("hemorragia") || text.includes("suicídi") || text.includes("suicidi") || text.includes("não aguento mais viver") || text.includes("nao aguento mais viver") || text.includes("febre")) {
      return "Estou aqui para te acolher, mas o que você relatou é um sinal de alerta que precisa de avaliação médica urgente.\n\nPor favor, não espere. Procure um pronto-socorro ou ligue para o SAMU (192) caso sinta dores incapacitantes, desmaios ou sangramento muito intenso.\n\nSe estiver sentindo profundo sofrimento emocional, o CVV (Centro de Valorização da Vida) oferece apoio confidencial 24h pelo número 188. Você não está sozinha.";
    }

    // 1. Saudações
    if (text.match(/^(olá|ola|oi|bom dia|boa tarde|boa noite|e ai|e aí|oie|salve|tudo bem|como vai)/i) && text.length < 25) {
      return "Olá! Que bom conversar com você! 💕\n\nSou o Endozinho, seu assistente educativo. Você pode me fazer qualquer pergunta sobre a endometriose, seus sintomas, tratamentos, exames, fertilidade, saúde mental ou impactos na carreira profissional.\n\nQual é a sua dúvida ou como você está se sentindo hoje?";
    }

    if (text.includes("cólica") || text.includes("dor forte") || text.includes("dói muito")) {
      return "A cólica da endometriose dói intensamente porque o tecido endometrial presente fora do útero também sangra, causando inflamação profunda, inchaço e cicatrizes que irritam os nervos pélvicos.\n\nLembre-se: cólica incapacitante que não passa com analgésicos comuns NÃO é normal. É fundamental conversar com um ginecologista especialista para buscar qualidade de vida.";
    }

    if (text.includes("sintomas")) {
      return "Os sintomas mais comuns da endometriose incluem:\n\n• Cólicas intensas (dismenorreia)\n• Dor profunda durante a relação sexual (dispareunia)\n• Dor ao urinar ou evacuar (principalmente no período menstrual)\n• Fluxo menstrual intenso\n• Cansaço extremo (fadiga crônica)\n• Dificuldade para engravidar\n\nVocê tem sentido algum desses sinais?";
    }

    if (text.includes("diagnóstico") || text.includes("diagnostico") || text.includes("descobrir")) {
      return "O diagnóstico correto é feito unindo a sua história clínica com exames de imagem especializados.\n\nO Ultrassom Transvaginal com Preparo Intestinal e a Ressonância Magnética da Pelve (com protocolo específico) são os exames padrão-ouro. É importante que sejam avaliados por médicos experientes em endometriose.";
    }

    if (text.includes("fertilidade") || text.includes("engravidar") || text.includes("gravidez")) {
      return "A endometriose pode dificultar a gravidez (devido à inflamação e possíveis bloqueios nas trompas), mas NÃO significa infertilidade absoluta!\n\nMilhares de mulheres com endometriose engravidam espontaneamente ou com ajuda de tratamentos, cirurgias e fertilização in vitro (FIV). O acompanhamento médico é essencial para traçar o melhor plano para você.";
    }

    if (text.includes("trabalho") || text.includes("produtividade") || text.includes("chefe")) {
      return "A endometriose afeta muito o dia a dia profissional, gerando cansaço e dores que derrubam a produtividade (presenteísmo) ou causam faltas (absenteísmo).\n\nConversar com o RH ou liderança sobre essa condição crônica é um passo importante. Algumas mulheres se beneficiam muito de jornadas flexíveis ou home office nos dias de crise aguda.";
    }

    if (text.includes("tratamento") || text.includes("remédio") || text.includes("cirurgia")) {
      return "O tratamento é sempre individualizado e depende do que você deseja para sua vida agora.\n\nEle pode envolver o bloqueio hormonal (para suspender a menstruação e controlar a dor), fisioterapia pélvica, mudanças na dieta, e em alguns casos, cirurgia (videolaparoscopia) para remover os focos da doença.\n\nSempre converse com seu médico antes de tomar qualquer decisão ou medicamento.";
    }

    // Perguntas Fora de Tópico
    if (!text.includes("endo") && !text.includes("dor") && !text.includes("útero") && !text.includes("utero") && !text.includes("saúde") && !text.includes("médic") && !text.includes("corpo") && !text.includes("mulher") && !text.includes("sangue") && !text.includes("menstrua")) {
      return `Que assunto interessante! Mas meu foco aqui é exclusivo: sou o Endozinho, seu assistente focado em Endometriose e Saúde da Mulher. 💕\n\nPosso te ajudar com dúvidas sobre cólicas, fertilidade, diagnósticos, direitos ou rotina com a doença. Há algo nessa área que você queira saber?`;
    }

    return `Entendi o que você quis dizer sobre "${userText}".\n\nComo Endozinho, estou aqui para te trazer informações educativas e te apoiar na sua jornada de entendimento sobre a endometriose.\n\nLembre-se que meu objetivo é informar e acolher, mas não substituo a avaliação médica presencial. Posso te ajudar detalhando mais algum ponto sobre sintomas ou tratamentos?`;
  };

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setMessage("");
    setShowSuggestions(false);
    
    const newMsg: ChatMessage = { 
      id: Date.now().toString(), 
      isAi: false, 
      text: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    
    if (userId) await saveMessage(userMsg, false);

    setIsLoading(true);

    setTimeout(async () => {
      const aiResponseText = generateAIResponse(userMsg, updatedMessages);
      const aiMsg: ChatMessage = { 
        id: Date.now().toString(), 
        isAi: true, 
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);

      if (userId) await saveMessage(aiResponseText, true);
    }, 1200); // Pausa realista para resposta
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText(message);
    }
  };

  if (!isOpen) {
    return (
      <div className="pointer-events-none">
        {/* Modal Endometriômetro */}
        {showEndometriometroModal && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pointer-events-auto"
            onClick={() => setShowEndometriometroModal(false)}
          >
            <div
              className="relative bg-white rounded-3xl shadow-2xl border border-rose-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Botão fechar */}
              <button
                onClick={() => setShowEndometriometroModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-rose-50 text-muted-foreground hover:text-primary transition z-10"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 md:p-12">
                {/* Badge */}
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent text-secondary font-bold text-xs uppercase tracking-wider mb-4">
                    <HelpCircle className="w-4 h-4" /> Instrumento Digital de Pesquisa
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    O que é o Endometriômetro?
                  </h2>
                </div>

                {/* Conteúdo */}
                <div className="space-y-6 text-sm md:text-base">
                  <div className="bg-rose-50/70 p-6 rounded-2xl border border-rose-100">
                    <p className="text-base md:text-lg font-medium text-foreground leading-relaxed">
                      O <strong>ENDOMETRIÔMETRO</strong> é um instrumento digital de pesquisa desenvolvido para coletar, organizar e analisar informações relacionadas à endometriose. Por meio da plataforma, é possível realizar pesquisas com diferentes públicos e obter dados que podem contribuir para compreender melhor a realidade, as necessidades e as experiências relacionadas à endometriose.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-secondary" /> Para que serve?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      A plataforma permite que prefeituras, empresas, hospitais, instituições de ensino, organizações de saúde e outras instituições possam solicitar ou realizar pesquisas, disponibilizando formulários por meio de links para os participantes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-sm space-y-2">
                      <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-primary" /> Camada de Análise
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        Após a coleta das respostas, os dados podem ser organizados, apresentados em gráficos e utilizados na geração de relatórios, facilitando a visualização e a interpretação das informações obtidas. O Endometriômetro é o instrumento de pesquisa, enquanto os gráficos, indicadores e relatórios constituem a camada de análise e apresentação dos dados coletados.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-sm space-y-2">
                      <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" /> Apoio à Tomada de Decisão
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        Dessa forma, a plataforma pode ser utilizada para apoiar pesquisas, estudos, ações institucionais, planejamento e tomada de decisões, de acordo com os objetivos definidos por cada organização responsável pela pesquisa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões flutuantes */}
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pointer-events-auto">
          {/* Botão Saiba o que é */}
          <button
            onClick={() => setShowEndometriometroModal(true)}
            className="bg-white text-primary border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-white text-[11px] font-bold uppercase tracking-wide py-2.5 px-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
            aria-label="Saiba o que é o Endometriômetro"
          >
            Saiba o que é o<br className="hidden sm:inline" /> Endometriômetro
          </button>

          {/* Botão Endozinho */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-tr from-primary via-rose-medium to-secondary p-1 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group border-2 border-white shrink-0"
            title="Fale com o Endozinho"
            aria-label="Abrir assistente Endozinho"
          >
            <div className="absolute -inset-1 rounded-full bg-primary/40 blur-md group-hover:blur-lg transition"></div>
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white p-0.5 flex items-center justify-center border border-rose-200">
              <img src="/chat_uterus_mascot.png" alt="Avatar Endozinho" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
            <span className="absolute -top-10 right-0 bg-secondary text-white text-xs font-bold py-1 px-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Fale com o Endozinho
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed z-[100] bg-white shadow-2xl border border-rose-200 overflow-hidden flex flex-col transition-all duration-300 ease-in-out
      ${isMinimized 
        ? "bottom-6 right-6 w-[320px] h-14 rounded-t-xl rounded-b-none" 
        : "bottom-0 right-0 w-full h-[100dvh] rounded-none md:bottom-6 md:right-6 md:w-[400px] md:h-[80vh] md:max-h-[650px] md:rounded-2xl"
      }
    `}>
      {/* Cabeçalho do Chat */}
      <div className="bg-gradient-to-r from-secondary via-rose-wine to-primary text-white p-3 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-full bg-white p-0.5 shrink-0">
            <img src="/chat_uterus_mascot.png" alt="Avatar Endozinho" className="w-full h-full object-cover rounded-full" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-[15px] flex items-center gap-1.5 truncate">
              Endozinho
            </h3>
            <p className="text-[11px] text-white/90 truncate">Assistente educativo sobre endometriose</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            title={isMinimized ? "Maximizar" : "Minimizar"}
            aria-label={isMinimized ? "Maximizar" : "Minimizar"}
            className="p-2 hover:bg-white/20 rounded-full transition focus:ring-2 focus:ring-white outline-none"
          >
            {isMinimized ? <Maximize className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            title="Fechar"
            aria-label="Fechar"
            className="p-2 hover:bg-rose-500 rounded-full transition focus:ring-2 focus:ring-white outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Área de Mensagens (aria-live) */}
          <div aria-live="polite" className="flex-1 overflow-y-auto p-4 bg-rose-pale/40 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-rose-200">
            {messages.map((m, index) => {
              const showAvatar = m.isAi && (index === 0 || !messages[index - 1].isAi);
              return (
                <div key={m.id} className={`flex gap-2 ${m.isAi ? 'justify-start' : 'justify-end'}`}>
                  {m.isAi && (
                    <div className="w-8 shrink-0 flex flex-col justify-end">
                      {showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-white p-0.5 border border-rose-200 shadow-sm">
                          <img src="/chat_uterus_mascot.png" alt="Endozinho" className="w-full h-full rounded-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${m.isAi ? 'items-start max-w-[80%]' : 'items-end max-w-[85%]'}`}>
                    <div 
                      className={`p-3 text-[15px] leading-relaxed whitespace-pre-wrap ${
                        m.isAi 
                          ? 'bg-white border border-rose-100 text-foreground rounded-2xl rounded-bl-sm shadow-sm' 
                          : 'bg-primary text-white rounded-2xl rounded-br-sm shadow-md'
                      }`}
                    >
                      {m.text}
                    </div>
                    {m.timestamp && (
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {m.timestamp}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2 justify-start items-end">
                <div className="w-8 shrink-0"></div>
                <div className="bg-white border border-rose-100 p-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5 h-10">
                  <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chips Sugestões — aparecem somente após a sequência inicial terminar */}
          {initialSequenceDone && showSuggestions && !isLoading && (
            <div className="px-3 pb-3 bg-rose-pale/40 border-b border-rose-100 animate-fade-in">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x md:flex-wrap">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendText(q)}
                    className="snap-start shrink-0 md:shrink border border-primary/30 text-primary hover:bg-primary hover:text-white bg-white text-[13px] py-1.5 px-3 rounded-full transition shadow-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {initialSequenceDone && !showSuggestions && messages.length > 0 && !isLoading && (
            <div className="px-3 py-2 bg-rose-pale/40 text-center">
              <button 
                onClick={() => setShowSuggestions(true)}
                className="text-xs text-primary font-medium hover:underline"
              >
                Ver sugestões de perguntas
              </button>
            </div>
          )}

          {/* Aviso Educativo — toggleável com botão Info */}
          <div className="bg-white border-t border-rose-100">
            {/* Linha do botão Info */}
            <div className="flex items-center justify-between px-3 py-1.5">
              <button
                onClick={() => setShowDisclaimer(prev => !prev)}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors group focus:outline-none"
                title={showDisclaimer ? "Ocultar aviso" : "Ver aviso de saúde"}
                aria-expanded={showDisclaimer}
              >
                <Info className="w-3.5 h-3.5 shrink-0 group-hover:text-primary transition-colors" />
                <span className="font-medium">Informação importante</span>
                {showDisclaimer
                  ? <ChevronUp className="w-3 h-3" />
                  : <ChevronDown className="w-3 h-3" />
                }
              </button>
              {!userId && (
                <Link to="/pesquisa" className="text-[11px] text-primary font-bold hover:underline shrink-0">
                  Entrar / Salvar histórico
                </Link>
              )}
            </div>

            {/* Conteúdo expansível com animação */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showDisclaimer ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="px-3 pb-2 text-[11px] text-muted-foreground text-center leading-relaxed">
                O <strong>Endozinho</strong> oferece informação educativa e <strong>não substitui consulta médica</strong>. Em caso de dor intensa, sangramento forte ou desmaio, procure atendimento de saúde.
              </p>
            </div>
          </div>

          {/* Campo de Envio (Textarea) */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendText(message); }} className="p-3 bg-white border-t border-border flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva sua pergunta aqui..."
              className="flex-1 bg-rose-50/50 border border-rose-200 rounded-2xl px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground resize-none overflow-y-auto min-h-[44px] max-h-[96px] shadow-inner"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !message.trim()}
              title="Enviar"
              aria-label="Enviar mensagem"
              className="bg-primary hover:bg-rose-dark disabled:bg-primary/40 disabled:cursor-not-allowed text-white rounded-full transition shadow-md flex items-center justify-center w-11 h-11 shrink-0 focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none mb-0.5"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default UterusChat;
