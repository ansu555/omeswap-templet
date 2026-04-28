export type FormAnswers = {
  defiExperience: number;
  investmentHorizon: number;
  riskTolerance: number;
  useCases: string[];
  preferredNetworks: string[];
};

export function calculateRiskScore(answers: FormAnswers): {
  score: number;
  label: string;
} {
  const raw =
    answers.defiExperience +
    answers.investmentHorizon +
    answers.riskTolerance +
    answers.useCases.length +
    answers.preferredNetworks.length;

  const score = Math.round((raw / 29) * 100);
  const label =
    score <= 33 ? "Conservative" : score <= 66 ? "Moderate" : "Aggressive";

  return { score, label };
}
