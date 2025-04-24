import { parseInput, parseMatrixInput } from "../utils/helpers.js";

export function solveMultidimensionalKnapsack(inputs) {
  const weights = parseMatrixInput(inputs.weights);
  const values = parseInput(inputs.values);
  const capacities = parseInput(inputs.capacities);
  const n = weights.length;
  const m = capacities.length;

  // Input validation
  if (
    weights.some((row) => row.length !== m) ||
    values.length !== n ||
    capacities.length < 1
  ) {
    document.getElementById("output").innerHTML = "<pre>Invalid input</pre>";
    return;
  }

  // DP table (simplified for 2D)
  const dp = Array(n + 1)
    .fill()
    .map(() =>
      Array(capacities[0] + 1)
        .fill()
        .map(() => Array(capacities[1] + 1 || 1).fill(0))
    );

  // Fill DP table
  for (let i = 1; i <= n; i++) {
    for (let w1 = 0; w1 <= capacities[0]; w1++) {
      for (let w2 = 0; w2 <= (capacities[1] || 1); w2++) {
        if (weights[i - 1][0] <= w1 && (m === 1 || weights[i - 1][1] <= w2)) {
          dp[i][w1][w2] = Math.max(
            dp[i - 1][w1][w2],
            dp[i - 1][w1 - weights[i - 1][0]][w2 - (weights[i - 1][1] || 0)] +
              values[i - 1]
          );
        } else {
          dp[i][w1][w2] = dp[i - 1][w1][w2];
        }
      }
    }
  }

  // Backtrack
  const selected = [];
  let w1 = capacities[0];
  let w2 = capacities[1] || 0;
  for (let i = n; i > 0; i--) {
    if (dp[i][w1][w2] !== dp[i - 1][w1][w2]) {
      selected.push(i - 1);
      w1 -= weights[i - 1][0];
      w2 -= weights[i - 1][1] || 0;
    }
  }

  document.getElementById("output").innerHTML = `
        <pre>
Max Value: ${dp[n][capacities[0]][capacities[1] || 0]}
Selected Items (indices): ${selected.reverse().join(", ")}
        </pre>
    `;
}
