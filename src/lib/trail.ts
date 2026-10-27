import { TrailKey } from "./types";
export const trails: Record<TrailKey, { title: string; desc: string; steps: string[] }> = {
  prevencao: { title: "Trilha Prevenção", desc: "Para fortalecer suas escolhas e saber dizer não.", steps: ["Entender o que tem dentro de um vape", "Reconhecer pressão social e publicidade disfarçada", "Praticar frases de recusa", "Identificar sua rede de apoio"] },
  apoio: { title: "Trilha Apoio para Parar", desc: "Passos pequenos e possíveis, no seu ritmo.", steps: ["Perceber quando e por que a vontade aparece", "Escolher uma pessoa de confiança para contar", "Conhecer o apoio gratuito da UBS e do Disque Saúde 136", "Montar um plano com data e estratégias para a vontade"] },
};
export const nextSteps = {
  confianca: { title: "Converse com alguém de confiança", desc: "Pode ser família, professor(a), orientador(a) ou um amigo mais velho." },
  ubs: { title: "Procure a UBS mais próxima", desc: "Atendimento gratuito pelo SUS, sem julgamento. Leve um responsável se puder." },
  disque136: { title: "Ligue no Disque Saúde 136", desc: "Gratuito, de segunda a sábado. Tira dúvidas sobre saúde de forma sigilosa." },
};
