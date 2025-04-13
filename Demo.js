var numWarehouses;
var numItems;
var warehouses = []; // Lưu danh sách kho: [{capacity, remainingCapacity, allocatedItems, index}, ...]
var items = []; // Lưu danh sách hàng hóa: [{id, profit, weight}, ...]

// Tạo bảng nhập liệu cho kho và hàng hóa
function createInputTables() {
    numWarehouses = parseInt(document.getElementById('numWarehouses').value);
    numItems = parseInt(document.getElementById('numItems').value);

    if (isNaN(numWarehouses) || numWarehouses <= 0) {
        alert('Please enter a valid number of warehouses (greater than 0).');
        return;
    }
    if (isNaN(numItems) || numItems <= 0) {
        alert('Please enter a valid number of items (greater than 0).');
        return;
    }

    // Tạo bảng cho kho
    var warehouseHeader = '<table class="table table-bordered" id="warehouseInputTable"><tr><th scope="col">Warehouse</th><th scope="col">Capacity (kg)</th></tr>';
    var warehouseBody = '';

    for (var i = 0; i < numWarehouses; i++) {
        warehouseBody += '<tr>';
        warehouseBody += '<td>Warehouse ' + i + '</td>';
        warehouseBody += '<td><input type="number" class="form-control capacity-input" placeholder="Capacity" min="0" required /></td>';
        warehouseBody += '</tr>';
    }
    var warehouseFooter = '</table>';
    document.getElementById('warehouseTable').innerHTML = warehouseHeader + warehouseBody + warehouseFooter;

    // Tạo bảng cho hàng hóa
    var itemHeader = '<table class="table table-bordered" id="itemInputTable"><tr><th scope="col">Item</th><th scope="col">Profit</th><th scope="col">Weight (kg)</th></tr>';
    var itemBody = '';

    for (var i = 0; i < numItems; i++) {
        itemBody += '<tr>';
        itemBody += '<td>Item ' + i + '</td>';
        itemBody += '<td><input type="number" class="form-control profit-input" placeholder="Profit" min="0" required /></td>';
        itemBody += '<td><input type="number" class="form-control weight-input" placeholder="Weight" min="0" required /></td>';
        itemBody += '</tr>';
    }
    var itemFooter = '</table>';
    document.getElementById('itemTable').innerHTML = itemHeader + itemBody + itemFooter;

    // Xóa dữ liệu cũ và ẩn các phần nhập liệu
    warehouses = [];
    items = [];
    document.getElementById('resultSection').style.visibility = 'hidden';
    document.getElementById('multipleWarehousesResult').innerHTML = '';
    document.getElementById('kp01ResultantProfit').innerHTML = '';
    document.getElementById('currentItemsTable').innerHTML = '';
    document.getElementById('addItemSection').style.display = 'none';
    document.getElementById('removeItemSection').style.display = 'none';
    document.getElementById('addWarehouseSection').style.display = 'none';
    document.getElementById('removeWarehouseSection').style.display = 'none';
}

// Thu thập dữ liệu và tính toán ban đầu
function generateResult() {
    if (!document.getElementById('warehouseInputTable') || !document.getElementById('itemInputTable')) {
        alert('Please generate input tables first.');
        return;
    }

    // Thu thập dung tích kho
    var warehouseTable = document.getElementById('warehouseInputTable');
    warehouses = [];
    for (var i = 1; i <= numWarehouses; i++) {
        var capacityInput = warehouseTable.rows[i].cells[1].children[0];
        var capacityValue = parseInt(capacityInput.value);
        if (isNaN(capacityValue) || capacityValue <= 0) {
            alert(`Please enter a valid capacity for Warehouse ${i-1}.`);
            return;
        }
        warehouses.push({ capacity: capacityValue, remainingCapacity: capacityValue, allocatedItems: [], index: i-1 });
    }

    // Thu thập dữ liệu hàng hóa
    var itemTable = document.getElementById('itemInputTable');
    items = [];
    for (var i = 1; i <= numItems; i++) {
        var profitInput = itemTable.rows[i].cells[1].children[0];
        var weightInput = itemTable.rows[i].cells[2].children[0];
        var profitValue = parseInt(profitInput.value);
        var weightValue = parseInt(weightInput.value);
        if (isNaN(profitValue) || isNaN(weightValue) || profitValue < 0 || weightValue < 0) {
            alert(`Please enter valid non-negative profit and weight for Item ${i-1}.`);
            return;
        }
        items.push({ id: i-1, profit: profitValue, weight: weightValue });
    }

    // Tính toán phân bổ ban đầu
    document.getElementById('resultSection').style.visibility = 'visible';
    manageMultipleWarehouses(true); // true: chạy Knapsack
    updateCurrentItemsTable();

    // Hiển thị các phần nhập liệu thêm/xóa item và kho
    document.getElementById('addItemSection').style.display = 'block';
    document.getElementById('removeItemSection').style.display = 'block';
    document.getElementById('addWarehouseSection').style.display = 'block';
    document.getElementById('removeWarehouseSection').style.display = 'block';
}

