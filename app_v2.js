// Configuration State
let quoteSelections = {
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

let currentEdition = '2026';
let currentPage = 1;
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
    const imgs = Array.from(card.querySelectorAll('.image-container img, .sizechart-image-block img, .neck-image-block img, .sponsor-image-block img, .nameset-image-block img, .placementguide-image-block img, .card-image-wrapper img'));
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
    try {
        lightboxOverlay.classList.remove('active');
        if (currentRefNumber === 'For Your Own Design') {
            if (typeof quoteSelectionsOwn === 'undefined') {
                alert('appOwn.js failed to load properly. quoteSelectionsOwn is undefined.');
                return;
            }
            quoteSelectionsOwn.design = currentRefNumber;
            openQuoteBuilderOwn();
        } else {
            quoteSelections.design = currentRefNumber;
            openQuoteBuilder();
        }
    } catch (e) {
        alert("Error opening Quote Builder: " + e.message);
    }
});



// Preview Cards Mapping & Logic
const materialDetailsMap = {
    "Eyelet 165GSM (BEST SELLER)": {
        title: "EYELET",
        image: "Image/Material/Eyelet.png",
        badges: ["Image/Material/Recommend.png", "Image/Material/Hot Sale.png"],
        desc: "Eyelet 160gsm is a lightweight, breathable jersey fabric that dries sweat quickly. Perfect for sports gear with bright, long-lasting printed colors.",
        recommend: "Sports • Corporate • Casual • Uniform • Event"
    },
    "Diamond 160GSM": {
        title: "DIAMOND",
        image: "Image/Material/Diamond.png",
        badges: ["Image/Material/Recommend.png"],
        desc: "Diamond 160gsm is a lightweight, breathable jersey fabric with a stylish diamond texture that wicks sweat quickly. Ideal for activewear, it delivers vivid, long-lasting printed colors while keeping you comfortable and moving freely.",
        recommend: "Sports • Corporate • Casual • Uniform • Event"
    },
    "Lycra 280GSM": {
        title: "LYCRA",
        image: "Image/Material/Lycra.png",
        badges: ["Image/Material/Recommend.png"],
        desc: "Lycra 280gsm is a premium, thicker jersey fabric with extra stretch and great durability. Perfect for formal teamwear, it offers a neat fit and vibrant, long-lasting printed colors that keep their shape over time.",
        recommend: "Sports (Indoor) • Corporate • Casual • Event"
    },
    "Interlock 160GSM": {
        title: "INTERLOCK",
        image: "Image/Material/Interlock.png",
        badges: [],
        desc: "Interlock 160gsm is a smooth, lightweight jersey fabric with great stretch and durability. Perfect for teamwear, it offers comfortable breathability and vibrant, long-lasting printed colors that won't fade or crack.",
        recommend: "Sports • Corporate • Casual • Uniform • Event"
    },
    "Mini Eyelet 165GSM": {
        title: "MINI-EYELET",
        image: "Image/Material/Mini-Eyelet.png",
        badges: [],
        desc: "Mini Eyelet 160gsm is a lightweight, breathable jersey fabric with tiny holes for extra airflow and quick sweat drying. Perfect for sportswear, it offers bright, long-lasting printed colors while remaining soft, durable, and comfortable.",
        recommend: "Sports • Corporate • Casual • Uniform • Event"
    },
    "RJPK 180GSM": {
        title: "RJPK",
        image: "Image/Material/RJPK.png",
        badges: [],
        desc: "RJPK 180gsm is a medium-weight, durable jersey fabric with a structured feel while remaining soft and breathable. Perfect for premium team jerseys, it wicks sweat away and features vibrant, long-lasting printed colors that won't fade or crack.",
        recommend: "Sports • Corporate • Casual • Uniform • Event"
    },
    "Mesh 230GSM": {
        title: "MESH",
        image: "Image/Material/Mesh.png",
        badges: ["Image/Material/Premium.png"],
        desc: "Mesh 230gsm is a durable, thicker jersey fabric with a classic netted texture that provides maximum airflow and ventilation. Perfect for sports jerseys and activewear, it dries sweat quickly and features bright, long-lasting printed colors while keeping you comfortable and cool.",
        recommend: "Sports • Casual • Event"
    },
    "Popcorn 160GSM": {
        title: "POPCORN",
        image: "Image/Material/Popcorn.png",
        badges: ["Image/Material/Premium.png"],
        desc: "Popcorn 160gsm is a lightweight, breathable jersey fabric featuring a unique textured \"popcorn\" knit pattern that promotes airflow and wicks sweat quickly. Ideal for activewear and sports jerseys, it provides a comfortable, soft feel with bright, long-lasting printed colors that won't fade or crack.",
        recommend: "Sports • Corporate • Casual • Uniform • Event"
    }
};

