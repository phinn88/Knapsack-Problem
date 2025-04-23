document.getElementById("knapsackForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const capacity = parseInt(document.getElementById("capacity").value);
    const itemsText = document.getElementById("items").value.trim();
    const sortMethod = document.getElementById("sortMethod").value;

    const items = itemsText.split("\n").map(line => {
        const [name, valueStr, weightStr] = line.split(",");
        return {
            name: name.trim(),
            value: parseFloat(valueStr),
            weight: parseFloat(weightStr)
        };
    });

    const result = knapsackGreedy(items, capacity, sortMethod);

    const output = document.getElementById("output");
    output.textContent =
        "Tổng giá trị: " + result.totalValue + "\n" +
        "Đồ vật được chọn:\n" +
        result.selectedItems.map(item => `- ${item.name} (giá trị: ${item.value}, trọng lượng: ${item.weight})`).join("\n");
});

function knapsackGreedy(items, capacity, sortMethod) {
    // Tính tỷ lệ giá trị / trọng lượng nếu cần
    items.forEach(item => {
        item.ratio = item.value / item.weight;
    });

    if (sortMethod === "value") {
        items.sort((a, b) => b.value - a.value);
    } else if (sortMethod === "weight") {
        items.sort((a, b) => b.weight - a.weight);
    } else {
        items.sort((a, b) => b.ratio - a.ratio);
    }

    let totalValue = 0;
    let totalWeight = 0;
    let selectedItems = [];

    for (let item of items) {
        if (totalWeight + item.weight <= capacity) {
            selectedItems.push(item);
            totalWeight += item.weight;
            totalValue += item.value;
        }
    }

    return {
        totalValue,
        selectedItems
    };
}