let quoteSelectionsOwn = {
    design: null,
    alterDesign: 'No',
    quantity: null,
    material: null,
    cutting: null,
    sleeve: null,
    nameset: 'No',
    sponsor: 'No',
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

        // Reset quantity checkbox and input status
        document.getElementById('qbOwnQuantityNotSure').checked = false;
        document.getElementById('qbOwnQuantity').disabled = false;
        document.getElementById('qbOwnQuantity').style.opacity = '';
        document.getElementById('qbOwnQuantity').value = configData.minimumOrderQuantity;

        // Reset sleeve state
        document.querySelector('input[name="sleeveOwnShortOpt"][value="all"]').checked = true;
        document.querySelector('input[name="sleeveOwnLongOpt"][value="all"]').checked = false;
        if (typeof updateSleeveOwnState === 'function') updateSleeveOwnState();

        // Reset card previews
        if (typeof updateMaterialPreview === 'function') {
            updateMaterialPreview('qbOwnMaterialPreview', '');
            updateNeckPreview('qbOwnNeckPreview', '');
        }

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

    // Bind change listeners for material & neck previews
    const matSelect = document.getElementById('qbOwnMaterial');
    if (matSelect) {
        matSelect.addEventListener('change', (e) => {
            if (typeof updateMaterialPreview === 'function') {
                updateMaterialPreview('qbOwnMaterialPreview', e.target.value);
            }
        });
    }

    const neckSelect = document.getElementById('qbOwnNeck');
    if (neckSelect) {
        neckSelect.addEventListener('change', (e) => {
            if (typeof updateNeckPreview === 'function') {
                updateNeckPreview('qbOwnNeckPreview', e.target.value);
            }
        });
    }

    // Quantity Not Sure Change Event Listener
    document.getElementById('qbOwnQuantityNotSure').addEventListener('change', (e) => {
        const qtyInput = document.getElementById('qbOwnQuantity');
        if (e.target.checked) {
            qtyInput.disabled = true;
            qtyInput.style.opacity = '0.5';
        } else {
            qtyInput.disabled = false;
            qtyInput.style.opacity = '';
        }
    });

    // Sleeve Not Sure Event Listener is added below where updateSleeveOwnState is defined
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

    // Show/hide WhatsApp guide panel (only on step 1)
    const guidePanel = document.getElementById('waGuidePanel');
    const modalContent = document.querySelector('.quote-modal-content--own');
    if (guidePanel) {
        if (currentQuoteStepOwn === 1) {
            guidePanel.style.display = '';
            if (modalContent) modalContent.style.maxWidth = '860px';
        } else {
            guidePanel.style.display = 'none';
            if (modalContent) modalContent.style.maxWidth = '480px';
        }
    }

    if (currentQuoteStepOwn === 3) {
        if (typeof updateMaterialPreview === 'function') {
            updateMaterialPreview('qbOwnMaterialPreview', document.getElementById('qbOwnMaterial').value);
        }
    } else if (currentQuoteStepOwn === 5) {
        if (typeof updateNeckPreview === 'function') {
            updateNeckPreview('qbOwnNeckPreview', document.getElementById('qbOwnNeck').value);
        }
    }

    if (currentQuoteStepOwn === 8) {
        // Build summary
        let designStr = quoteSelectionsOwn.design === 'Custom' || quoteSelectionsOwn.design === 'For Your Own Design' ? 'Use My Own Design' : `#${quoteSelectionsOwn.design}`;
        if (quoteSelectionsOwn.alterDesign === 'Yes') designStr += ' (Alter Mockup)';

        document.getElementById('summaryOwnDesign').innerText = designStr;
        document.getElementById('summaryOwnQuantity').innerText = quoteSelectionsOwn.quantity;
        document.getElementById('summaryOwnMaterial').innerText = quoteSelectionsOwn.material;
        document.getElementById('summaryOwnCutting').innerText = quoteSelectionsOwn.cutting;
        document.getElementById('summaryOwnSleeve').innerText = quoteSelectionsOwn.sleeve;
        document.getElementById('summaryOwnNameset').innerText = quoteSelectionsOwn.nameset;
        document.getElementById('summaryOwnSponsor').innerText = quoteSelectionsOwn.sponsor;
        document.getElementById('summaryOwnNeck').innerText = quoteSelectionsOwn.neck;
    }
}

