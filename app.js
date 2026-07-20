// Configuration State
let quoteSelections = {
    design: null,
    alterDesign: 'No',
    quantity: null,
    material: null,
    cutting: null,
    sleeve: null,
    nameset: 'No',
    neck: null
};
let currentQuoteStep = 1;

// Init Quote Builder using configData from config.js
initQuoteBuilder();

// Catalog State
const cardsPerPage = 16;
const catalogGrid = document.getElementById('catalogGrid');
if (typeof catalogHTML !== 'undefined') {
    catalogGrid.innerHTML = catalogHTML;
}

const allCards2026 = Array.from(catalogGrid.getElementsByClassName('prod-2026'));
const allCardsWC = Array.from(catalogGrid.getElementsByClassName('prod-wc'));
const allCardsMaterial = Array.from(catalogGrid.getElementsByClassName('prod-material'));
const allCardsNeck = Array.from(catalogGrid.getElementsByClassName('prod-neck'));
const allCardsNameset = Array.from(catalogGrid.getElementsByClassName('prod-nameset'));
const allCardsSponsor = Array.from(catalogGrid.getElementsByClassName('prod-sponsor'));
const allCardsSizeShirt = Array.from(catalogGrid.getElementsByClassName('prod-sizechart-shirt'));
const allCardsSizePants = Array.from(catalogGrid.getElementsByClassName('prod-sizechart-pants'));
const allCardsSizeMuslimah = Array.from(catalogGrid.getElementsByClassName('prod-sizechart-muslimah'));
const allCardsPlacement = Array.from(catalogGrid.getElementsByClassName('prod-placementguide'));

let currentEdition = localStorage.getItem('lastEdition') || '2026';
let currentPage = parseInt(localStorage.getItem('lastPage')) || 1;
let currentCards = allCards2026;

// Auto-derive Reference Numbers
function initReferenceNumbers() {
    const allCards = catalogGrid.querySelectorAll('.product-card');
    allCards.forEach(card => {
        if (card.classList.contains('prod-2026') || card.classList.contains('prod-wc')) {
            const img = card.querySelector('img');
            if (img && img.src) {
                const decodedSrc = decodeURIComponent(img.src);
                
                if (decodedSrc.includes('For Your Own Design')) {
                    const refNumber = 'For Your Own Design';
                    card.setAttribute('data-ref', refNumber);

                    const refBadge = document.createElement('span');
                    refBadge.className = 'ref-number-badge';
                    refBadge.innerText = refNumber;
                    card.querySelector('.image-container').appendChild(refBadge);
                } else {
                    const match = decodedSrc.match(/\((\d+)\)/);
                    if (match && match[1]) {
                        const refNumber = match[1];
                        card.setAttribute('data-ref', refNumber);

                        const refBadge = document.createElement('span');
                        refBadge.className = 'ref-number-badge';
                        refBadge.innerText = `#${refNumber}`;
                        card.querySelector('.image-container').appendChild(refBadge);
                    }
                }
            }
        } else if (card.classList.contains('prod-material')) {
            const img = card.querySelector('img');
            if (img && img.src) {
                // Extract filename without extension
                const fileNameMatch = img.src.match(/([^\/]+)(?=\.\w+$)/);
                if (fileNameMatch && fileNameMatch[1]) {
                    const refName = decodeURIComponent(fileNameMatch[1]);
                    card.setAttribute('data-ref', refName);

                    const refBadge = document.createElement('span');
                    refBadge.className = 'ref-number-badge';
                    refBadge.innerText = refName;

                    // Look for image container to append badge
                    const imgContainer = card.querySelector('.image-container, .placementguide-image-block');
                    if (imgContainer) {
                        imgContainer.appendChild(refBadge);
                    }
                }
            }
        }
    });
}
initReferenceNumbers();

