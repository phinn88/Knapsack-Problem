function fitness(individual, values, weights, maxWeight) {
  let totalWeight = individual.reduce((sum, i) => sum + weights[i], 0);
  let totalValue = individual.reduce((sum, i) => sum + values[i], 0);

  if (totalWeight > maxWeight) {
    let penalty = (totalWeight - maxWeight) * 5;
    return totalValue - penalty;
  }
  return totalValue;
}

function greedyIndividual(values, weights, maxWeight) {
  let ratio = values.map((v, i) => [v / weights[i], i]);
  ratio.sort((a, b) => b[0] - a[0]);

  let individual = [];
  let totalWeight = 0;

  for (let [_, i] of ratio) {
    if (totalWeight + weights[i] <= maxWeight) {
      individual.push(i);
      totalWeight += weights[i];
    }
  }
  return individual;
}

function randomIndividual(values, weights, maxWeight) {
  let individual = [];
  let totalWeight = 0;
  let indices = Array.from({ length: values.length }, (_, i) => i);
  indices.sort(() => Math.random() - 0.5);

  for (let i of indices) {
    if (totalWeight + weights[i] <= maxWeight) {
      individual.push(i);
      totalWeight += weights[i];
    }
  }
  return individual;
}

function initializePopulation(values, weights, maxWeight, populationSize) {
  let population = [];
  for (let i = 0; i < populationSize / 2; i++) {
    population.push(greedyIndividual(values, weights, maxWeight));
    population.push(randomIndividual(values, weights, maxWeight));
  }
  return population;
}

function crossover(parent1, parent2, weights, maxWeight) {
  let child = Array.from(new Set([...parent1, ...parent2]));
  let totalWeight = child.reduce((sum, i) => sum + weights[i], 0);

  while (totalWeight > maxWeight) {
    let item = child[Math.floor(Math.random() * child.length)];
    child.splice(child.indexOf(item), 1);
    totalWeight -= weights[item];
  }
  return child;
}

function mutate(individual, weights, maxWeight, mutationRate) {
  if (Math.random() < mutationRate) {
    let index = Math.floor(Math.random() * weights.length);
    if (!individual.includes(index)) {
      if (
        individual.reduce((sum, i) => sum + weights[i], 0) + weights[index] <=
        maxWeight
      ) {
        individual.push(index);
      }
    } else {
      individual.splice(individual.indexOf(index), 1);
    }
  }
}

function select(population, values, weights, maxWeight, populationSize) {
  population.sort(
    (a, b) =>
      fitness(b, values, weights, maxWeight) -
      fitness(a, values, weights, maxWeight)
  );
  let elites = population.slice(0, populationSize / 10);
  let remaining = population.slice(populationSize / 10);
  remaining.sort(() => Math.random() - 0.5);
  return elites.concat(remaining.slice(0, populationSize - elites.length));
}

function runGeneticAlgorithm() {
  let values = document.getElementById("values").value.split(",").map(Number);
  let weights = document.getElementById("weights").value.split(",").map(Number);
  let maxWeight = parseInt(document.getElementById("maxWeight").value);
  let populationSize = parseInt(
    document.getElementById("populationSize").value
  );
  let mutationRate = parseFloat(document.getElementById("mutationRate").value);
  let generations = parseInt(document.getElementById("generations").value);

  let population = initializePopulation(
    values,
    weights,
    maxWeight,
    populationSize
  );
  let bestSolutionEver = null;
  let bestFitnessEver = -Infinity;
  let generationFound = -1;

  for (let generation = 0; generation < generations; generation++) {
    let newPopulation = [];

    while (newPopulation.length < populationSize) {
      let [parent1, parent2] = [
        population[Math.floor(Math.random() * population.length)],
        population[Math.floor(Math.random() * population.length)],
      ];
      let child = crossover(parent1, parent2, weights, maxWeight);
      mutate(child, weights, maxWeight, mutationRate);
      newPopulation.push(child);
    }

    population = select(
      newPopulation,
      values,
      weights,
      maxWeight,
      populationSize
    );

    let bestIndividual = population[0];
    let bestFitness = fitness(bestIndividual, values, weights, maxWeight);

    if (bestFitness > bestFitnessEver) {
      bestFitnessEver = bestFitness;
      bestSolutionEver = bestIndividual;
      generationFound = generation;
    }
  }

  let result = `✅ KẾT QUẢ TỐT NHẤT:\n`;
  result += `📦 Các vật được chọn: ${bestSolutionEver
    .map((i) => i + 1)
    .join(", ")}\n`;
  result += `💰 Tổng giá trị: ${bestFitnessEver}\n`;
  result += `⚖️ Tổng khối lượng: ${bestSolutionEver.reduce(
    (sum, i) => sum + weights[i],
    0
  )}\n`;
  result += `🌟 Đạt được tại thế hệ: ${generationFound + 1}`;
  document.getElementById("result").value = result;
}
