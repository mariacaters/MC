document.addEventListener("DOMContentLoaded", init);

let editing = false;
let billId = null;

async function init() {

    const form = document.getElementById("billForm");

    const params = new URLSearchParams(window.location.search);

    billId = Number(params.get("id"));

    if (billId) {

        editing = true;

        document.querySelector("h1").textContent = "Edit Bill";

        document.querySelector(".save-btn").textContent = "Update Bill";

        await loadBill();

    }

    form.addEventListener("submit", saveBill);
    renderPreview();

}

async function loadBill() {

    const bill = await getData(STORES.BILLS, billId);

    if (!bill) {

        alert("Bill not found.");

        window.location.href = "index.html";

        return;

    }

    const detailsContainer = document.getElementById("detailsContainer");
    const itemsContainer = document.getElementById("itemsContainer");

    detailsContainer.innerHTML = "";
    itemsContainer.innerHTML = "";

    bill.details.forEach(detail => {

        const row = document.createElement("div");

        row.className = "detail-row";

        row.innerHTML = `
            <input
                type="text"
                name="detail_key[]"
                value="${detail.key}"
                placeholder="Label"
                oninput="renderPreview()">

            <input
                type="text"
                name="detail_value[]"
                value="${detail.value}"
                placeholder="Value"
                oninput="renderPreview()">

            <button
                type="button"
                class="remove-detail-btn">×</button>
        `;

        detailsContainer.appendChild(row);

    });

    bill.items.forEach(item => {

        const row = document.createElement("div");

        row.className = "detail-row";

        row.innerHTML = `
            <input
                type="text"
                name="item_key[]"
                value="${item.key}"
                placeholder="Item"
                oninput="renderPreview()">

            <input
                type="text"
                name="item_value[]"
                value="${item.value}"
                placeholder="Amount"
                oninput="renderPreview()">

            <button
                type="button"
                class="remove-detail-btn">×</button>
        `;

        itemsContainer.appendChild(row);

    });

    document.getElementById("totalInput").value = bill.total;

    renderPreview();

}

async function saveBill(event) {

    event.preventDefault();

    const details = [];

    const detailRows = document.querySelectorAll("#detailsContainer .detail-row");

    for (const row of detailRows) {

        const inputs = row.querySelectorAll("input");

        const key = inputs[0].value.trim();

        const value = inputs[1].value.trim();

        details.push({
            key,
            value
        });

    }

    const items = [];

    const itemRows = document.querySelectorAll("#itemsContainer .detail-row");

    for (const row of itemRows) {

        const inputs = row.querySelectorAll("input");

        const key = inputs[0].value.trim();

        const value = inputs[1].value.trim();


        items.push({
            key,
            value
        });

    }

    const total = document.getElementById("totalInput").value.trim();

    if (total === "") {

        alert("Please enter the total amount.");

        return;

    }

    const bill = {

        details,
        items,
        total

    };

    let success = false;

    if (editing) {

        bill.id = billId;

        success = await updateData(STORES.BILLS, bill);

    } else {

        success = await addData(STORES.BILLS, bill);

    }

    if (success) {

        alert(editing ? "Bill updated successfully!" : "Bill saved successfully!");

        window.location.href = "index.html";

    } else {

        alert("Failed to save bill.");

    }

}

function collectBillData(){

    const details = [];
    const items = [];

    document.querySelectorAll("#detailsContainer .detail-row")
        .forEach(row=>{

            const inputs=row.querySelectorAll("input");

            const key=inputs[0].value.trim();
            const value=inputs[1].value.trim();            
            details.push({
                key,
                value
            });         

        });

    document.querySelectorAll("#itemsContainer .detail-row")
        .forEach(row=>{

            const inputs=row.querySelectorAll("input");

            const key=inputs[0].value.trim();
            const value=inputs[1].value.trim();

            items.push({
                key,
                value
            });
        });

    return{

        details,

        items,

        total:document.getElementById("totalInput").value.trim()

    };

}

function createBlock(html){

    const block = document.createElement("div");

    block.innerHTML = html.trim();

    return block.firstElementChild;

}

function createPage(){

    const page = document.createElement("div");

    page.className = "preview-page";

    page.innerHTML = `
        <img
            class="preview-bg"
            src="images/menu-bg.png">

        <div class="preview-content"></div>
    `;

    document
        .getElementById("pdfPreview")
        .appendChild(page);

    return page.querySelector(".preview-content");

}

function buildBillPreview(){

    const data = collectBillData();

    const blocks = [];

    data.details.forEach(detail => {

        blocks.push(createBlock(`
            <div class="pdf-detail">
                <span class="detail-label">${detail.key}</span>
                <span class="detail-value">: ${detail.value}</span>
            </div>
        `));

    });

    blocks.push(createBlock(`
        <div class="details-gap"></div>
    `));

    data.items.forEach(item => {

        blocks.push(createBlock(`
            <div class="bill-item-row">
                <span>${item.key}</span>
                <span>${item.value}</span>
            </div>
        `));

    });

    blocks.push(createBlock(`
        <div class="bill-total">
            <span>Total</span>
            <span>${data.total}</span>
        </div>
    `));

    return blocks;

}

function renderPreview(){

    const preview = document.getElementById("pdfPreview");

    preview.innerHTML = "";

    let content = createPage();

    const blocks = buildBillPreview();

    blocks.forEach(block=>{

        content.appendChild(block);

        if(content.scrollHeight > content.clientHeight){

            content.removeChild(block);

            content = createPage();

            content.appendChild(block);

        }

    });

}

async function downloadPDF(){

    renderPreview();

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4"
    });

    const pages = document.querySelectorAll(".preview-page");

    for(let i = 0; i < pages.length; i++){

        const canvas = await html2canvas(pages[i],{
            scale:3,
            useCORS:true
        });

        const img = canvas.toDataURL("image/png");

        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        if(i > 0){
            pdf.addPage();
        }

        pdf.addImage(
            img,
            "PNG",
            0,
            0,
            width,
            height
        );

    }

    pdf.save(`Bill_${Date.now()}.pdf`);

}