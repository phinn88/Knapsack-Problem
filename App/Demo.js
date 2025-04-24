var numWarehouses;
var numItems;
var warehouses = []; // Lưu danh sách kho: [{capacity, remainingCapacity, allocatedItems, index}, ...]
var items = []; // Lưu danh sách hàng hóa: [{id, profit, weight}, ...]

// Hàm đọc và xử lý file CSV
function loadCSVFile(event) {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a CSV file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    reader.readAsText(file);
}
// xuất thông tin ra file csv
function exportToCSV() {
    // Kiểm tra nếu không có dữ liệu
    if (!warehouses.length && !items.length) {
        alert('No data to export. Please load or input data first.');
        return;
    }

    // Tạo tiêu đề CSV
    let csvContent = 'Type,Index/ID,Capacity/Profit,Weight\n';

    // Thêm dữ liệu kho
    for (let warehouse of warehouses) {
        csvContent += `Warehouse,${warehouse.index},${warehouse.capacity},\n`;
    }

    // Thêm dữ liệu mặt hàng
    for (let item of items) {
        csvContent += `Item,${item.id},${item.profit},${item.weight}\n`;
    }

    // Tạo blob và URL để tải xuống
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'warehouse_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('Data exported successfully to warehouse_data.csv');
}

// Hàm phân tích dữ liệu CSV
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    if (headers[0] !== 'Type' || headers[1] !== 'Index/ID' || headers[2] !== 'Capacity/Profit' || headers[3] !== 'Weight') {
        alert('Invalid CSV format. Expected headers: Type,Index/ID,Capacity/Profit,Weight');
        return;
    }

    warehouses = [];
    items = [];

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim());
        const type = row[0];
        const indexOrId = parseInt(row[1]);
        const capacityOrProfit = parseInt(row[2]);
        const weight = row[3] ? parseInt(row[3]) : null;

        if (isNaN(indexOrId) || isNaN(capacityOrProfit)) {
            alert(`Invalid data in row ${i + 1}.`);
            return;
        }

        if (type === 'Warehouse') {
            if (capacityOrProfit <= 0) {
                alert(`Invalid capacity for Warehouse ${indexOrId} in row ${i + 1}.`);
                return;
            }
            warehouses.push({
                capacity: capacityOrProfit,
                remainingCapacity: capacityOrProfit,
                allocatedItems: [],
                index: indexOrId
            });
        } else if (type === 'Item') {
            if (isNaN(weight) || weight < 0 || capacityOrProfit < 0) {
                alert(`Invalid profit or weight for Item ${indexOrId} in row ${i + 1}.`);
                return;
            }
            items.push({
                id: indexOrId,
                profit: capacityOrProfit,
                weight: weight
            });
        } else {
            alert(`Invalid type in row ${i + 1}. Use "Warehouse" or "Item".`);
            return;
        }
    }

    numWarehouses = warehouses.length;
    numItems = items.length;

    console.log('Parsed CSV - Warehouses:', warehouses);
    console.log('Parsed CSV - Items:', items);

    document.getElementById('numWarehouses').value = numWarehouses;
    document.getElementById('numItems').value = numItems;

    createInputTables();
    populateInputTables();
    updateCurrentItemsTable();

    alert('CSV file loaded successfully.');
}

// Hàm điền dữ liệu từ warehouses và items vào bảng nhập liệu
function populateInputTables() {
    // Điền dữ liệu cho bảng kho
    const warehouseTable = document.getElementById('warehouseInputTable');
    if (!warehouseTable) {
        console.error('Warehouse table not found.');
        return;
    }
    console.log('Populating warehouses:', warehouses);
    for (let i = 0; i < warehouses.length; i++) {
        const row = warehouseTable.rows[i + 1];
        if (!row) {
            console.error(`Row ${i + 1} not found in warehouse table.`);
            continue;
        }
        const capacityInput = row.cells[1].querySelector('input');
        if (capacityInput) {
            capacityInput.value = warehouses[i].capacity || '';
            console.log(`Set capacity for warehouse ${i}: ${warehouses[i].capacity}`);
        } else {
            console.error(`Capacity input not found for warehouse ${i}.`);
        }
    }

    // Điền dữ liệu cho bảng hàng hóa
    const itemTable = document.getElementById('itemInputTable');
    if (!itemTable) {
        console.error('Item table not found.');
        return;
    }
    console.log('Populating items:', items);
    for (let i = 0; i < items.length; i++) {
        const row = itemTable.rows[i + 1];
        if (!row) {
            console.error(`Row ${i + 1} not found in item table.`);
            continue;
        }
        const profitInput = row.cells[1].querySelector('input');
        const weightInput = row.cells[2].querySelector('input');
        if (profitInput && weightInput) {
            profitInput.value = items[i].profit || '';
            weightInput.value = items[i].weight || '';
            console.log(`Set profit/weight for item ${i}: ${items[i].profit}/${items[i].weight}`);
        } else {
            console.error(`Input fields not found for item ${i}.`);
        }
    }
}

