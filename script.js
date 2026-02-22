(function() {
    const API_URL = "/api/services";
    const WHATSAPP_NUMBER = "919633605648";

    let groupedServices = {};
    let allServices = [];
    let categoriesList = [];
    let selectedServiceData = null;

    const elements = {
        categoryTrigger: document.getElementById('categoryTrigger'),
        categoryMenu: document.getElementById('categoryMenu'),
        selectedCategoryText: document.getElementById('selectedCategoryText'),
        serviceTrigger: document.getElementById('serviceTrigger'),
        serviceMenu: document.getElementById('serviceMenu'),
        selectedServiceText: document.getElementById('selectedServiceText'),
        detailCard: document.getElementById('serviceDetailCard'),
        orderBox: document.getElementById('orderBox'),
        quantityInput: document.getElementById('quantityInput'),
        totalPriceDiv: document.getElementById('totalPrice'),
        linkInput: document.getElementById('linkInput'),
        searchInput: document.getElementById('searchInput')
    };

    const excludedKeywords = ['telegram', 'twitter', 'tiktok', 'facebook', 'fb.', 'private'];

    // --- Helpers ---
    const isExcluded = (name) => excludedKeywords.some(key => name?.toLowerCase().includes(key));
    
    const hideMenus = () => {
        elements.categoryMenu.classList.remove('show');
        elements.serviceMenu.classList.remove('show');
    };

    // --- Core Logic ---
    async function fetchServices() {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            allServices = data.filter(s => !isExcluded(s.category));
            
            allServices.forEach(s => {
                const cat = s.category || "Other";
                if (!groupedServices[cat]) groupedServices[cat] = [];
                groupedServices[cat].push(s);
            });

            categoriesList = Object.keys(groupedServices).sort();
        } catch (err) { console.error("API Error:", err); }
    }

    function populateCategories() {
        elements.categoryMenu.innerHTML = categoriesList.map(cat => `
            <div class="dropdown-item" onclick="selectCategory('${cat}')">
                <i class="fas fa-folder"></i> <span>${cat}</span>
            </div>
        `).join('');
    }

    window.selectCategory = (cat) => {
        elements.selectedCategoryText.innerText = cat;
        elements.serviceTrigger.classList.remove('disabled');
        renderServices(groupedServices[cat]);
        hideMenus();
    };

    function renderServices(services) {
        elements.serviceMenu.innerHTML = services.map(s => {
            const price = (parseFloat(s.rate) * 1.45).toFixed(2);
            return `
                <div class="dropdown-item" onclick="selectService(${s.service})">
                    <span class="service-inline-id">#${s.service}</span>
                    <span class="service-name-custom">${s.name}</span>
                    <span class="service-inline-price">₹${price}</span>
                </div>
            `;
        }).join('');
    }

    window.selectService = (id) => {
        const service = allServices.find(s => s.service == id);
        selectedServiceData = service;
        elements.selectedServiceText.innerText = `#${id} ${service.name.substring(0, 20)}...`;
        
        document.getElementById('detailServiceName').innerText = service.name;
        document.getElementById('descriptionText').innerText = service.description || "No info.";
        elements.detailCard.classList.remove('hidden');
        elements.orderBox.classList.remove('hidden');
        hideMenus();
    };

    // --- Events ---
    elements.categoryTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        populateCategories();
        elements.categoryMenu.classList.toggle('show');
    });

    elements.quantityInput.addEventListener('input', () => {
        if (!selectedServiceData) return;
        const qty = parseInt(elements.quantityInput.value) || 0;
        const price = (parseFloat(selectedServiceData.rate) * 1.45 / 1000 * qty).toFixed(2);
        elements.totalPriceDiv.innerHTML = `₹ ${price}<small>total</small>`;
    });

    document.getElementById('purchaseBtn').addEventListener('click', () => {
        const qty = elements.quantityInput.value;
        const link = elements.linkInput.value;
        if (!qty || !link) return alert("Fill all fields");

        const msg = `Order ID: ${selectedServiceData.service}\nQty: ${qty}\nLink: ${link}`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
    });

    document.addEventListener('click', hideMenus);
    fetchServices();
})();
