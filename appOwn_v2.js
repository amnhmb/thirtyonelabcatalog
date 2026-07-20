let quoteSelectionsOwn = {
    design: null,
    alterDesign: 'No',
    quantity: null,
    material: null,
    cutting: null,
    sleeve: null,
    nameset: 'No',
    neck: null
};
let currentQuoteStepOwn = 1;
const quoteBuilderOwnModal = document.getElementById('quoteBuilderOwnModal');

// Init Quote Builder using configData from config.js
initQuoteBuilderOwn();

function openQuoteBuilderOwn() {
    try {
        quoteBuilderOwnModal.classList.add('active');
        document.body.classList.add('no-scroll');
        currentQuoteStepOwn = 1;
        updateQuoteStepOwn();
    } catch (e) {
        alert("Error in openQuoteBuilderOwn: " + e.message);
    }
}

document.getElementById('quoteBuilderOwnClose').addEventListener('click', () => {
    quoteBuilderOwnModal.classList.remove('active');
    document.body.classList.remove('no-scroll');
});

// Quote Builder Logic
function initQuoteBuilderOwn() {
    // Populate dynamic selects
    document.getElementById('qbOwnQuantity').min = configData.minimumOrderQuantity;
    document.getElementById('qbOwnQuantity').value = configData.minimumOrderQuantity;

    populateSelectOwn('qbOwnMaterial', configData.materials);
    populateSelectOwn('qbOwnCutting', configData.cuttings);
    populateSelectOwn('qbOwnNeck', configData.necks);
}

function populateSelectOwn(id, list) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '<option value="">-- Choose Option --</option>';
    list.forEach(item => {
        select.innerHTML += `<option value="${item.label}">${item.label}</option>`;
    });
}

function updateQuoteStepOwn() {
    document.querySelectorAll('#quoteBuilderOwnModal .quote-step').forEach(el => el.style.display = 'none');
    document.getElementById(`stepOwn${currentQuoteStepOwn}`).style.display = 'block';

    const progressText = currentQuoteStepOwn <= 7 ? `Step ${currentQuoteStepOwn} of 7` : 'Summary';
    document.getElementById('quoteProgressOwn').innerText = progressText;

    if (currentQuoteStepOwn === 8) {
        // Build summary
        let designStr = quoteSelectionsOwn.design === 'Custom' || quoteSelectionsOwn.design === 'For Your Own Design' ? 'For Your Own Design' : `#${quoteSelectionsOwn.design}`;
        if (quoteSelectionsOwn.alterDesign === 'Yes') designStr += ' (Alter Mockup)';

        document.getElementById('summaryOwnDesign').innerText = designStr;
        document.getElementById('summaryOwnQuantity').innerText = quoteSelectionsOwn.quantity;
        document.getElementById('summaryOwnMaterial').innerText = quoteSelectionsOwn.material;
        document.getElementById('summaryOwnCutting').innerText = quoteSelectionsOwn.cutting;
        document.getElementById('summaryOwnSleeve').innerText = quoteSelectionsOwn.sleeve;
        document.getElementById('summaryOwnNameset').innerText = quoteSelectionsOwn.nameset;
        document.getElementById('summaryOwnNeck').innerText = quoteSelectionsOwn.neck;
    }
}

function nextStepOwn() {
    if (currentQuoteStepOwn === 1) {
        const checked = document.querySelector('input[name="alterOwnDesign"]:checked');
        if (checked) quoteSelectionsOwn.alterDesign = checked.value;
    }
    if (currentQuoteStepOwn === 2) {
        quoteSelectionsOwn.quantity = document.getElementById('qbOwnQuantity').value;
        if (quoteSelectionsOwn.quantity < configData.minimumOrderQuantity) {
            alert(`Minimum order is ${configData.minimumOrderQuantity}`); return;
        }
    }
    if (currentQuoteStepOwn === 3) {
        if (!document.getElementById('qbOwnMaterial').value) { alert('Please select material'); return; }
        quoteSelectionsOwn.material = document.getElementById('qbOwnMaterial').value;
    }
    if (currentQuoteStepOwn === 4) {
        if (!document.getElementById('qbOwnCutting').value) { alert('Please select cutting'); return; }
        quoteSelectionsOwn.cutting = document.getElementById('qbOwnCutting').value;
    }
    if (currentQuoteStepOwn === 5) {
        const totalQty = parseInt(quoteSelectionsOwn.quantity);
        if (document.querySelector('input[name="sleeveOwnShortOpt"][value="all"]').checked) {
            quoteSelectionsOwn.sleeve = "Short Sleeve (All)";
        } else if (document.querySelector('input[name="sleeveOwnLongOpt"][value="all"]').checked) {
            quoteSelectionsOwn.sleeve = "Long Sleeve (All)";
        } else {
            const sQty = parseInt(document.getElementById('qbOwnSleeveShortQty').value) || 0;
            const lQty = parseInt(document.getElementById('qbOwnSleeveLongQty').value) || 0;

            if (sQty + lQty !== totalQty) {
                document.getElementById('sleeveOwnError').style.display = 'block';
                return;
            }
            document.getElementById('sleeveOwnError').style.display = 'none';

            let sleeveStr = [];
            if (sQty > 0) sleeveStr.push(`Short Sleeve (${sQty})`);
            if (lQty > 0) sleeveStr.push(`Long Sleeve (${lQty})`);
            quoteSelectionsOwn.sleeve = sleeveStr.join(', ');
        }
    }
    if (currentQuoteStepOwn === 6) {
        const checked = document.querySelector('input[name="addOwnNameset"]:checked');
        if(checked) quoteSelectionsOwn.nameset = checked.value;
    }
    if (currentQuoteStepOwn === 7) {
        if (!document.getElementById('qbOwnNeck').value) { alert('Please select neck'); return; }
        quoteSelectionsOwn.neck = document.getElementById('qbOwnNeck').value;
    }

    currentQuoteStepOwn++;
    updateQuoteStepOwn();
}

