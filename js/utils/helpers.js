export function parseInput(input) {
  return input.split(",").map(Number);
}

export function parseMatrixInput(input) {
  return input.split(";").map((row) => row.split(",").map(Number));
}
