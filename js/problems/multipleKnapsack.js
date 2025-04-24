import { parseInput } from "../utils/helpers.js";

export function solveMultipleKnapsack(inputs) {
  const weights = parseInput(inputs.weights);
  const values = parseInput(inputs.values);
  const capacities = parseInput(inputs.capacities);
  const n = weights.length;
  const m = capacities.length;

  // Input validation
  if (weights.length !== values.length || capacities.length < 1) {
    document.getElementById("output").innerHTML = "<pre>Invalid input</pre>";
    return;
  }

  // Initialize assignments
  const assignments = Array(m)
    .fill()
    .map(() => []);
  let remainingItems = weights.map((w, i) => ({
    weight: w,
    value: values[i],
    index: i,
  }));
  let totalValue = 0;

  // Greedy assignment
  for (let k = 0; k < m; k++) {
    let remainingCapacity = capacities[k];
    let knapsackItems = [];

    remainingItems.sort((a, b) => b.value / b.weight - a.value / a.weight);

    for (let item of remainingItems) {
      if (item.weight <= remainingCapacity) {
        knapsackItems.push(item.index);
        totalValue += item.value;
        remainingCapacity -= item.weight;
      }
    }

    assignments[k] = knapsackItems;
    remainingItems = remainingItems.filter(
      (item) => !knapsackItems.includes(item.index)
    );
  }

  document.getElementById("output").innerHTML = `
        <pre>
Total Value: ${totalValue}
Assignments:
${assignments
  .map(
    (knapsack, i) =>
      `Knapsack ${i} (Capacity ${capacities[i]}): Items ${knapsack.join(", ")}`
  )
  .join("\n")}
        </pre>
    `;
}