// Tạo bảng nhập liệu cho kho và hàng hóa
function createInputTables() {
    numWarehouses = parseInt(document.getElementById('numWarehouses').value) || 0;
    numItems = parseInt(document.getElementById('numItems').value) || 0;

    if (numWarehouses <= 0 || numItems <= 0) {
        alert('Please enter a valid number of warehouses and items (greater than 0).');
        return;
    }

    // Tạo bảng cho kho
    let warehouseHeader = '<table class="table table-bordered" id="warehouseInputTable"><tr><th scope="col">Warehouse</th><th scope="col">Capacity (kg)</th></tr>';
    let warehouseBody = '';
    for (let i = 0; i < numWarehouses; i++) {
        warehouseBody += `<tr><td>Warehouse ${i}</td><td><input type="number" class="form-control capacity-input" placeholder="Capacity" min="0" required /></td></tr>`;
    }
    document.getElementById('warehouseTable').innerHTML = warehouseHeader + warehouseBody + '</table>';

    // Tạo bảng cho hàng hóa
    let itemHeader = '<table class="table table-bordered" id="itemInputTable"><tr><th scope="col">Item</th><th scope="col">Profit</th><th scope="col">Weight (kg)</th></tr>';
    let itemBody = '';
    for (let i = 0; i < numItems; i++) {
        itemBody += `<tr><td>Item ${i}</td><td><input type="number" class="form-control profit-input" placeholder="Profit" min="0" required /></td><td><input type="number" class="form-control weight-input" placeholder="Weight" min="0" required /></td></tr>`;
    }
    document.getElementById('itemTable').innerHTML = itemHeader + itemBody + '</table>';

    // Không xóa dữ liệu warehouses và items, chỉ cập nhật giao diện
    document.getElementById('resultSection').style.visibility = 'hidden';
    document.getElementById('multipleWarehousesResult').innerHTML = '';
    document.getElementById('kp01ResultantProfit').innerHTML = '';
    document.getElementById('currentItemsTable').innerHTML = '';
    document.getElementById('addItemSection').style.display = 'none';
    document.getElementById('removeItemSection').style.display = 'none';
    document.getElementById('addWarehouseSection').style.display = 'none';
    document.getElementById('removeWarehouseSection').style.display = 'none';

    console.log('Input tables created:', numWarehouses, 'warehouses,', numItems, 'items');
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
    var totalRemainingCapacity = 0;
    var totalUnallocatedWeight = 0; // Biến mới để lưu tổng khối lượng hàng hóa không phân bổ
    var resultHtml = '<h3>Warehouse Allocation Results</h3>';

    // Tạo tập hợp các ID mặt hàng được phân bổ
    var allocatedItemIds = new Set();
    for (var warehouse of warehouses) {
        for (var item of warehouse.allocatedItems) {
            allocatedItemIds.add(item.id);
        }
    }

    // Tính tổng trọng lượng của các mặt hàng không được phân bổ
    for (var item of items) {
        if (!allocatedItemIds.has(item.id)) {
            totalUnallocatedWeight += item.weight;
        }
    }

    // Sắp xếp kho theo index để hiển thị đúng thứ tự
    var sortedWarehouses = [...warehouses].sort((a, b) => a.index - b.index);
    for (var warehouse of sortedWarehouses) {
        var warehouseValue = warehouse.allocatedItems.reduce((sum, item) => sum + item.profit, 0);
        totalValue += warehouseValue;
        totalRemainingCapacity += warehouse.remainingCapacity;

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

    // Thêm tổng dung tích còn thừa, tổng khối lượng không phân bổ, và tổng lợi nhuận
    resultHtml += `<h3>Total Remaining Capacity: ${totalRemainingCapacity} kg</h3>`;
    resultHtml += `<h3>Total Unallocated Items Weight: ${totalUnallocatedWeight} kg</h3>`;
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