const neckCardMap = {
    "Roundneck": "Image/Neck/Round.png",
    "V-neck": "Image/Neck/V-neck.png",
    "V-Neck End": "Image/Neck/V-neck End.png",
    "Collar Button (Polo)": "Image/Neck/Polo.png",
    "Mandarin Zip": "Image/Neck/Mandarin Zip.png",
    "Retro": "Image/Neck/Retro.png",
    "Retro End": "Image/Neck/Retro End.png",
    "V-neck Outer": "Image/Neck/V-neck Outer.png"
};

function getMaterialData(label) {
    if (!label) return null;
    if (materialDetailsMap[label]) return materialDetailsMap[label];
    const lower = label.toLowerCase();
    if (lower.includes("eyelet") && !lower.includes("mini")) return materialDetailsMap["Eyelet 165GSM (BEST SELLER)"];
    if (lower.includes("diamond")) return materialDetailsMap["Diamond 160GSM"];
    if (lower.includes("lycra")) return materialDetailsMap["Lycra 280GSM"];
    if (lower.includes("interlock")) return materialDetailsMap["Interlock 160GSM"];
    if (lower.includes("mini")) return materialDetailsMap["Mini Eyelet 165GSM"];
    if (lower.includes("rjpk")) return materialDetailsMap["RJPK 180GSM"];
    if (lower.includes("mesh")) return materialDetailsMap["Mesh 230GSM"];
    if (lower.includes("popcorn")) return materialDetailsMap["Popcorn 160GSM"];
    return null;
}

function getNeckCardImg(label) {
    if (!label) return null;
    if (neckCardMap[label]) return neckCardMap[label];
    const lower = label.toLowerCase();
    if (lower.includes("round")) return "Image/Neck/Round.png";
    if (lower.includes("v-neck end") || lower.includes("v-neck-end")) return "Image/Neck/V-neck End.png";
    if (lower.includes("v-neck outer")) return "Image/Neck/V-neck Outer.png";
    if (lower.includes("v-neck") || lower.includes("vneck")) return "Image/Neck/V-neck.png";
    if (lower.includes("polo") || lower.includes("collar")) return "Image/Neck/Polo.png";
    if (lower.includes("mandarin")) return "Image/Neck/Mandarin Zip.png";
    if (lower.includes("retro end")) return "Image/Neck/Retro End.png";
    if (lower.includes("retro")) return "Image/Neck/Retro.png";
    return null;
}

