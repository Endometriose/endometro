import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, HelpCircle, Minus, Maximize, Info, ChevronDown, ChevronUp, BarChart2, ShieldCheck, Building2 } from "lucide-react";
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
    if (text.includes("dor insuportável") || text.includes("dor insuportavel") || text.includes("desmai") || text.includes("sangramento muito forte") || text.includes("hemorragia") || text.includes("suicídi") || text.includes("suicidi") || text.includes("não aguento mais viver") || text.includes("nao aguento mais viver") || text.includes("febre alta")) {
      return "Estou aqui para te acolher, mas o que você relatou é um sinal de alerta que precisa de avaliação médica urgente.\n\nPor favor, não espere. Procure um pronto-socorro ou ligue para o SAMU (192) caso sinta dores incapacitantes, desmaios ou sangramento muito intenso.\n\nSe estiver sentindo profundo sofrimento emocional, o CVV (Centro de Valorização da Vida) oferece apoio confidencial 24h pelo número 188. Você não está sozinha.";
    }

    // 1. Saudações
    if (text.match(/^(olá|ola|oi|bom dia|boa tarde|boa noite|e ai|e aí|oie|salve|tudo bem|como vai)/i) && text.length < 25) {
      return "Olá! Que alegria conversar com você! 💕\n\nSou o Endozinho, seu assistente virtual especializado em Endometriose e Saúde da Mulher. Você pode me fazer QUALQUER pergunta sobre a doença, sintomas, exames, tratamentos cirúrgicos e medicamentosos, fertilidade, alimentação, saúde emocional ou trabalho.\n\nQual é a sua dúvida ou como posso te apoiar hoje?";
    }

    // 2. O que é endometriose / adenomiose
    if (text.includes("o que é") || text.includes("o que e") || text.includes("defin") || text.includes("adenomiose") || text.includes("conceito")) {
      return "A **endometriose** é uma doença inflamatória crônica em que células semelhantes ao endométrio (o tecido que reveste o útero por dentro) crescem fora da cavidade uterina — como nos ovários, trompas, intestino, bexiga e peritônio pélvico.\n\nA cada ciclo menstrual, esse tecido reage aos hormônios, incha e sangra, mas sem ter por onde sair, provocando inflamação profunda, aderências e dores intensas.\n\nJá a **adenomiose** ocorre quando esse tecido endometrial se infiltra na própria parede muscular do útero (o miométrio), causando aumento do útero, cólicas fortes e sangramento abundante.";
    }

    // 3. Cólicas e dores
    if (text.includes("cólica") || text.includes("dor forte") || text.includes("dói muito") || text.includes("dor pelvica") || text.includes("dor pélvica") || text.includes("dor nas pernas") || text.includes("lombar")) {
      return "A cólica da endometriose é diferente da cólica menstrual comum: ela costuma ser progressiva, incapacitante e muitas vezes não cede a analgésicos habituais.\n\nO sangramento dos focos fora do útero gera inflamação severa e pode atingir feixes nervosos na pelve, causando dores que irradiam para a lombar, cóccix e pernas.\n\n⚠️ **Importante:** Sentir dor que impede suas atividades diárias NÃO é normal! É um sinal clínico essencial para investigar a endometriose com um ginecologista especialista.";
    }

    // 4. Sintomas gerais
    if (text.includes("sintomas") || text.includes("sinais") || text.includes("como saber")) {
      return "Os principais sintomas da endometriose envolvem os chamados '6 D's':\n\n1. **Dismenorreia:** cólica menstrual intensa e progressiva;\n2. **Dispareunia:** dor profunda durante ou após o contato sexual;\n3. **Disquezia:** dor, desconforto, diarreia ou constipação ao evacuar (especialmente na menstruação);\n4. **Disúria:** dor, pontadas ou sensação de queimação ao urinar no período menstrual;\n5. **Dor pélvica crônica:** dor na parte baixa do abdome mesmo fora da menstruação;\n6. **Dificuldade reprodutiva:** infertilidade ou demora para engravidar.\n\nOutros sintomas comuns são cansaço extremo (fadiga crônica) e distensão abdominal ('endo belly').";
    }

    // 5. Relação sexual / Dispareunia
    if (text.includes("sexo") || text.includes("relação") || text.includes("relacao") || text.includes("transar") || text.includes("dispareunia") || text.includes("penetração")) {
      return "A dor profunda durante ou após a relação sexual (chamada de dispareunia de profundidade) é um dos sintomas mais marcantes da endometriose.\n\nEla ocorre frequentemente pelo acometimento dos ligamentos uterossacros, fundo de saco de Douglas ou septo retovaginal. Não sinta vergonha de relatar isso ao seu médico!\n\nAlém de tratamentos específicos para os focos, a **fisioterapia pélvica** é uma grande aliada para relaxar a musculatura do assoalho pélvico e recuperar a qualidade de vida sexual.";
    }

    // 6. Intestino / Fezes / Bexiga / Urina
    if (text.includes("intestino") || text.includes("evacuar") || text.includes("fezes") || text.includes("barriga inchada") || text.includes("endo belly") || text.includes("bexiga") || text.includes("urina") || text.includes("xixi")) {
      return "A endometriose profunda acomete com frequência o trato intestinal (reto e sigmoide) e urinário (bexiga e ureteres).\n\n• **No intestino:** pode causar dor ao evacuar, sensação de evacuação incompleta, diarreia ou prisão de ventre cíclica e sangramento retal.\n• **Na bexiga:** pode provocar urgência urinária, dor na micção e sensação de 'cistite de repetição' com urocultura negativa.\n\nO mapeamento por ressonância ou ultrassom com preparo intestinal é indispensável para identificar esses focos com precisão milimétrica.";
    }

    // 7. Diagnóstico e Exames
    if (text.includes("diagnóstico") || text.includes("diagnostico") || text.includes("exame") || text.includes("ressonância") || text.includes("ressonancia") || text.includes("ultrassom") || text.includes("ultrassonografia") || text.includes("ca-125") || text.includes("ca 125")) {
      return "O diagnóstico da endometriose evoluiu muito nos últimos anos! Hoje, os exames padrão-ouro não invasivos são:\n\n1. **Ultrassonografia Transvaginal com Preparo Intestinal:** realizada por médico radiologista dedicado e capacitado em endometriose, capaz de mapear nódulos nos ovários, intestino, ligamentos e bexiga.\n2. **Ressonância Magnética da Pelve com protocolo para endometriose:** essencial para estadiamento e planejamento cirúrgico.\n3. **Marcador CA-125:** pode estar elevado, mas seu resultado normal NÃO descarta a doença.\n\nO exame clínico detalhado e a escuta atenta dos sintomas continuam sendo o primeiro e mais importante passo!";
    }

    // 8. Fertilidade e Gravidez
    if (text.includes("fertilidade") || text.includes("engravidar") || text.includes("gravidez") || text.includes("filho") || text.includes("fiv") || text.includes("infértil") || text.includes("infert")) {
      return "A endometriose pode ser uma causa de infertilidade (devido a aderências tubárias, endometriomas ovarianos e microambiente inflamatório tóxico aos óvulos), mas **ter endometriose NÃO significa que você não poderá ser mãe!**\n\nMuitas mulheres engravidam espontaneamente após o controle clínico ou cirúrgico, e a reprodução assistida (como a Fertilização in Vitro - FIV) apresenta excelentes taxas de sucesso. Se você deseja engravidar, converse com um especialista para avaliar a reserva ovariana (hormônio antimülleriano) e planejar sua fertilidade com tranquilidade.";
    }

    // 9. Tratamentos clínicos e medicamentos
    if (text.includes("tratamento") || text.includes("remédio") || text.includes("medicamento") || text.includes("anticoncepcional") || text.includes("diu") || text.includes("mirena") || text.includes("kyleena") || text.includes("dienogeste") || text.includes("progest") || text.includes("gnrh")) {
      return "O tratamento da endometriose busca controlar a dor, preservar a fertilidade e frear a progressão dos focos. As principais abordagens clínicas incluem:\n\n• **Bloqueio hormonal da ovulação/menstruação:** progestagênios isolados (como o dienogeste), pílulas contínuas, implantes ou DIU hormonal (levonorgestrel);\n• **Análogos ou antagonistas de GnRH:** em situações selecionadas para supressão hormonal temporária;\n• **Tratamento multidisciplinar:** anti-inflamatórios orientados, fisioterapia pélvica, suporte psicológico e exercícios físicos regulares.\n\nLembre-se: qualquer medicação deve ser prescrita exclusivamente por médico ginecologista.";
    }

    // 10. Cirurgia / Videolaparoscopia / Robótica
    if (text.includes("cirurgia") || text.includes("laparoscopia") || text.includes("videolaparoscopia") || text.includes("robótica") || text.includes("operar") || text.includes("excisão")) {
      return "A cirurgia para endometriose é indicada quando há falha do tratamento medicamentoso com dor incapacitante contínua, risco de obstrução intestinal/urinária ou em casos específicos de infertilidade.\n\nA técnica padrão-ouro é a **videolaparoscopia ou cirurgia robótica de excisão completa**, em que os focos e aderências são removidos pela raiz, preservando os órgãos e a reserva ovariana.\n\nA cirurgia deve ser realizada por equipe multidisciplinar experiente (ginecologista cirurgião, coloproctologista e urologista se necessário).";
    }

    // 11. Estadiamento / Graus da Endometriose
    if (text.includes("grau") || text.includes("estágio") || text.includes("estagio") || text.includes("estadiamento") || text.includes("rasrm") || text.includes("enzian")) {
      return "A endometriose é tradicionalmente classificada em 4 graus (classificação rASRM):\n\n• **Grau I (Mínima):** pequenos implantes superficiais isolados;\n• **Grau II (Leve):** focos superficiais um pouco mais numerosos;\n• **Grau III (Moderada):** implantes mais profundos, possíveis endometriomas ovarianos e aderências iniciais;\n• **Grau IV (Grave/Severa):** grandes endometriomas ovarianos, aderências densas e focos profundos no intestino ou bexiga (classificação #Enzian).\n\n⚠️ **Curiosidade importante:** A intensidade da dor NEM SEMPRE reflete o grau anatômico! Uma mulher com grau I pode sentir dores severas, enquanto outra com grau IV pode ter sintomas mais sutis. Cada corpo é único!";
    }

    // 12. Alimentação e estilo de vida
    if (text.includes("alimenta") || text.includes("dieta") || text.includes("comer") || text.includes("nutri") || text.includes("inflama") || text.includes("açúcar") || text.includes("leite") || text.includes("glúten") || text.includes("gluten")) {
      return "Como a endometriose é uma doença inflamatória crônica, a **nutrição anti-inflamatória** desempenha um papel fundamental no alívio dos sintomas!\n\n• **Alimentos que ajudam:** peixes ricos em ômega-3, azeite de oliva extravirgem, frutas vermelhas, cúrcuma, gengibre, folhas verdes escuras, sementes (linhaça, chia) e água abundante.\n• **Alimentos para moderar ou evitar:** ultraprocessados, excesso de açúcar refinado, gorduras trans, carnes vermelhas em excesso e consumo exagerado de cafeína e álcool.\n\nO acompanhamento com nutricionista especializada em saúde da mulher faz enorme diferença!";
    }

    // 13. Trabalho, Direitos e Produtividade
    if (text.includes("trabalho") || text.includes("produtividade") || text.includes("chefe") || text.includes("empresa") || text.includes("rh") || text.includes("atestado") || text.includes("falta") || text.includes("demissão") || text.includes("lei") || text.includes("direito")) {
      return "A endometriose tem profundo impacto na vida profissional:\n\n• Causa **absenteísmo** (faltas justificadas por atestados médicos) e **presenteísmo** (trabalhar sob dor intensa com queda acentuada de foco e produtividade);\n• A colaboradora tem direito garantido por lei à emissão de atestados médicos e ao sigilo de seus diagnósticos (conforme a LGPD e resoluções do CFM);\n• Empresas inovadoras e conscientes oferecem políticas de apoio, como flexibilidade de horários, regime de trabalho híbrido nos dias críticos e encaminhamento a especialistas.\n\nA plataforma ENDOMETRIÔMETRO foi criada exatamente para gerar dados corporativos que sensibilizem o RH e apoiem as mulheres no ambiente de trabalho!";
    }

    // 14. Resposta educativa ampla para qualquer outro questionamento relacionado
    return `Que pergunta relevante sobre a endometriose! 💕\n\nComo Endozinho, seu assistente educativo no ENDOMETRIÔMETRO, posso te assegurar que você não está sozinha e que toda dúvida sobre seu corpo, dores e saúde merece atenção cuidadosa.\n\nA endometriose é uma condição crônica complexa que exige abordagem acolhedora e integrada: diagnóstico com exames específicos (como o ultrassom com preparo intestinal), controle de dor personalizado, cuidado nutricional e acompanhamento especializado.\n\nLembre-se sempre: sentir dores incapacitantes que travam a sua vida NUNCA deve ser normalizado. Posso detalhar mais algum aspecto sobre sintomas, exames ou tratamentos para te ajudar?`;
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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          const aiMsg: ChatMessage = { 
            id: Date.now().toString(), 
            isAi: true, 
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMsg]);
          setIsLoading(false);
          if (userId) await saveMessage(data.text, true);
          return;
        }
      }
    } catch (e) {
      console.warn("Fallback para regras educativas locais do Endozinho:", e);
    }

    // Fallback garantido usando respostas educativas estruturadas
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
    }, 600);
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