// Thêm nhà kho mới
function addWarehouse() {
    var capacity = parseInt(document.getElementById('newWarehouseCapacity').value);

    if (isNaN(capacity) || capacity <= 0) {
        alert('Please enter a valid positive capacity for the new warehouse.');
        return;
    }

    var newIndex = warehouses.length ? Math.max(...warehouses.map(w => w.index)) + 1 : 0;
    var newWarehouse = { 
        capacity: capacity, 
        remainingCapacity: capacity, 
        allocatedItems: [], 
        index: newIndex 
    };
    warehouses.push(newWarehouse);

    // Thử phân bổ các item Not Stored vào kho mới
    var notStoredItems = items.filter(item => 
        !warehouses.some(w => w.allocatedItems.some(allocated => allocated.id === item.id))
    );
    notStoredItems.forEach(item => {
        if (newWarehouse.remainingCapacity >= item.weight) {
            newWarehouse.allocatedItems.push(item);
            newWarehouse.remainingCapacity -= item.weight;
        }
    });

    document.getElementById('newWarehouseCapacity').value = '';
    updateCurrentItemsTable();
    updateWarehouseResults();
    alert(`Warehouse ${newIndex} with capacity ${capacity} kg added${notStoredItems.length > 0 ? ' and items allocated if possible' : ''}.`);
}

// Xóa nhà kho
function removeWarehouse() {
    var warehouseIndex = parseInt(document.getElementById('removeWarehouseIndex').value);

    if (isNaN(warehouseIndex)) {
        alert('Please enter a valid warehouse index.');
        return;
    }

    var warehouseIdx = warehouses.findIndex(w => w.index === warehouseIndex);
    if (warehouseIdx === -1) {
        alert(`Warehouse ${warehouseIndex} does not exist.`);
        return;
    }

    // Xóa kho và để các item trong kho thành Not Stored
    warehouses.splice(warehouseIdx, 1);

    document.getElementById('removeWarehouseIndex').value = '';
    updateCurrentItemsTable();
    updateWarehouseResults();
    alert(`Warehouse ${warehouseIndex} removed successfully. Items are now Not Stored; click "Recalculate Allocation" to reallocate.`);
}

// Thêm hàng hóa mới
function addItem() {
    var profit = parseInt(document.getElementById('newItemProfit').value);
    var weight = parseInt(document.getElementById('newItemWeight').value);

    if (isNaN(profit) || isNaN(weight) || profit < 0 || weight < 0) {
        alert('Please enter valid non-negative profit and weight for the new item.');
        return;
    }

    var newId = items.length ? Math.max(...items.map(item => item.id)) + 1 : 0;
    var newItem = { id: newId, profit: profit, weight: weight };
    items.push(newItem);

    // Tìm kho có sức chứa còn lại lớn nhất trong các kho đủ dung tích
    var suitableWarehouses = warehouses.filter(w => w.remainingCapacity >= weight);
    var allocated = false;
    if (suitableWarehouses.length > 0) {
        suitableWarehouses.sort((a, b) => b.remainingCapacity - a.remainingCapacity);
        var targetWarehouse = suitableWarehouses[0];
        targetWarehouse.allocatedItems.push(newItem);
        targetWarehouse.remainingCapacity -= weight;
        allocated = true;
    }

    document.getElementById('newItemProfit').value = '';
    document.getElementById('newItemWeight').value = '';
    updateCurrentItemsTable();
    if (allocated) {
        updateWarehouseResults();
        alert(`Item ${newId} added to a warehouse with largest remaining capacity.`);
    } else {
        alert(`Item ${newId} added, but no warehouse has enough capacity. Click "Recalculate Allocation" to optimize.`);
        updateWarehouseResults();
    }
}

// Xóa hàng hóa
function removeItem() {
    var itemId = parseInt(document.getElementById('removeItemId').value);

    if (isNaN(itemId)) {
        alert('Please enter a valid item ID.');
        return;
    }

    var itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
        alert(`Item ${itemId} does not exist.`);
        return;
    }

    var item = items[itemIndex];
    items.splice(itemIndex, 1);

    // Xóa item khỏi kho nếu có
    for (var warehouse of warehouses) {
        var allocatedIndex = warehouse.allocatedItems.findIndex(allocated => allocated.id === itemId);
        if (allocatedIndex !== -1) {
            warehouse.allocatedItems.splice(allocatedIndex, 1);
            warehouse.remainingCapacity += item.weight;
            break;
        }
    }

    document.getElementById('removeItemId').value = '';
    updateCurrentItemsTable();
    updateWarehouseResults();
    alert(`Item ${itemId} removed successfully. Remaining capacities updated.`);
}