function nextStepOwn() {
    if (currentQuoteStepOwn === 1) {
        const checked = document.querySelector('input[name="alterOwnDesign"]:checked');
        if (checked) quoteSelectionsOwn.alterDesign = checked.value;
    }
    if (currentQuoteStepOwn === 2) {
        const notSure = document.getElementById('qbOwnQuantityNotSure').checked;
        if (notSure) {
            quoteSelectionsOwn.quantity = "Not Sure Yet";
        } else {
            quoteSelectionsOwn.quantity = document.getElementById('qbOwnQuantity').value;
            if (quoteSelectionsOwn.quantity < configData.minimumOrderQuantity) {
                alert(`Minimum order is ${configData.minimumOrderQuantity}`); return;
            }
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
        if (!document.getElementById('qbOwnNeck').value) { alert('Please select neck'); return; }
        quoteSelectionsOwn.neck = document.getElementById('qbOwnNeck').value;
    }
    if (currentQuoteStepOwn === 6) {
        const totalQty = parseInt(quoteSelectionsOwn.quantity);
        if (document.querySelector('input[name="sleeveOwnShortOpt"][value="all"]').checked) {
            quoteSelectionsOwn.sleeve = "Short Sleeve (All)";
        } else if (document.querySelector('input[name="sleeveOwnLongOpt"][value="all"]').checked) {
            quoteSelectionsOwn.sleeve = "Long Sleeve (All)";
        } else {
            const sQty = parseInt(document.getElementById('qbOwnSleeveShortQty').value) || 0;
            const lQty = parseInt(document.getElementById('qbOwnSleeveLongQty').value) || 0;

            if (quoteSelectionsOwn.quantity !== "Not Sure Yet" && sQty + lQty !== totalQty) {
                document.getElementById('sleeveOwnError').style.display = 'block';
                return;
            }
            document.getElementById('sleeveOwnError').style.display = 'none';

            let sleeveStr = [];
            if (sQty > 0) sleeveStr.push(`Short Sleeve (${sQty})`);
            if (lQty > 0) sleeveStr.push(`Long Sleeve (${lQty})`);
            quoteSelectionsOwn.sleeve = sleeveStr.join(', ') || "No sleeve config selected";
        }
    }
    if (currentQuoteStepOwn === 7) {
        const namesetChecked = document.querySelector('input[name="addOwnNameset"]:checked');
        if (namesetChecked) quoteSelectionsOwn.nameset = namesetChecked.value;
        const sponsorChecked = document.querySelector('input[name="addOwnSponsor"]:checked');
        if (sponsorChecked) quoteSelectionsOwn.sponsor = sponsorChecked.value;
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
    let designText = quoteSelectionsOwn.design === 'Custom' || quoteSelectionsOwn.design === 'For Your Own Design' ? 'Use My Own Design' : `#${quoteSelectionsOwn.design}`;
    if (quoteSelectionsOwn.alterDesign === 'Yes') designText += ' (Alter Mockup)';

    // Format quantity text
    const qtyText = quoteSelectionsOwn.quantity === "Not Sure Yet" ? "Not Sure Yet" : `${quoteSelectionsOwn.quantity} pieces`;

    const message = `Hi ThirtyOne Lab! I'm interested in ordering:

Design: ${designText}
Quantity: ${qtyText}
Material: ${quoteSelectionsOwn.material}
Cutting: ${quoteSelectionsOwn.cutting}
Neck/Collar: ${quoteSelectionsOwn.neck}
Sleeve: ${quoteSelectionsOwn.sleeve}
Nameset: ${quoteSelectionsOwn.nameset}
Sponsor: ${quoteSelectionsOwn.sponsor}

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

function updateSleeveOwnState(event) {
    if (!sleeveOwnShortAll) return; // safety

    // Uncheck quantity "Not sure yet" if Short or Long Sleeve "All" is selected
    if (sleeveOwnShortAll.checked || (sleeveOwnLongAll && sleeveOwnLongAll.checked)) {
        const qtyNotSure = document.getElementById('qbOwnQuantityNotSure');
        if (qtyNotSure && qtyNotSure.checked) {
            qtyNotSure.checked = false;
            const qtyInput = document.getElementById('qbOwnQuantity');
            qtyInput.disabled = false;
            qtyInput.style.opacity = '';
        }
    }

    // Handle mutual exclusivity of options
    if (sleeveOwnShortAll.checked && event && (event.target === sleeveOwnShortAll || event.target.name === 'sleeveOwnShortOpt')) {
        if (sleeveOwnLongAll) sleeveOwnLongAll.checked = false;
        if (sleeveOwnLongFill) sleeveOwnLongFill.checked = false;
    } else if (sleeveOwnLongAll && sleeveOwnLongAll.checked && event && (event.target === sleeveOwnLongAll || event.target.name === 'sleeveOwnLongOpt')) {
        sleeveOwnShortAll.checked = false;
        sleeveOwnShortFill.checked = false;
    } else if (sleeveOwnShortFill.checked && event && event.target === sleeveOwnShortFill) {
        if (sleeveOwnLongFill) sleeveOwnLongFill.checked = true;
        if (sleeveOwnLongAll) sleeveOwnLongAll.checked = false;
    } else if (sleeveOwnLongFill && sleeveOwnLongFill.checked && event && event.target === sleeveOwnLongFill) {
        sleeveOwnShortFill.checked = true;
        sleeveOwnShortAll.checked = false;
    }

    if (sleeveOwnShortAll.checked) {
        sleeveOwnShortQty.disabled = true;
        sleeveOwnShortQty.value = '';

        if (sleeveOwnLongAll) sleeveOwnLongAll.checked = false;
        if (sleeveOwnLongFill) sleeveOwnLongFill.checked = false;
        if (sleeveOwnLongQty) {
            sleeveOwnLongQty.disabled = true;
            sleeveOwnLongQty.value = '';
        }
    } else if (sleeveOwnLongAll && sleeveOwnLongAll.checked) {
        if (sleeveOwnLongQty) {
            sleeveOwnLongQty.disabled = true;
            sleeveOwnLongQty.value = '';
        }

        sleeveOwnShortAll.checked = false;
        sleeveOwnShortFill.checked = false;
        sleeveOwnShortQty.disabled = true;
        sleeveOwnShortQty.value = '';
    } else {
        // Both are Fill in
        sleeveOwnShortQty.disabled = !sleeveOwnShortFill.checked;
        if (!sleeveOwnShortFill.checked) sleeveOwnShortQty.value = '';

        if (sleeveOwnLongQty && sleeveOwnLongFill) {
            sleeveOwnLongQty.disabled = !sleeveOwnLongFill.checked;
            if (!sleeveOwnLongFill.checked) sleeveOwnLongQty.value = '';
        }
    }
}

document.querySelectorAll('input[name="sleeveOwnShortOpt"], input[name="sleeveOwnLongOpt"]').forEach(radio => {
    radio.addEventListener('change', updateSleeveOwnState);
});
if (sleeveOwnShortAll) updateSleeveOwnState();