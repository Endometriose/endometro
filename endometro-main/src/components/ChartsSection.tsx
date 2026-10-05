import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

// Paleta rosa do mais claro ao mais escuro
const COLORS = ["#e57d90", "#f1889b", "#f99aaa", "#fdb4bf", "#ffcdd4"];
const COLORS_PIE1 = ["#e57d90", "#ffcdd4"];
const COLORS_PIE2 = ["#f1889b", "#fdb4bf"];

const SYMPTOM_COLORS = ["#e57d90", "#f1889b", "#f99aaa", "#fdb4bf", "#ffcdd4", "#e57d90"];

const prevalenceData = [
  { name: "Com endometriose", value: 10 },
  { name: "Sem endometriose", value: 90 },
];

const workingData = [
  { name: "Trabalham com endo", value: 65 },
  { name: "Afastadas", value: 35 },
];

const symptomsData = [
  { name: "Dor pélvica", pct: 80 },
  { name: "Cólica intensa", pct: 75 },
  { name: "Fadiga crônica", pct: 60 },
  { name: "Dor nas relações", pct: 55 },
  { name: "Sangramento irregular", pct: 45 },
  { name: "Dificuldade para engravidar", pct: 40 },
];

const productivityData = [
  { name: "Ausência", horas: 12 },
  { name: "Presença improdutiva", horas: 22 },
];

const ChartsSection = () => {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
          Dados da Pesquisa
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Dados coletados através do nosso questionário — ajude a atualizar participando!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chart 1: Prevalence */}
          <div className="bg-card rounded-xl p-6 shadow-md border border-border">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 text-center">
              Mulheres com Endometriose
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={prevalenceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {prevalenceData.map((_, i) => (
                    <Cell key={i} fill={COLORS_PIE1[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Working women */}
          <div className="bg-card rounded-xl p-6 shadow-md border border-border">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 text-center">
              Mulheres que Trabalham com Endometriose
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={workingData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {workingData.map((_, i) => (
                    <Cell key={i} fill={COLORS_PIE2[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Symptoms horizontal bars */}
          <div className="bg-card rounded-xl p-6 shadow-md border border-border">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 text-center">
              Principais Sintomas (%)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={symptomsData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(340,25%,88%)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(340,30%,15%)", fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fill: "hsl(340,30%,15%)", fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                  {symptomsData.map((_, i) => (
                    <Cell key={i} fill={SYMPTOM_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 4: Absenteeism vs Presenteeism */}
          <div className="bg-card rounded-xl p-6 shadow-md border border-border">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 text-center">
              Horas Perdidas: Ausência vs Presença Improdutiva
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(340,25%,88%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(340,30%,15%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(340,30%,15%)", fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="horas" name="Horas" radius={[6, 6, 0, 0]}>
                  {productivityData.map((_, i) => (
                    <Cell key={i} fill={COLORS_PIE1[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChartsSection;
