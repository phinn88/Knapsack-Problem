import {
  solveZeroOneKnapsack,
  solveZeroOneKnapsackGenetic,
} from "./problems/zeroOneKnapsack.js";
import { solveFractionalKnapsack } from "./problems/fractionalKnapsack.js";
import { solveMultidimensionalKnapsack } from "./problems/multidimensionalKnapsack.js";
import { solveMultipleKnapsack } from "./problems/multipleKnapsack.js";
import { solveQuadraticKnapsack } from "./problems/quadraticKnapsack.js";
import { parseInput, parseMatrixInput } from "./utils/helpers.js";

const problemForms = {
  zeroOne: `
        <label>Weights (comma-separated):</label>
        <input type="text" id="weights" placeholder="e.g., 1,2,3">
        <label>Values (comma-separated):</label>
        <input type="text" id="values" placeholder="e.g., 60,100,120">
        <label>Capacity:</label>
        <input type="number" id="capacity" placeholder="e.g., 5">
    `,
  fractional: `
        <label>Weights (comma-separated):</label>
        <input type="text" id="weights" placeholder="e.g., 10,20,30">
        <label>Values (comma-separated):</label>
        <input type="text" id="values" placeholder="e.g., 60,100,120">
        <label>Capacity:</label>
        <input type="number" id="capacity" placeholder="e.g., 50">
    `,
  multidimensional: `
        <label>Weights (rows as items, columns as dimensions, semicolon-separated):</label>
        <textarea id="weights" placeholder="e.g., 1,2;3,4;5,6"></textarea>
        <label>Values (comma-separated):</label>
        <input type="text" id="values" placeholder="e.g., 60,100,120">
        <label>Capacities (comma-separated):</label>
        <input type="text" id="capacities" placeholder="e.g., 5,7">
    `,
  multiple: `
        <label>Weights (comma-separated):</label>
        <input type="text" id="weights" placeholder="e.g., 2,3,4">
        <label>Values (comma-separated):</label>
        <input type="text" id="values" placeholder="e.g., 60,100,120">
        <label>Knapsack Capacities (comma-separated):</label>
        <input type="text" id="capacities" placeholder="e.g., 5,7,3">
    `,
  quadratic: `
        <label>Weights (comma-separated):</label>
        <input type="text" id="weights" placeholder="e.g., 1,2,3">
        <label>Values (comma-separated):</label>
        <input type="text" id="values" placeholder="e.g., 60,100,120">
        <label>Pairwise Profits (rows, semicolon-separated):</label>
        <textarea id="profits" placeholder="e.g., 0,10,20;10,0,30;20,30,0"></textarea>
        <label>Capacity:</label>
        <input type="number" id="capacity" placeholder="e.g., 5">
    `,
};

const solvers = {
  zeroOne: { dp: solveZeroOneKnapsack, genetic: solveZeroOneKnapsackGenetic },
  fractional: { greedy: solveFractionalKnapsack },
  multidimensional: { dp: solveMultidimensionalKnapsack },
  multiple: { dp: solveMultipleKnapsack },
  quadratic: { genetic: solveQuadraticKnapsack },
};

export function updateForm() {
  const problemType = document.getElementById("problemType").value;
  const method = document.getElementById("method").value;

  // Update the input form
  const inputForm = document.getElementById("inputForm");
  if (inputForm) {
    inputForm.innerHTML = problemForms[problemType] || "";
  } else {
    console.error("inputForm element not found");
    return;
  }

  // Update available methods
  const methodSelect = document.getElementById("method");
  if (methodSelect) {
    methodSelect.innerHTML = "";
    const availableMethods = Object.keys(solvers[problemType]);
    availableMethods.forEach((m) => {
      const option = document.createElement("option");
      option.value = m;
      option.text = m.charAt(0).toUpperCase() + m.slice(1);
      methodSelect.appendChild(option);
    });
    methodSelect.value = availableMethods.includes(method)
      ? method
      : availableMethods[0];
  } else {
    console.error("method element not found");
  }
}

export function solveProblem() {
  const problemType = document.getElementById("problemType").value;
  const method = document.getElementById("method").value;
  const solver = solvers[problemType][method];

  if (!solver) {
    document.getElementById("output").innerHTML =
      "<pre>Method not available for this problem</pre>";
    return;
  }

  const inputs = {
    weights: document.getElementById("weights")?.value,
    values: document.getElementById("values")?.value,
    capacity: document.getElementById("capacity")?.value,
    capacities: document.getElementById("capacities")?.value,
    profits: document.getElementById("profits")?.value,
  };

  solver(inputs);
}