function updateMaterialPreview(containerId, selectedVal) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = getMaterialData(selectedVal);
    if (data) {
        const badgesHtml = data.badges.map(b => `<img src="${b}" alt="badge" class="stat-icon">`).join('');
        container.innerHTML = `
            <div class="product-card prod-material qb-material-card-full">
                <div class="card-image-wrapper">
                    <img src="${data.image}" alt="${data.title}" class="card-image">
                </div>
                <div class="card-content">
                    <div class="header-inline">
                        <h1 class="material-title">${data.title} ${badgesHtml}</h1>
                        <span class="collection-name">${data.desc}</span>
                    </div>
                    <div class="stats-container">
                        <div class="stat-box">
                            <span class="stat-label">Recommend</span>
                            <span class="stat-value">${data.recommend}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

function updateNeckPreview(containerId, selectedVal) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const imgPath = getNeckCardImg(selectedVal);
    if (imgPath) {
        container.innerHTML = `
            <div class="qb-card-preview">
                <img src="${imgPath}" alt="${selectedVal}" class="qb-card-preview-img">
            </div>
        `;
        container.style.display = 'flex';
    } else {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

function openQuoteBuilder() {
    quoteBuilderModal.classList.add('active');
    quoteBuilderModal.scrollTop = 0;
    document.body.classList.add('no-scroll');
    currentQuoteStep = 1;

    // Reset quantity checkbox and state
    document.getElementById('qbQuantityNotSure').checked = false;
    document.getElementById('qbQuantity').disabled = false;
    document.getElementById('qbQuantity').style.opacity = '';
    document.getElementById('qbQuantity').value = configData.minimumOrderQuantity;

    // Reset sleeve state
    document.querySelector('input[name="sleeveShortOpt"][value="all"]').checked = true;
    document.querySelector('input[name="sleeveLongOpt"][value="all"]').checked = false;
    if (typeof updateSleeveState === 'function') updateSleeveState();

    // Reset card previews
    updateMaterialPreview('qbMaterialPreview', '');
    updateNeckPreview('qbNeckPreview', '');

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

    // Bind change listeners for material & neck previews
    document.getElementById('qbMaterial').addEventListener('change', (e) => {
        updateMaterialPreview('qbMaterialPreview', e.target.value);
    });

    document.getElementById('qbNeck').addEventListener('change', (e) => {
        updateNeckPreview('qbNeckPreview', e.target.value);
    });

    // Quantity Not Sure Change Event Listener
    document.getElementById('qbQuantityNotSure').addEventListener('change', (e) => {
        const qtyInput = document.getElementById('qbQuantity');
        if (e.target.checked) {
            qtyInput.disabled = true;
            qtyInput.style.opacity = '0.5';
        } else {
            qtyInput.disabled = false;
            qtyInput.style.opacity = '';
        }
    });

    // Sleeve Not Sure Event Listener is added below where updateSleeveState is defined
}

function populateSelect(id, list) {
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">-- Choose Option --</option>';
    list.forEach(item => {
        select.innerHTML += `<option value="${item.label}">${item.label}</option>`;
    });
}

function updateQuoteStep() {
    document.querySelectorAll('#quoteBuilderModal .quote-step').forEach(el => el.style.display = 'none');
    document.getElementById(`step${currentQuoteStep}`).style.display = 'block';

    const progressText = currentQuoteStep <= 7 ? `Step ${currentQuoteStep} of 7` : 'Summary';
    document.getElementById('quoteProgress').innerText = progressText;

    if (currentQuoteStep === 3) {
        updateMaterialPreview('qbMaterialPreview', document.getElementById('qbMaterial').value);
    } else if (currentQuoteStep === 5) {
        updateNeckPreview('qbNeckPreview', document.getElementById('qbNeck').value);
    }

    if (currentQuoteStep === 8) {
        // Build summary
        let designStr = quoteSelections.design === 'Custom' || quoteSelections.design === 'For Your Own Design' ? 'Use My Own Design' : `#${quoteSelections.design}`;
        if (quoteSelections.alterDesign === 'Yes') designStr += ' (Alter Mockup)';

        document.getElementById('summaryDesign').innerText = designStr;
        document.getElementById('summaryQuantity').innerText = quoteSelections.quantity;
        document.getElementById('summaryMaterial').innerText = quoteSelections.material;
        document.getElementById('summaryCutting').innerText = quoteSelections.cutting;
        document.getElementById('summarySleeve').innerText = quoteSelections.sleeve;
        document.getElementById('summaryNameset').innerText = quoteSelections.nameset;
        document.getElementById('summarySponsor').innerText = quoteSelections.sponsor;
        document.getElementById('summaryNeck').innerText = quoteSelections.neck;
    }
}