// Cập nhật bảng danh sách hàng hóa hiện tại
function updateCurrentItemsTable() {
    var tableHtml = '<table class="table table-bordered">';
    tableHtml += '<tr><th>Item ID</th><th>Profit</th><th>Weight</th><th>Profit/Weight</th><th>Status</th></tr>';
    if (items.length === 0) {
        tableHtml += '<tr><td colspan="5">No items available</td></tr>';
    } else {
        items.forEach(item => {
            var profitPerWeight = item.weight > 0 ? (item.profit / item.weight).toFixed(2) : 'N/A';
            var isStored = warehouses.some(warehouse => 
                warehouse.allocatedItems.some(allocated => allocated.id === item.id)
            );
            var status = isStored ? 'Stored' : 'Not Stored';
            tableHtml += `<tr><td>${item.id}</td><td>${item.profit}</td><td>${item.weight}</td><td>${profitPerWeight}</td><td>${status}</td></tr>`;
        });
    }
    tableHtml += '</table>';
    document.getElementById('currentItemsTable').innerHTML = tableHtml;
}

// Tái tính toán phân bổ kho
function recalculate() {
    if (warehouses.length === 0) {
        alert('No warehouses available. Please generate input tables or add a warehouse.');
        return;
    }
    if (items.length === 0) {
        alert('No items available to allocate.');
        document.getElementById('multipleWarehousesResult').innerHTML = '<p>No items to allocate.</p>';
        document.getElementById('kp01ResultantProfit').innerHTML = '0';
        document.getElementById('resultSection').style.visibility = 'visible';
        return;
    }
    manageMultipleWarehouses(true); // true: chạy Knapsack
}

// Cập nhật kết quả kho mà không chạy Knapsack
function updateWarehouseResults() {
    var totalValue = 0;
    var resultHtml = '<h3>Warehouse Allocation Results</h3>';

    // Sắp xếp lại kho theo index để hiển thị đúng thứ tự
    var sortedWarehouses = [...warehouses].sort((a, b) => a.index - b.index);
    for (var warehouse of sortedWarehouses) {
        var warehouseValue = warehouse.allocatedItems.reduce((sum, item) => sum + item.profit, 0);
        totalValue += warehouseValue;

        var warehouseHtml = `<h4>Warehouse ${warehouse.index} (Capacity: ${warehouse.capacity} kg)</h4>`;
        warehouseHtml += '<table class="table table-bordered">';
        warehouseHtml += '<tr><th>Item</th><th>Profit</th><th>Weight</th><th>Profit/Weight</th></tr>';
        if (warehouse.allocatedItems.length === 0) {
            warehouseHtml += '<tr><td colspan="4">No items selected</td></tr>';
        } else {
            for (var item of warehouse.allocatedItems) {
                var profitPerWeight = item.weight > 0 ? (item.profit / item.weight).toFixed(2) : 'N/A';
                warehouseHtml += `<tr><td>Item ${item.id}</td><td>${item.profit}</td><td>${item.weight}</td><td>${profitPerWeight}</td></tr>`;
            }
        }
        warehouseHtml += '</table>';
        warehouseHtml += `<p><strong>Profit for this warehouse: ${warehouseValue}</strong></p>`;
        warehouseHtml += `<p><strong>Remaining Capacity: ${warehouse.remainingCapacity} kg</strong></p>`;
        resultHtml += warehouseHtml;
    }

    resultHtml += `<h3>Total Maximum Profit: ${totalValue}</h3>`;
    document.getElementById('multipleWarehousesResult').innerHTML = resultHtml;
    document.getElementById('kp01ResultantProfit').innerHTML = totalValue;
    document.getElementById('resultSection').style.visibility = 'visible';
}

// Thuật toán cho nhiều kho
function manageMultipleWarehouses(runKnapsack = false) {
    if (runKnapsack) {
        // Xóa phân bổ hiện tại
        for (var warehouse of warehouses) {
            warehouse.allocatedItems = [];
            warehouse.remainingCapacity = warehouse.capacity;
        }

        // Sắp xếp kho theo dung tích giảm dần để ưu tiên kho lớn
        var sortedWarehouses = [...warehouses].sort((a, b) => b.capacity - a.capacity);
        var values = items.map(item => item.profit);
        var weights = items.map(item => item.weight);
        var tempItems = [...items];

        for (var warehouse of sortedWarehouses) {
            var { maxValue, selectedItems } = knapsack01ForWarehouse(values, weights, warehouse.capacity);
            var totalWeight = 0;

            for (var idx of selectedItems) {
                var item = tempItems[idx];
                warehouse.allocatedItems.push(item);
                totalWeight += item.weight;
            }
            warehouse.remainingCapacity = warehouse.capacity - totalWeight;

            // Loại bỏ sản phẩm đã chọn
            selectedItems.sort((a, b) => b - a);
            for (var idx of selectedItems) {
                values.splice(idx, 1);
                weights.splice(idx, 1);
                tempItems.splice(idx, 1);
            }

            if (values.length === 0) {
                break;
            }
        }
    }

    // Cập nhật kết quả
    updateWarehouseResults();
}

// Hàm phụ trợ cho một kho
function knapsack01ForWarehouse(values, weights, W) {
    const n = values.length;
    const dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= W; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    const selectedItems = [];
    let totalWeight = 0;
    let w = W;
    for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            selectedItems.push(i - 1);
            totalWeight += weights[i - 1];
            w -= weights[i - 1];
        }
    }
    selectedItems.reverse();

    return { maxValue: dp[n][W], selectedItems, totalWeight };
}