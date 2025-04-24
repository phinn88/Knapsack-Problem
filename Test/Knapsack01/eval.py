import time
import os

# Greedy algorithm for 0-1 Knapsack Problem
def knapsack_greedy(values, weights, capacity):
    items = sorted(zip(values, weights), key=lambda x: x[0] / x[1], reverse=True)
    total_value = 0
    for value, weight in items:
        if capacity >= weight:
            capacity -= weight
            total_value += value
    return total_value

# Dynamic Programming algorithm for 0-1 Knapsack Problem
def knapsack_dp(values, weights, capacity):
    n = len(values)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
            else:
                dp[i][w] = dp[i - 1][w]
    return dp[n][capacity]

# Backtracking algorithm for 0-1 Knapsack Problem
def knapsack_backtracking(values, weights, capacity):
    def backtrack(index, remaining_capacity):
        if index == len(values) or remaining_capacity == 0:
            return 0
        if weights[index] > remaining_capacity:
            return backtrack(index + 1, remaining_capacity)
        return max(
            backtrack(index + 1, remaining_capacity),
            values[index] + backtrack(index + 1, remaining_capacity - weights[index])
        )
    return backtrack(0, capacity)

# Evaluation function
def evaluate_knapsack_algorithms(values, weights, capacity, max_value):
    algorithms = {
        "Greedy": knapsack_greedy,
        "Dynamic Programming": knapsack_dp,
        "Backtracking": knapsack_backtracking
    }
    results = {}
    for name, algorithm in algorithms.items():
        start_time = time.time()
        result = algorithm(values, weights, capacity)
        elapsed_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        results[name] = {
            "Result": result,
            "Time (ms)": elapsed_time,
            "Correct": result == max_value
        }
    return results

# Function to read test instances from files
def read_instance(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()
        n, capacity = map(int, lines[0].split())  # Đọc số lượng item và sức chứa balo
        values = []
        weights = []
        for line in lines[1:]:
            try:
                value, weight = map(int, line.split())  # Cố gắng đọc giá trị và trọng lượng
                values.append(value)
                weights.append(weight)
            except ValueError:
                # Nếu không đọc được (dòng cuối cùng không hợp lệ), bỏ qua
                continue
    return values, weights, capacity

# Function to read the optimum value from a file
def read_optimum(file_path):
    with open(file_path, 'r') as file:
        return int(file.readline().strip())

# Main function to evaluate all test instances
if __name__ == "__main__":
    # Paths to the folders containing test instances and optimum values
    instances_folder = r"D:\Knapsack-Problem\Test\Data\instances_01_KP\large_scale"
    optimum_folder = r"D:\Knapsack-Problem\Test\Data\instances_01_KP\large_scale-optimum"

    # Check if folders exist
    if not os.path.exists(instances_folder):
        print(f"Error: Folder {instances_folder} does not exist.")
    if not os.path.exists(optimum_folder):
        print(f"Error: Folder {optimum_folder} does not exist.")

    print("Starting evaluation of test instances...")

    # Iterate through all test files
    for instance_file in os.listdir(instances_folder):
        if instance_file.endswith(".txt"):  # Assuming test files have .txt extension
            try:
                print(f"Checking file: {instance_file}")
                instance_path = os.path.join(instances_folder, instance_file)
                optimum_path = os.path.join(optimum_folder, instance_file)

                # Read instance data and optimum value
                values, weights, capacity = read_instance(instance_path)
                max_value = read_optimum(optimum_path)

                print(f"Values: {values[:5]}... (total {len(values)} items)")
                print(f"Capacity: {capacity}, Optimum Value: {max_value}")

                # Evaluate algorithms
                results = evaluate_knapsack_algorithms(values, weights, capacity, max_value)

                # Print results for the current test
                print(f"Instance: {instance_file}")
                print(f"Number of Items: {len(values)}, Capacity: {capacity}, Max Value: {max_value}")
                for algo, metrics in results.items():
                    print(f"{algo}: Result = {metrics['Result']}, Time = {metrics['Time (ms)']:.2f} ms, Correct = {metrics['Correct']}")
                print("-" * 50)
            except Exception as e:
                print(f"Error processing file {instance_file}: {e}")
    print("Done")