function prevStepOwn() {
    if (currentQuoteStepOwn > 1) {
        currentQuoteStepOwn--;
        updateQuoteStepOwn();
    }
}

document.querySelectorAll('.qb-own-next').forEach((btn) => {
    btn.addEventListener('click', nextStepOwn);
});
document.querySelectorAll('.qb-own-prev').forEach((btn) => {
    btn.addEventListener('click', prevStepOwn);
});

// WhatsApp Generator
document.getElementById('sendWhatsAppOwnBtn').addEventListener('click', () => {
    let designText = quoteSelectionsOwn.design === 'Custom' || quoteSelectionsOwn.design === 'For Your Own Design' ? 'For Your Own Design' : `#${quoteSelectionsOwn.design}`;
    if (quoteSelectionsOwn.alterDesign === 'Yes') designText += ' (Alter Mockup)';

    const message = `Hi ThirtyOne Lab! I'm interested in ordering:

Design: ${designText}
Quantity: ${quoteSelectionsOwn.quantity} pieces
Material: ${quoteSelectionsOwn.material}
Cutting: ${quoteSelectionsOwn.cutting}
Sleeve: ${quoteSelectionsOwn.sleeve}
Nameset: ${quoteSelectionsOwn.nameset}
Neck/Collar: ${quoteSelectionsOwn.neck}

Could I get a quotation for this order?`;

    const encoded = encodeURIComponent(message);
    const myWhatsAppNumber = "601125614436";
    window.open(`https://wa.me/${myWhatsAppNumber}?text=${encoded}`, '_blank');
});

// Sleeve Table Logic
const sleeveOwnShortAll = document.querySelector('input[name="sleeveOwnShortOpt"][value="all"]');
const sleeveOwnShortFill = document.querySelector('input[name="sleeveOwnShortOpt"][value="fill"]');
const sleeveOwnShortQty = document.getElementById('qbOwnSleeveShortQty');

const sleeveOwnLongAll = document.querySelector('input[name="sleeveOwnLongOpt"][value="all"]');
const sleeveOwnLongFill = document.querySelector('input[name="sleeveOwnLongOpt"][value="fill"]');
const sleeveOwnLongQty = document.getElementById('qbOwnSleeveLongQty');

function updateSleeveOwnState() {
    if (!sleeveOwnShortAll) return; // safety
    if (sleeveOwnShortAll.checked) {
        sleeveOwnShortQty.disabled = true;
        sleeveOwnShortQty.value = '';
        if(sleeveOwnLongAll) {
            sleeveOwnLongAll.disabled = true;
            sleeveOwnLongFill.disabled = true;
            sleeveOwnLongQty.disabled = true;
            sleeveOwnLongAll.checked = false;
            sleeveOwnLongFill.checked = false;
            sleeveOwnLongQty.value = '';
        }
    } else if (sleeveOwnLongAll && sleeveOwnLongAll.checked) {
        sleeveOwnLongQty.disabled = true;
        sleeveOwnLongQty.value = '';
        sleeveOwnShortAll.disabled = true;
        sleeveOwnShortFill.disabled = true;
        sleeveOwnShortQty.disabled = true;
        sleeveOwnShortAll.checked = false;
        sleeveOwnShortFill.checked = false;
        sleeveOwnShortQty.value = '';
    } else {
        sleeveOwnShortAll.disabled = false;
        if(sleeveOwnShortFill) sleeveOwnShortFill.disabled = false;
        if(sleeveOwnLongAll) sleeveOwnLongAll.disabled = false;
        if(sleeveOwnLongFill) sleeveOwnLongFill.disabled = false;
        
        sleeveOwnShortQty.disabled = !sleeveOwnShortFill.checked;
        if (!sleeveOwnShortFill.checked) sleeveOwnShortQty.value = '';
        
        if(sleeveOwnLongQty && sleeveOwnLongFill) {
            sleeveOwnLongQty.disabled = !sleeveOwnLongFill.checked;
            if (!sleeveOwnLongFill.checked) sleeveOwnLongQty.value = '';
        }
    }
}

document.querySelectorAll('input[name="sleeveOwnShortOpt"], input[name="sleeveOwnLongOpt"]').forEach(radio => {
    radio.addEventListener('change', updateSleeveOwnState);
});
if(sleeveOwnShortAll) updateSleeveOwnState();