function updateCurrentCards(edition) {
    switch (edition) {
        case '2026': currentCards = allCards2026; break;
        case 'worldcup': currentCards = allCardsWC; break;
        case 'material': currentCards = allCardsMaterial; break;
        case 'neck': currentCards = allCardsNeck; break;
        case 'nameset': currentCards = allCardsNameset; break;
        case 'sponsor': currentCards = allCardsSponsor; break;
        case 'sizechart-shirt': currentCards = allCardsSizeShirt; break;
        case 'sizechart-pants': currentCards = allCardsSizePants; break;
        case 'sizechart-muslimah': currentCards = allCardsSizeMuslimah; break;
        case 'placementguide': currentCards = allCardsPlacement; break;
        default: currentCards = allCards2026;
    }
}

function displayPage(page, shouldScroll = true) {
    const totalPages = Math.ceil(currentCards.length / cardsPerPage);
    if (page > totalPages && totalPages > 0) {
        page = totalPages;
    }

    currentPage = page;
    localStorage.setItem('lastPage', page);
    const start = (page - 1) * cardsPerPage;
    const end = start + cardsPerPage;

    Array.from(catalogGrid.getElementsByClassName('product-card')).forEach(card => card.style.display = 'none');
    catalogGrid.classList.remove('grid-nameset-layout', 'grid-sponsor-layout', 'grid-sizechart-layout', 'grid-neck-layout', 'grid-material-layout', 'grid-placementguide-layout');
    document.getElementById('sponsorDisclaimer').style.display = 'none';

    let isCustomLayout = false;
    if (currentEdition === 'nameset') { catalogGrid.classList.add('grid-nameset-layout'); isCustomLayout = true; }
    else if (currentEdition === 'sponsor') { catalogGrid.classList.add('grid-sponsor-layout'); document.getElementById('sponsorDisclaimer').style.display = 'block'; isCustomLayout = true; }
    else if (currentEdition.startsWith('sizechart')) { catalogGrid.classList.add('grid-sizechart-layout'); isCustomLayout = true; }
    else if (currentEdition === 'neck') { catalogGrid.classList.add('grid-neck-layout'); isCustomLayout = true; }
    else if (currentEdition === 'material') { catalogGrid.classList.add('grid-material-layout'); isCustomLayout = true; }
    else if (currentEdition === 'placementguide') { catalogGrid.classList.add('grid-placementguide-layout'); isCustomLayout = true; }

    if (isCustomLayout) {
        currentCards.forEach(card => card.style.display = 'block');
        document.getElementById('paginationContainer').innerHTML = '';
    } else {
        currentCards.forEach((card, index) => {
            if (index >= start && index < end) card.style.display = 'block';
        });
        setupPaginationButtons();
    }

    if (shouldScroll) {
        let scrollOffset = 150;

        if (currentEdition === 'sizechart-shirt' || currentEdition === 'sizechart-pants' || currentEdition === 'sizechart-muslimah' || currentEdition === 'placementguide' || currentEdition === 'nameset') {
            scrollOffset = 200;
        }
        else if (currentEdition === 'sponsor') {
            scrollOffset = 235;
        }

        window.scrollTo({ top: catalogGrid.offsetTop - scrollOffset, behavior: 'smooth' });
    }
}

function setupPaginationButtons() {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(currentCards.length / cardsPerPage);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.classList.add('page-btn');
        if (i === currentPage) button.classList.add('active');
        button.addEventListener('click', () => displayPage(i, true));
        paginationContainer.appendChild(button);
    }
}

