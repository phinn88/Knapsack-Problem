import { parseInput, parseMatrixInput } from "../utils/helpers.js";

export function solveQuadraticKnapsack(inputs) {
  const weights = parseInput(inputs.weights);
  const values = parseInput(inputs.values);
  const profits = parseMatrixInput(inputs.profits);
  const capacity = parseInt(inputs.capacity);
  const n = weights.length;

  // Input validation
  if (
    weights.length !== values.length ||
    profits.length !== n ||
    profits.some((row) => row.length !== n) ||
    isNaN(capacity)
  ) {
    document.getElementById("output").innerHTML = "<pre>Invalid input</pre>";
    return;
  }

  // Genetic Algorithm Parameters
  const populationSize = 50;
  const generations = 100;
  const mutationRate = 0.01;

  // Initialize population
  let population = Array(populationSize)
    .fill()
    .map(() =>
      Array(n)
        .fill()
        .map(() => (Math.random() > 0.5 ? 1 : 0))
    );

  // Fitness function
  function fitness(solution) {
    let totalWeight = 0;
    let totalValue = 0;

    // Linear values
    for (let i = 0; i < n; i++) {
      if (solution[i]) {
        totalWeight += weights[i];
        totalValue += values[i];
      }
    }

    // Quadratic profits
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (solution[i] && solution[j]) {
          totalValue += profits[i][j];
        }
      }
    }

    return totalWeight <= capacity ? totalValue : 0;
  }

  // Selection
  function select(population) {
    const tournamentSize = 5;
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
      tournament.push(population[Math.floor(Math.random() * populationSize)]);
    }
    return tournament.sort((a, b) => fitness(b) - fitness(a))[0];
  }

  // Crossover
  function crossover(parent1, parent2) {
    const point = Math.floor(Math.random() * n);
    return [
      [...parent1.slice(0, point), ...parent2.slice(point)],
      [...parent2.slice(0, point), ...parent1.slice(point)],
    ];
  }

  // Mutation
  function mutate(solution) {
    return solution.map((bit) =>
      Math.random() < mutationRate ? 1 - bit : bit
    );
  }

  // Genetic Algorithm
  for (let gen = 0; gen < generations; gen++) {
    const newPopulation = [];
    const best = population.sort((a, b) => fitness(b) - fitness(a))[0];
    newPopulation.push([...best]);

    while (newPopulation.length < populationSize) {
      const parent1 = select(population);
      const parent2 = select(population);
      const [child1, child2] = crossover(parent1, parent2);
      newPopulation.push(mutate(child1));
      if (newPopulation.length < populationSize) {
        newPopulation.push(mutate(child2));
      }
    }

    population = newPopulation;
  }

  // Find best solution
  const bestSolution = population.sort((a, b) => fitness(b) - fitness(a))[0];
  const selected = bestSolution
    .map((bit, i) => (bit ? i : -1))
    .filter((i) => i !== -1);

  document.getElementById("output").innerHTML = `
        <pre>
Max Value: ${fitness(bestSolution)}
Selected Items (indices): ${selected.join(", ")}
        </pre>
    `;
}
