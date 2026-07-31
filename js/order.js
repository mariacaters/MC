document.addEventListener("DOMContentLoaded", init);

let editing = false;
let orderId = null;

async function init() {

    const form = document.getElementById("orderForm");

    const params = new URLSearchParams(window.location.search);

    orderId = Number(params.get("id"));

    if (orderId) {

        editing = true;

        document.querySelector("h1").textContent = "Edit Menu Order";

        document.querySelector(".save-btn").textContent = "Update Order";

        await loadOrder();

    }

    form.addEventListener("submit", saveOrder);

}

async function loadOrder() {

    const order = await getData(STORES.MENUS, orderId);

    if (!order) {

        alert("Order not found.");

        window.location.href = "index.html";

        return;

    }

    // Clear default rows
    document.getElementById("detailsContainer").innerHTML = "";
    document.getElementById("categoryBody").innerHTML = "";

    // Load details
    order.details.forEach(detail => {

        const row = document.createElement("div");

        row.className = "detail-row";

        row.innerHTML = `
            <input
                type="text"
                name="detail_key[]"
                value="${detail.key}"
                required
                oninput="renderPreview()">

            <input
                type="text"
                name="detail_value[]"
                value="${detail.value}"
                required
                oninput="renderPreview()">

            <button
                type="button"
                class="remove-detail-btn">
                ×
            </button>
        `;

        document.getElementById("detailsContainer").appendChild(row);

    });

    // Load categories
    order.sections.forEach(section => {

        addCategory();

        const row = document.querySelector("#categoryBody .category-row:last-child");

        row.querySelector(".category-input").value = section.category;

        const list = row.querySelector(".item-list");

        const hidden = row.querySelector(".items-hidden");

        section.items.forEach(item => {

            const chip = document.createElement("div");

            chip.className = "item-chip";

            chip.innerHTML = `
                <span>${item}</span>
                <button
                    type="button"
                    onclick="removeItem(this)">
                    ×
                </button>
            `;

            list.appendChild(chip);

        });

        hidden.value = section.items.join("\n");

    });

    renderPreview();

}

async function saveOrder(event) {

    event.preventDefault();

    // ---------- Details ----------

    const details = [];

    const detailRows = document.querySelectorAll(".detail-row");

    for (const row of detailRows) {

        const inputs = row.querySelectorAll("input");

        const key = inputs[0].value.trim();

        const value = inputs[1].value.trim();

        if (key === "" || value === "") {

            alert("Please fill all order details.");

            return;

        }

        details.push({
            key,
            value
        });

    }

    // ---------- Sections ----------

    const sections = [];

    const categoryRows = document.querySelectorAll(".category-row");

    for (const row of categoryRows) {

        const category = row.querySelector(".category-input").value.trim();

        if (category === "") {

            alert("Category name cannot be empty.");

            return;

        }

        const items = [];

        row.querySelectorAll(".item-chip span").forEach(span => {

            items.push(span.textContent);

        });

        if (items.length === 0) {

            alert(`Please add at least one item to "${category}".`);

            return;

        }

        sections.push({

            category,
            items

        });

    }

    const order = {

        details,
        sections

    };

    let success = false;

    if (editing) {

        order.id = orderId;

        success = await updateData(STORES.MENUS, order);

    } else {

        success = await addData(STORES.MENUS, order);

    }

    if (success) {

        alert(editing ? "Order updated successfully!" : "Order saved successfully!");

    } else {

        alert("Failed to save order.");

    }

}

const renderer = new DocumentRenderer({

    background:"images/menu-bg.png",

    filename:"Menu Order"

});

function createPage() {

    const page = document.createElement("div");

    page.className = "preview-page";

    page.innerHTML = `
        <img class="preview-bg" src="images/menu-bg.png">

        <div class="preview-content"></div>
    `;

    return page;

}

function createBlock(html) {

    const div = document.createElement("div");
    div.innerHTML = html;

    return div.firstElementChild;

}