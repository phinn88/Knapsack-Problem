import { parseInput } from "../utils/helpers.js";

export function solveZeroOneKnapsack(inputs) {
  const weights = parseInput(inputs.weights);
  const values = parseInput(inputs.values);
  const capacity = parseInt(inputs.capacity);
  const n = weights.length;

  // Input validation
  if (weights.length !== values.length || isNaN(capacity)) {
    document.getElementById("output").innerHTML = "<pre>Invalid input</pre>";
    return;
  }

  // DP table
  const dp = Array(n + 1)
    .fill()
    .map(() => Array(capacity + 1).fill(0));

  // Fill DP table
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Backtrack
  const selected = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(i - 1);
      w -= weights[i - 1];
    }
  }

  document.getElementById("output").innerHTML = `
        <pre>
Max Value: ${dp[n][capacity]}
Selected Items (indices): ${selected.reverse().join(", ")}
        </pre>
    `;
}

export function solveZeroOneKnapsackGenetic(inputs) {
  const weights = parseInput(inputs.weights);
  const values = parseInput(inputs.values);
  const capacity = parseInt(inputs.capacity);
  const n = weights.length;

  // Input validation
  if (weights.length !== values.length || isNaN(capacity)) {
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
    for (let i = 0; i < n; i++) {
      if (solution[i]) {
        totalWeight += weights[i];
        totalValue += values[i];
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
