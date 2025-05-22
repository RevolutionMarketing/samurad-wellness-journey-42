
export const calculateBMI = (weightKg: number, heightInMeters: number): number => {
  if (heightInMeters <= 0) return 0;
  return weightKg / (heightInMeters * heightInMeters);
};

export const getWeightCategory = (bmi: number): string => {
  if (bmi < 18.5) return `Sottopeso (BMI < 18.5)`;
  if (bmi >= 18.5 && bmi <= 24.9) return `Normopeso (BMI 18.5 - 24.9)`;
  if (bmi >= 25 && bmi <= 29.9) return `Sovrappeso (BMI 25 - 29.9)`;
  if (bmi >= 30 && bmi <= 34.9) return `Obesità Classe I (BMI 30 - 34.9)`;
  if (bmi >= 35 && bmi <= 39.9) return `Obesità Classe II (BMI 35 - 39.9)`;
  if (bmi >= 40) return `Obesità Classe III (BMI >= 40)`;
  return "N/D";
};

export const calculateBMR = (weightKg: number, heightCm: number, ageYears: number, gender: string): number => {
  if (gender === 'male') {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
  } else if (gender === 'female') {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
  }
  return 0;
};