function switchEdition(edition) {
    currentEdition = edition;
    localStorage.setItem('lastEdition', edition);

    const allEditionBtns = document.querySelectorAll('.edition-btn, .spec-btn, .sub-spec-btn');
    allEditionBtns.forEach(btn => btn.classList.remove('active'));

    if (edition === '2026') document.getElementById('btn2026').classList.add('active');
    else if (edition === 'worldcup') document.getElementById('btnWC').classList.add('active');
    else if (edition === 'material') document.getElementById('btnMaterial').classList.add('active');
    else if (edition === 'neck') document.getElementById('btnNeck').classList.add('active');

    if (edition === 'nameset' || edition === 'sponsor' || edition === 'placementguide') {
        document.getElementById('btnPrinting').classList.add('active');
        document.getElementById('printingSubMenu').classList.add('active');

        if (edition === 'nameset') document.getElementById('btnNameset').classList.add('active');
        if (edition === 'sponsor') document.getElementById('btnSponsor').classList.add('active');
        if (edition === 'placementguide') document.getElementById('btnPlacementGuide').classList.add('active');
    } else {
        document.getElementById('printingSubMenu').classList.remove('active');
    }

    if (edition === 'sizechart-shirt') {
        document.getElementById('btnSizeChart').classList.add('active');
        document.getElementById('sizeChartSubMenu').classList.add('active');
        document.getElementById('btnSizeShirt').classList.add('active');
    } else if (edition === 'sizechart-pants') {
        document.getElementById('btnSizeChart').classList.add('active');
        document.getElementById('sizeChartSubMenu').classList.add('active');
        document.getElementById('btnSizePants').classList.add('active');
    } else if (edition === 'sizechart-muslimah') {
        document.getElementById('btnSizeChart').classList.add('active');
        document.getElementById('sizeChartSubMenu').classList.add('active');
        document.getElementById('btnSizeMuslimah').classList.add('active');
    } else if (!edition.startsWith('sizechart')) {
        document.getElementById('sizeChartSubMenu').classList.remove('active');
    }

    updateCurrentCards(edition);
    displayPage(1, true);
}

function togglePrintingSubMenu() {
    const subMenu = document.getElementById('printingSubMenu');
    const mainBtn = document.getElementById('btnPrinting');

    subMenu.classList.toggle('active');
    mainBtn.classList.toggle('active');

    if (subMenu.classList.contains('active')) {
        switchEdition('nameset');
    }
}

function toggleSizeChartSubMenu() {
    const subMenu = document.getElementById('sizeChartSubMenu');
    const mainBtn = document.getElementById('btnSizeChart');

    subMenu.classList.toggle('active');
    mainBtn.classList.toggle('active');

    if (subMenu.classList.contains('active')) {
        switchEdition('sizechart-shirt');
    }
}

// Lightbox & Quote Builder Interactivity
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg = document.getElementById('lightboxImg');
const quoteBuilderModal = document.getElementById('quoteBuilderModal');
let currentRefNumber = null;

catalogGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;

    // Block popup for nameset, sponsor, neck
    if (card.classList.contains('prod-nameset') ||
        card.classList.contains('prod-sponsor') ||
        card.classList.contains('prod-neck')) {
        return;
    }

    const isSizeChartOrMaterial = card.classList.contains('prod-sizechart-shirt') ||
        card.classList.contains('prod-sizechart-pants') ||
        card.classList.contains('prod-sizechart-muslimah') ||
        card.classList.contains('prod-material') ||
        card.classList.contains('prod-placementguide');

    // Get image from appropriate container
    const imgs = Array.from(card.querySelectorAll('.image-container img, .sizechart-image-block img, .neck-image-block img, .sponsor-image-block img, .nameset-image-block img, .placementguide-image-block img'));
    if (imgs.length === 0) return;

    lightboxImg.src = imgs[0].src;

    // Show/hide action buttons based on card type
    const actionContainer = document.querySelector('.lightbox-action-container');
    if (isSizeChartOrMaterial) {
        actionContainer.style.display = 'none';
    } else {
        actionContainer.style.display = '';
        currentRefNumber = card.getAttribute('data-ref');
        document.getElementById('lightboxRefDisplay').innerText = `Design #${currentRefNumber}`;
    }

    lightboxOverlay.classList.add('active');
    document.body.classList.add('no-scroll');
});

function closeLightbox() {
    const content = document.querySelector('.lightbox-content');
    const navPrev = document.getElementById('lightboxPrev');
    const navNext = document.getElementById('lightboxNext');

    // Hide content immediately to prevent flash
    content.style.opacity = '0';
    navPrev.style.opacity = '0';
    navNext.style.opacity = '0';

    lightboxOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');

    // Reset after fade-out completes (300ms)
    setTimeout(() => {
        lightboxImg.src = '';
        document.querySelector('.lightbox-action-container').style.display = '';
        content.style.opacity = '';
        navPrev.style.opacity = '';
        navNext.style.opacity = '';
    }, 300);
}

document.getElementById('lightboxClose').addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
});

lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
        closeLightbox();
    }
});


