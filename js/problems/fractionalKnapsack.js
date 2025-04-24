import { parseInput } from "../utils/helpers.js";

export function solveFractionalKnapsack(inputs) {
  const weights = parseInput(inputs.weights);
  const values = parseInput(inputs.values);
  const capacity = parseInt(inputs.capacity);
  const n = weights.length;

  // Input validation
  if (weights.length !== values.length || isNaN(capacity)) {
    document.getElementById("output").innerHTML = "<pre>Invalid input</pre>";
    return;
  }

  // Create items array
  const items = weights.map((w, i) => ({
    weight: w,
    value: values[i],
    ratio: values[i] / w,
  }));

  // Sort by ratio
  items.sort((a, b) => b.ratio - a.ratio);

  let totalValue = 0;
  let remaining = capacity;
  const fractions = Array(n).fill(0);

  // Greedy selection
  for (let i = 0; i < n; i++) {
    if (remaining >= items[i].weight) {
      fractions[i] = 1;
      totalValue += items[i].value;
      remaining -= items[i].weight;
    } else {
      fractions[i] = remaining / items[i].weight;
      totalValue += items[i].value * fractions[i];
      remaining = 0;
      break;
    }
  }

  document.getElementById("output").innerHTML = `
        <pre>
Max Value: ${totalValue.toFixed(2)}
Fractions (by original order): ${fractions
    .map((f, i) => `Item ${i}: ${f.toFixed(2)}`)
    .join("\n")}
        </pre>
    `;
}