function nextStep() {
    if (currentQuoteStep === 1) {
        quoteSelections.alterDesign = document.querySelector('input[name="alterDesign"]:checked').value;
    }
    if (currentQuoteStep === 2) {
        const notSure = document.getElementById('qbQuantityNotSure').checked;
        if (notSure) {
            quoteSelections.quantity = "Not Sure Yet";
        } else {
            quoteSelections.quantity = document.getElementById('qbQuantity').value;
            if (quoteSelections.quantity < configData.minimumOrderQuantity) {
                alert(`Minimum order is ${configData.minimumOrderQuantity}`); return;
            }
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
        if (!document.getElementById('qbNeck').value) { alert('Please select neck'); return; }
        quoteSelections.neck = document.getElementById('qbNeck').value;
    }
    if (currentQuoteStep === 6) {
        const totalQty = parseInt(quoteSelections.quantity);
        if (document.querySelector('input[name="sleeveShortOpt"][value="all"]').checked) {
            quoteSelections.sleeve = "Short Sleeve (All)";
        } else if (document.querySelector('input[name="sleeveLongOpt"][value="all"]').checked) {
            quoteSelections.sleeve = "Long Sleeve (All)";
        } else {
            const sQty = parseInt(document.getElementById('qbSleeveShortQty').value) || 0;
            const lQty = parseInt(document.getElementById('qbSleeveLongQty').value) || 0;

            if (quoteSelections.quantity !== "Not Sure Yet" && sQty + lQty !== totalQty) {
                document.getElementById('sleeveError').style.display = 'block';
                return;
            }
            document.getElementById('sleeveError').style.display = 'none';

            let sleeveStr = [];
            if (sQty > 0) sleeveStr.push(`Short Sleeve (${sQty})`);
            if (lQty > 0) sleeveStr.push(`Long Sleeve (${lQty})`);
            quoteSelections.sleeve = sleeveStr.join(', ') || "No sleeve config selected";
        }
    }
    if (currentQuoteStep === 7) {
        quoteSelections.nameset = document.querySelector('input[name="addNameset"]:checked').value;
        quoteSelections.sponsor = document.querySelector('input[name="addSponsor"]:checked').value;
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
    let designText = quoteSelections.design === 'Custom' || quoteSelections.design === 'For Your Own Design' ? 'Use My Own Design' : `#${quoteSelections.design}`;
    if (quoteSelections.alterDesign === 'Yes') designText += ' (Alter Mockup)';

    // Format quantity text
    const qtyText = quoteSelections.quantity === "Not Sure Yet" ? "Not Sure Yet" : `${quoteSelections.quantity} pieces`;

    const message = `Hi ThirtyOne Lab! I'm interested in ordering:

Design: ${designText}
Quantity: ${qtyText}
Material: ${quoteSelections.material}
Cutting: ${quoteSelections.cutting}
Neck/Collar: ${quoteSelections.neck}
Sleeve: ${quoteSelections.sleeve}
Nameset: ${quoteSelections.nameset}
Sponsor: ${quoteSelections.sponsor}

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

function updateSleeveState(event) {
    // Uncheck quantity "Not sure yet" if Short or Long Sleeve "All" is selected
    if (sleeveShortAll.checked || sleeveLongAll.checked) {
        const qtyNotSure = document.getElementById('qbQuantityNotSure');
        if (qtyNotSure && qtyNotSure.checked) {
            qtyNotSure.checked = false;
            const qtyInput = document.getElementById('qbQuantity');
            qtyInput.disabled = false;
            qtyInput.style.opacity = '';
        }
    }

    // Handle mutual exclusivity of options
    if (sleeveShortAll.checked && event && (event.target === sleeveShortAll || event.target.name === 'sleeveShortOpt')) {
        sleeveLongAll.checked = false;
        sleeveLongFill.checked = false;
    } else if (sleeveLongAll.checked && event && (event.target === sleeveLongAll || event.target.name === 'sleeveLongOpt')) {
        sleeveShortAll.checked = false;
        sleeveShortFill.checked = false;
    } else if (sleeveShortFill.checked && event && event.target === sleeveShortFill) {
        sleeveLongFill.checked = true;
        sleeveLongAll.checked = false;
    } else if (sleeveLongFill.checked && event && event.target === sleeveLongFill) {
        sleeveShortFill.checked = true;
        sleeveShortAll.checked = false;
    }

    if (sleeveShortAll.checked) {
        sleeveShortQty.disabled = true;
        sleeveShortQty.value = '';

        sleeveLongAll.checked = false;
        sleeveLongFill.checked = false;
        sleeveLongQty.disabled = true;
        sleeveLongQty.value = '';
    } else if (sleeveLongAll.checked) {
        sleeveLongQty.disabled = true;
        sleeveLongQty.value = '';

        sleeveShortAll.checked = false;
        sleeveShortFill.checked = false;
        sleeveShortQty.disabled = true;
        sleeveShortQty.value = '';
    } else {
        // Both are Fill in
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

// Image protection (prevent right-click and drag on images except inside lightbox content)
document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName === 'IMG' && !e.target.closest('.lightbox-content')) {
        e.preventDefault();
    }
}, false);

document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG' && !e.target.closest('.lightbox-content')) {
        e.preventDefault();
    }
}, false);