document.getElementById('openQuoteBuilderBtn').addEventListener('click', () => {
    lightboxOverlay.classList.remove('active');
    if (currentRefNumber === 'For Your Own Design') {
        quoteSelectionsOwn.design = currentRefNumber;
        openQuoteBuilderOwn();
    } else {
        quoteSelections.design = currentRefNumber;
        openQuoteBuilder();
    }
});



function openQuoteBuilder() {
    quoteBuilderModal.classList.add('active');
    document.body.classList.add('no-scroll');
    currentQuoteStep = 1;
    updateQuoteStep();
}

document.getElementById('quoteBuilderClose').addEventListener('click', () => {
    quoteBuilderModal.classList.remove('active');
    document.body.classList.remove('no-scroll');
});

// Quote Builder Logic
function initQuoteBuilder() {
    // Populate dynamic selects
    document.getElementById('qbQuantity').min = configData.minimumOrderQuantity;
    document.getElementById('qbQuantity').value = configData.minimumOrderQuantity;

    populateSelect('qbMaterial', configData.materials);
    populateSelect('qbCutting', configData.cuttings);
    populateSelect('qbNeck', configData.necks);
}

function populateSelect(id, list) {
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">-- Choose Option --</option>';
    list.forEach(item => {
        select.innerHTML += `<option value="${item.label}">${item.label}</option>`;
    });
}

function updateQuoteStep() {
    document.querySelectorAll('.quote-step').forEach(el => el.style.display = 'none');
    document.getElementById(`step${currentQuoteStep}`).style.display = 'block';

    const progressText = currentQuoteStep <= 7 ? `Step ${currentQuoteStep} of 7` : 'Summary';
    document.getElementById('quoteProgress').innerText = progressText;

    if (currentQuoteStep === 8) {
        // Build summary
        let designStr = quoteSelections.design === 'Custom' ? 'Custom Design' : `#${quoteSelections.design}`;
        if (quoteSelections.alterDesign === 'Yes') designStr += ' (Alter Mockup)';

        document.getElementById('summaryDesign').innerText = designStr;
        document.getElementById('summaryQuantity').innerText = quoteSelections.quantity;
        document.getElementById('summaryMaterial').innerText = quoteSelections.material;
        document.getElementById('summaryCutting').innerText = quoteSelections.cutting;
        document.getElementById('summarySleeve').innerText = quoteSelections.sleeve;
        document.getElementById('summaryNameset').innerText = quoteSelections.nameset;
        document.getElementById('summaryNeck').innerText = quoteSelections.neck;
    }
}

function nextStep() {
    if (currentQuoteStep === 1) {
        quoteSelections.alterDesign = document.querySelector('input[name="alterDesign"]:checked').value;
    }
    if (currentQuoteStep === 2) {
        quoteSelections.quantity = document.getElementById('qbQuantity').value;
        if (quoteSelections.quantity < configData.minimumOrderQuantity) {
            alert(`Minimum order is ${configData.minimumOrderQuantity}`); return;
        }
    }
    if (currentQuoteStep === 3) {
        if (!document.getElementById('qbMaterial').value) { alert('Please select material'); return; }
        quoteSelections.material = document.getElementById('qbMaterial').value;
    }
    if (currentQuoteStep === 4) {
        if (!document.getElementById('qbCutting').value) { alert('Please select cutting'); return; }
        quoteSelections.cutting = document.getElementById('qbCutting').value;
    }
    if (currentQuoteStep === 5) {
        const totalQty = parseInt(quoteSelections.quantity);
        if (document.querySelector('input[name="sleeveShortOpt"][value="all"]').checked) {
            quoteSelections.sleeve = "Short Sleeve (All)";
        } else if (document.querySelector('input[name="sleeveLongOpt"][value="all"]').checked) {
            quoteSelections.sleeve = "Long Sleeve (All)";
        } else {
            const sQty = parseInt(document.getElementById('qbSleeveShortQty').value) || 0;
            const lQty = parseInt(document.getElementById('qbSleeveLongQty').value) || 0;

            if (sQty + lQty !== totalQty) {
                document.getElementById('sleeveError').style.display = 'block';
                return;
            }
            document.getElementById('sleeveError').style.display = 'none';

            let sleeveStr = [];
            if (sQty > 0) sleeveStr.push(`Short Sleeve (${sQty})`);
            if (lQty > 0) sleeveStr.push(`Long Sleeve (${lQty})`);
            quoteSelections.sleeve = sleeveStr.join(', ');
        }
    }
    if (currentQuoteStep === 6) {
        quoteSelections.nameset = document.querySelector('input[name="addNameset"]:checked').value;
    }
    if (currentQuoteStep === 7) {
        if (!document.getElementById('qbNeck').value) { alert('Please select neck'); return; }
        quoteSelections.neck = document.getElementById('qbNeck').value;
    }

    currentQuoteStep++;
    updateQuoteStep();
}

