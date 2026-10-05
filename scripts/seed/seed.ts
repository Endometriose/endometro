/**
 * FASE 2C — SEED DE TESTE DO ENDOMETRIÔMETRO
 * ============================================
 * Script idempotente, determinístico e removível.
 * 
 * Comandos disponíveis (via npm run seed:*):
 *   seed:dry-run   — mostra o que seria criado sem gravar nada
 *   seed:apply     — cria os dados de teste
 *   seed:remove    — remove TUDO com seed_lote = LOTE_TESTE
 *   seed:status    — mostra contagem atual dos dados de teste
 * 
 * SEGURANÇA:
 *  - Credenciais SOMENTE de .env.seed.local (nunca no código)
 *  - Trava: recusa produção por padrão
 *  - Nenhum e-mail enviado
 *  - Nenhuma senha impressa em log
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { randomBytes } from "crypto";

// ─── Carregar .env.seed.local ────────────────────────────────
config({ path: resolve(process.cwd(), ".env.seed.local") });

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const SEED_EMPRESA_EMAIL = process.env.SEED_EMPRESA_EMAIL ?? "ctor4.com@gmail.com";
const SEED_EMPRESA_SENHA = process.env.SEED_EMPRESA_SENHA ?? "";
const POR_BAIRRO = parseInt(process.env.SEED_INDIVIDUAIS_POR_BAIRRO ?? "5", 10);
const SEED_LOTE = process.env.SEED_LOTE ?? "TESTE-2026-10";

// ─── Validações de segurança ─────────────────────────────────
const args = process.argv.slice(2);
const MODO = args[0] as "dry-run" | "apply" | "remove" | "status";
const PERMITIR_PRODUCAO =
  args.includes("--permitir-producao") &&
  args.includes("CONFIRMO DADOS DE TESTE EM PRODUCAO");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ BLOQUEADO: Preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.seed.local");
  process.exit(1);
}

// Trava de ambiente — recusa produção a não ser com flag explícita
const URL_LOWER = SUPABASE_URL.toLowerCase();
const PARECE_PRODUCAO =
  URL_LOWER.includes("prod") || URL_LOWER.includes("prd") || URL_LOWER.includes("live");

if (PARECE_PRODUCAO && !PERMITIR_PRODUCAO) {
  console.error("🚫 BLOQUEADO: A URL parece ser de PRODUÇÃO.");
  console.error("   Para forçar, passe: --permitir-producao 'CONFIRMO DADOS DE TESTE EM PRODUCAO'");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Dados Determinísticos ───────────────────────────────────
const BAIRROS = ["Centro", "Vila Vargas", "Bom Jesus", "Recanto do Lago"];

// Sintomas reais do questionário (extraídos de Pesquisa.tsx)
const TODOS_SINTOMAS = [
  "colica_intensa", "dor_relacao", "dor_pelvica_cronica", "dor_intestino",
  "dor_xixi", "historico_familiar", "dificuldade_engravidar", "dor_lombar_pernas",
  "uso_analgesicos", "historico_cistos", "fadiga_extrema", "ansiedade_dor",
];

// Faixas etárias reais do questionário
const FAIXAS = ["Menos de 18", "18 a 24 anos", "25 a 34 anos", "35 a 44 anos", "45 a 54 anos", "55 anos ou mais"];

// Datas fixas nos últimos 30 dias (determinísticas)
const DATAS_FIXAS = [
  "2026-09-07", "2026-09-08", "2026-09-10", "2026-09-12", "2026-09-14",
  "2026-09-16", "2026-09-18", "2026-09-19", "2026-09-21", "2026-09-23",
  "2026-09-25", "2026-09-26", "2026-09-28", "2026-09-30", "2026-10-01",
  "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-04", "2026-10-05",
];

// Combinações de sintomas fixas para os casos "com sintomas" (12 no total: 2/bairro + 4 empresa)
const SINTOMAS_FIXOS: string[][] = [
  ["colica_intensa", "dor_pelvica_cronica"],
  ["dor_relacao", "fadiga_extrema", "ansiedade_dor"],
  ["dor_intestino", "uso_analgesicos"],
  ["historico_familiar", "dificuldade_engravidar"],
  ["dor_xixi", "dor_lombar_pernas"],
  ["colica_intensa", "dor_relacao", "historico_cistos"],
  ["fadiga_extrema", "dor_pelvica_cronica"],
  ["uso_analgesicos", "ansiedade_dor"],
  ["colica_intensa", "dor_intestino"],
  ["dificuldade_engravidar", "fadiga_extrema"],
  ["historico_cistos", "dor_xixi"],
  ["dor_lombar_pernas", "dor_relacao"],
];

function buildPayload(
  nome: string,
  temSintomas: boolean,
  sintomasIdx: number,
  faixaIdx: number,
  bairro: string,
  cidade: string,
  uf: string
) {
  const sintomas = temSintomas ? SINTOMAS_FIXOS[sintomasIdx % SINTOMAS_FIXOS.length] : [];
  const horasAusencia = temSintomas ? String(8 + (sintomasIdx % 5) * 4) : "0";
  const diasAtestado = temSintomas ? String(1 + (sintomasIdx % 3)) : "0";
  return {
    idade: FAIXAS[faixaIdx % FAIXAS.length],
    cidade,
    bairro,
    uf,
    localidade: `${cidade}, ${bairro} / ${uf}`,
    email: "",
    empresa_token: null,
    diagnostico: temSintomas && sintomasIdx < 2 ? "Sim" : "Não",
    sintomas,
    intensidadeDor: temSintomas ? 7 + (sintomasIdx % 3) : 2,
    trabalha: "Sim",
    impactoTrabalho: temSintomas ? "Sim" : "Não",
    horasAusencia,
    diasAtestado,
    resultado: temSintomas ? "alta" : "baixa",
    lgpd_aceito: true,
    is_seed: true,
  };
}

// ─── Funções de Status e Contagem ────────────────────────────
async function getStatus() {
  const { count: respostas } = await supabase
    .from("survey_responses")
    .select("*", { count: "exact", head: true })
    .eq("seed_lote", SEED_LOTE);

  const { count: empresas } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true })
    .eq("seed_lote", SEED_LOTE);

  const { count: surveys } = await supabase
    .from("surveys")
    .select("*", { count: "exact", head: true })
    .ilike("title", "%TESTE%");

  console.log(`\n📊 STATUS DO SEED (lote: ${SEED_LOTE})`);
  console.log(`   Respostas de teste : ${respostas ?? 0}`);
  console.log(`   Empresas de teste  : ${empresas ?? 0}`);
  console.log(`   Surveys de teste   : ${surveys ?? 0}`);
  console.log(`   E-mails enviados   : 0\n`);

  return { respostas: respostas ?? 0, empresas: empresas ?? 0, surveys: surveys ?? 0 };
}

// ─── DRY RUN ─────────────────────────────────────────────────
async function dryRun() {
  console.log("\n🔍 DRY-RUN — Nada será gravado\n");
  console.log(`   Lote             : ${SEED_LOTE}`);
  console.log(`   Empresa de teste : ${SEED_EMPRESA_EMAIL}`);
  console.log(`   Bairros          : ${BAIRROS.join(", ")}`);
  console.log(`   Por bairro       : ${POR_BAIRRO} participantes (${Math.floor(POR_BAIRRO * 0.4)} c/ sintomas)`);
  console.log(`   Total individuais: ${POR_BAIRRO * BAIRROS.length}`);
  console.log(`   Colaboradoras    : 10 (4 c/ sintomas, 6 sem)`);
  console.log(`   E-mails enviados : 0`);
  console.log("\n✅ Dry-run concluído. Rode seed:apply para criar.\n");
}

// ─── APPLY ───────────────────────────────────────────────────
async function apply() {
  if (!SEED_EMPRESA_SENHA) {
    console.error("❌ BLOQUEADO: SEED_EMPRESA_SENHA não preenchida no .env.seed.local");
    process.exit(1);
  }

  console.log(`\n🌱 Iniciando SEED — lote: ${SEED_LOTE}\n`);
  let emailsEnviados = 0;

  // ── 1. Empresa de teste (idempotente) ──
  console.log("1/6 Verificando empresa de teste...");
  const { data: empresaExistente } = await supabase
    .from("companies")
    .select("id")
    .eq("seed_lote", SEED_LOTE)
    .single();

  let companyId: string;

  if (empresaExistente?.id) {
    companyId = empresaExistente.id;
    console.log(`    ↳ Já existe (${companyId}) — pulando`);
  } else {
    const { data: novaEmpresa, error: errEmpresa } = await supabase
      .from("companies")
      .insert({
        name: "ctor4.com",
        cnpj_or_identifier: "31.270.717/0001-87",
        cnpj: "31.270.717/0001-87",
        contact_email: SEED_EMPRESA_EMAIL,
        bairro: "Centro",
        cidade: "Teixeira de Freitas",
        uf: "BA",
        code_slug: "ctor4-teste-2026",
        is_teste: true,
        seed_lote: SEED_LOTE,
      })
      .select("id")
      .single();

    if (errEmpresa) { console.error("❌ Erro ao criar empresa:", errEmpresa.message); process.exit(1); }
    companyId = novaEmpresa!.id;
    console.log(`    ↳ Empresa criada (${companyId})`);
  }

  // ── 2. Usuário Auth da empresa (idempotente) ──
  console.log("2/6 Verificando usuário Auth da empresa...");
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const usuarioExistente = usersData?.users?.find(u => u.email === SEED_EMPRESA_EMAIL);

  let empresaUserId: string;
  if (usuarioExistente) {
    empresaUserId = usuarioExistente.id;
    console.log(`    ↳ Usuário já existe (${empresaUserId}) — pulando`);
  } else {
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: SEED_EMPRESA_EMAIL,
      password: SEED_EMPRESA_SENHA,
      email_confirm: true, // já confirmado — sem e-mail enviado
      user_metadata: { seed_lote: SEED_LOTE, is_teste: true },
    });
    if (authErr) { console.error("❌ Erro ao criar usuário empresa:", authErr.message); process.exit(1); }
    empresaUserId = authData.user.id;
    console.log(`    ↳ Usuário empresa criado (${empresaUserId}) — 0 e-mails enviados`);
  }

  // ── Perfil da empresa ──
  await supabase.from("profiles").upsert({
    id: empresaUserId,
    email: SEED_EMPRESA_EMAIL,
    full_name: "Administrador Teste ctor4.com",
    role: "instituicao",
    company_id: companyId,
    is_teste: true,
    seed_lote: SEED_LOTE,
  });

  // ── 3. Survey institucional (idempotente) ──
  console.log("3/6 Verificando survey institucional...");
  const { data: surveyExistente } = await supabase
    .from("surveys")
    .select("id, token")
    .eq("company_id", companyId)
    .ilike("title", "%TESTE%")
    .single();

  let surveyId: string;
  let surveyToken: string;

  if (surveyExistente?.id) {
    surveyId = surveyExistente.id;
    surveyToken = surveyExistente.token;
    console.log(`    ↳ Survey já existe (${surveyId}) — pulando`);
  } else {
    const token = randomBytes(16).toString("hex");
    const { data: novaSurvey, error: errSurvey } = await supabase
      .from("surveys")
      .insert({
        company_id: companyId,
        title: "Pesquisa Piloto ctor4.com (TESTE)",
        description: "Survey de teste para validação da FASE 2C do Endometriômetro.",
        token,
        status: "ativa",
      })
      .select("id, token")
      .single();

    if (errSurvey) { console.error("❌ Erro ao criar survey:", errSurvey.message); process.exit(1); }
    surveyId = novaSurvey!.id;
    surveyToken = novaSurvey!.token;
    console.log(`    ↳ Survey criado (${surveyId})`);
  }

  // ── 4. Survey geral (individual) — buscar ou criar ──
  console.log("4/6 Verificando survey geral (individual)...");
  const { data: surveyGeral } = await supabase
    .from("surveys")
    .select("id")
    .is("company_id", null)
    .eq("status", "ativa")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  let surveyGeralId: string;
  if (surveyGeral?.id) {
    surveyGeralId = surveyGeral.id;
    console.log(`    ↳ Survey geral encontrado (${surveyGeralId})`);
  } else {
    const { data: novaSurveyGeral, error: errGeral } = await supabase
      .from("surveys")
      .insert({ title: "Pesquisa Geral Endometriômetro", status: "ativa" })
      .select("id")
      .single();
    if (errGeral) { console.error("❌ Erro ao criar survey geral:", errGeral.message); process.exit(1); }
    surveyGeralId = novaSurveyGeral!.id;
    console.log(`    ↳ Survey geral criado (${surveyGeralId})`);
  }

  // ── 5. Colaboradoras da empresa (10) ──
  console.log("5/6 Criando respostas das colaboradoras da empresa...");
  const { count: jaTemColabs } = await supabase
    .from("survey_responses")
    .select("*", { count: "exact", head: true })
    .eq("survey_id", surveyId)
    .eq("seed_lote", SEED_LOTE);

  if ((jaTemColabs ?? 0) >= 10) {
    console.log(`    ↳ Já existem ${jaTemColabs} respostas — pulando`);
  } else {
    let sintomasContador = 0;
    for (let i = 1; i <= 10; i++) {
      const temSintomas = i <= 4; // primeiras 4 têm sintomas
      const payload = buildPayload(
        `Colaboradora Teste ${String(i).padStart(2, "0")}`,
        temSintomas,
        sintomasContador,
        i - 1,
        "Centro",
        "Teixeira de Freitas",
        "BA"
      );
      if (temSintomas) sintomasContador++;

      const dataIdx = (i - 1) % DATAS_FIXAS.length;

      const { error: errResp } = await supabase.from("survey_responses").insert({
        survey_id: surveyId,
        company_id: companyId,
        user_id: null, // participantes fictícios sem auth próprio
        responses: payload,
        status: "concluida",
        is_teste: true,
        seed_lote: SEED_LOTE,
        completed_at: `${DATAS_FIXAS[dataIdx]}T12:00:00Z`,
        created_at: `${DATAS_FIXAS[dataIdx]}T11:00:00Z`,
      });
      if (errResp) console.warn(`    ⚠ Colaboradora ${i}: ${errResp.message}`);
    }
    console.log(`    ↳ 10 colaboradoras criadas`);
  }

  // ── 6. Participantes individuais (4 bairros × POR_BAIRRO) ──
  console.log(`6/6 Criando respostas individuais (${BAIRROS.length} bairros × ${POR_BAIRRO})...`);
  const { count: jaTemIndividuais } = await supabase
    .from("survey_responses")
    .select("*", { count: "exact", head: true })
    .eq("survey_id", surveyGeralId)
    .eq("seed_lote", SEED_LOTE);

  const totalEsperado = BAIRROS.length * POR_BAIRRO;
  if ((jaTemIndividuais ?? 0) >= totalEsperado) {
    console.log(`    ↳ Já existem ${jaTemIndividuais} respostas individuais — pulando`);
  } else {
    let sintomasContador = 4; // continua do índice das colaboradoras
    let dataGlobal = 10; // índice nas datas fixas
    for (const bairro of BAIRROS) {
      for (let i = 1; i <= POR_BAIRRO; i++) {
        const temSintomas = i <= 2; // primeiras 2 de cada bairro têm sintomas
        const faixaIdx = (dataGlobal) % FAIXAS.length;
        const payload = buildPayload(
          `Participante ${bairro} ${i}`,
          temSintomas,
          sintomasContador,
          faixaIdx,
          bairro,
          "Teixeira de Freitas",
          "BA"
        );
        if (temSintomas) sintomasContador++;

        const { error: errResp } = await supabase.from("survey_responses").insert({
          survey_id: surveyGeralId,
          company_id: null,
          user_id: null,
          responses: payload,
          status: "concluida",
          is_teste: true,
          seed_lote: SEED_LOTE,
          completed_at: `${DATAS_FIXAS[dataGlobal % DATAS_FIXAS.length]}T14:00:00Z`,
          created_at: `${DATAS_FIXAS[dataGlobal % DATAS_FIXAS.length]}T13:00:00Z`,
        });
        if (errResp) console.warn(`    ⚠ ${bairro} #${i}: ${errResp.message}`);
        dataGlobal++;
      }
    }
    console.log(`    ↳ ${totalEsperado} participantes individuais criados`);
  }

  // ── Resumo Final ──
  const status = await getStatus();
  console.log("✅ SEED CONCLUÍDO");
  console.log(`   Empresa         : ctor4.com (${companyId})`);
  console.log(`   Link da pesquisa: ${SUPABASE_URL.replace(".supabase.co", "")}/pesquisa?empresa=${surveyToken}`);
  console.log(`   E-mails enviados: ${emailsEnviados}`);
  console.log("   ⚠  Nenhuma senha foi impressa neste log.\n");
}

// ─── REMOVE ──────────────────────────────────────────────────
async function remove() {
  console.log(`\n🗑  REMOVENDO todos os dados do lote: ${SEED_LOTE}\n`);

  // Contar antes
  const antes = await getStatus();

  // Dry-run
  console.log("   Dry-run de remoção:");
  console.log(`   - survey_responses: ${antes.respostas} registros a remover`);
  console.log(`   - companies:        ${antes.empresas} registros a remover`);

  if (antes.respostas === 0 && antes.empresas === 0) {
    console.log("   ℹ Nada para remover.\n");
    return;
  }

  // Remover respostas
  const { error: errResp } = await supabase
    .from("survey_responses")
    .delete()
    .eq("seed_lote", SEED_LOTE);
  if (errResp) console.error("❌ Erro ao remover respostas:", errResp.message);

  // Remover surveys de teste
  const { data: companiesDoLote } = await supabase
    .from("companies")
    .select("id")
    .eq("seed_lote", SEED_LOTE);
  
  if (companiesDoLote?.length) {
    const ids = companiesDoLote.map(c => c.id);
    await supabase.from("surveys").delete().in("company_id", ids);
  }

  // Remover perfis de teste
  const { data: perfisDoLote } = await supabase
    .from("profiles")
    .select("id")
    .eq("seed_lote", SEED_LOTE);

  if (perfisDoLote?.length) {
    for (const p of perfisDoLote) {
      await supabase.auth.admin.deleteUser(p.id);
    }
  }

  // Remover empresas
  await supabase.from("companies").delete().eq("seed_lote", SEED_LOTE);

  // Contar depois
  const depois = await getStatus();
  console.log(`\n   Antes : ${antes.respostas} respostas, ${antes.empresas} empresas`);
  console.log(`   Depois: ${depois.respostas} respostas, ${depois.empresas} empresas`);
  console.log("✅ Remoção concluída. Dados reais não foram tocados.\n");
}

// ─── Main ─────────────────────────────────────────────────────
(async () => {
  console.log(`\n🌸 Endometriômetro — Seed Script`);
  console.log(`   Ambiente: ${SUPABASE_URL}`);
  console.log(`   Modo    : ${MODO}\n`);

  switch (MODO) {
    case "dry-run": await dryRun(); break;
    case "apply":   await apply(); break;
    case "remove":  await remove(); break;
    case "status":  await getStatus(); break;
    default:
      console.error("❌ Modo inválido. Use: dry-run | apply | remove | status");
      process.exit(1);
  }
})();
