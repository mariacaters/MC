document.addEventListener("DOMContentLoaded", async () => {

    await loadOrders();

    await loadBills();

});

async function loadOrders() {

    const container = document.getElementById("ordersContainer");

    const orders = await getAllData(STORES.MENUS);

    if (orders.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <h3>No Orders Created Yet</h3>
            </div>
        `;

        return;

    }

    orders.sort((a, b) => b.id - a.id);

    let html = `
        <div class="table-wrapper">
        <table class="orders-table">

        <thead>
        <tr>
            <th width="80">ID</th>
            <th>Details</th>
            <th width="180">Actions</th>
        </tr>
        </thead>

        <tbody>
    `;

    for (const order of orders) {

        let details = "";

        for (const detail of order.details) {

            details += `<strong>${detail.key}</strong>: ${detail.value}<br>`;

        }

        html += `
        <tr>

            <td>#${order.id}</td>

            <td>${details}</td>

            <td>

                <div class="actions">

                    <a href="order.html?id=${order.id}"
                        class="btn edit">
                        Edit
                    </a>

                    <a href="#"
                        class="btn delete"
                        onclick="deleteOrder(${order.id})">
                        Delete
                    </a>

                </div>

            </td>

        </tr>
        `;

    }

    html += `
        </tbody>
        </table>
        </div>
    `;

    container.innerHTML = html;

}

async function loadBills() {

    const container = document.getElementById("billsContainer");

    const bills = await getAllData(STORES.BILLS);

    if (bills.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <h3>No Bills Created Yet</h3>
            </div>
        `;

        return;

    }

    bills.sort((a, b) => b.id - a.id);

    let html = `
        <div class="table-wrapper">
        <table class="bills-table">

        <thead>
        <tr>
            <th width="80">ID</th>
            <th>Details</th>
            <th width="100">Total</th>
            <th width="180">Actions</th>
        </tr>
        </thead>

        <tbody>
    `;

    for (const bill of bills) {

        let details = "";

        for (const detail of bill.details) {

            details += `<strong>${detail.key}</strong>: ${detail.value}<br>`;

        }

        html += `
        <tr>

            <td>#${bill.id}</td>

            <td>${details}</td>

            <td><strong>${bill.total}</strong></td>

            <td>

                <div class="actions">

                    

                    <a href="bill.html?id=${bill.id}"
                        class="btn edit">
                        Edit
                    </a>

                    <a href="#"
                        class="btn delete"
                        onclick="deleteBill(${bill.id})">
                        Delete
                    </a>

                </div>

            </td>

        </tr>
        `;

    }

    html += `
        </tbody>
        </table>
        </div>
    `;

    container.innerHTML = html;

}

async function deleteOrder(id) {

    if (!confirm("Are you sure you want to delete this menu order?")) {
        return;
    }

    await deleteData(STORES.MENUS, id);

    loadOrders();

}

async function deleteBill(id) {

    if (!confirm("Are you sure you want to delete this bill?")) {
        return;
    }

    await deleteData(STORES.BILLS, id);

    loadBills();

}

function printMenu(id) {

    window.location.href = `menu_pdf.html?id=${id}`;

}

function printBill(id) {

    window.location.href = `bill_pdf.html?id=${id}`;

}