function prevStep() {
    if (currentQuoteStep > 1) {
        currentQuoteStep--;
        updateQuoteStep();
    }
}

document.querySelectorAll('.qb-next').forEach((btn) => {
    btn.addEventListener('click', nextStep);
});
document.querySelectorAll('.qb-prev').forEach((btn) => {
    btn.addEventListener('click', prevStep);
});

// WhatsApp Generator
document.getElementById('sendWhatsAppBtn').addEventListener('click', () => {
    let designText = quoteSelections.design === 'Custom' ? 'Custom Design' : `#${quoteSelections.design}`;
    if (quoteSelections.alterDesign === 'Yes') designText += ' (Alter Mockup)';

    const message = `Hi ThirtyOne Lab! I'm interested in ordering:

Design: ${designText}
Quantity: ${quoteSelections.quantity} pieces
Material: ${quoteSelections.material}
Cutting: ${quoteSelections.cutting}
Sleeve: ${quoteSelections.sleeve}
Nameset: ${quoteSelections.nameset}
Neck/Collar: ${quoteSelections.neck}

Could I get a quotation for this order?`;

    const encoded = encodeURIComponent(message);
    const myWhatsAppNumber = "601125614436";
    window.open(`https://wa.me/${myWhatsAppNumber}?text=${encoded}`, '_blank');
});

// Init layout
updateCurrentCards(currentEdition);
displayPage(currentPage, false);

// Sleeve Table Logic
const sleeveShortAll = document.querySelector('input[name="sleeveShortOpt"][value="all"]');
const sleeveShortFill = document.querySelector('input[name="sleeveShortOpt"][value="fill"]');
const sleeveShortQty = document.getElementById('qbSleeveShortQty');

const sleeveLongAll = document.querySelector('input[name="sleeveLongOpt"][value="all"]');
const sleeveLongFill = document.querySelector('input[name="sleeveLongOpt"][value="fill"]');
const sleeveLongQty = document.getElementById('qbSleeveLongQty');

function updateSleeveState() {
    if (sleeveShortAll.checked) {
        sleeveShortQty.disabled = true;
        sleeveShortQty.value = '';
        sleeveLongAll.disabled = true;
        sleeveLongFill.disabled = true;
        sleeveLongQty.disabled = true;
        sleeveLongAll.checked = false;
        sleeveLongFill.checked = false;
        sleeveLongQty.value = '';
    } else if (sleeveLongAll.checked) {
        sleeveLongQty.disabled = true;
        sleeveLongQty.value = '';
        sleeveShortAll.disabled = true;
        sleeveShortFill.disabled = true;
        sleeveShortQty.disabled = true;
        sleeveShortAll.checked = false;
        sleeveShortFill.checked = false;
        sleeveShortQty.value = '';
    } else {
        sleeveShortAll.disabled = false;
        sleeveShortFill.disabled = false;
        sleeveLongAll.disabled = false;
        sleeveLongFill.disabled = false;
        sleeveShortQty.disabled = !sleeveShortFill.checked;
        if (!sleeveShortFill.checked) sleeveShortQty.value = '';
        sleeveLongQty.disabled = !sleeveLongFill.checked;
        if (!sleeveLongFill.checked) sleeveLongQty.value = '';
    }
}

document.querySelectorAll('input[name="sleeveShortOpt"], input[name="sleeveLongOpt"]').forEach(radio => {
    radio.addEventListener('change', updateSleeveState);
});
updateSleeveState();
