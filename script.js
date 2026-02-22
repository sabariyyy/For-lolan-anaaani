// JavaScript - Separated from HTML
(function() {
    // Vercel API endpoint
    const API_URL = "/api/services";

    // WhatsApp number
    const WHATSAPP_NUMBER = "919633605648";

    // Store all services after filtering
    let groupedServices = {};
    let selectedServiceData = null;
    let categoriesList = [];

    // DOM elements
    const categoryTrigger = document.getElementById('categoryTrigger');
    const categoryMenu = document.getElementById('categoryMenu');
    const selectedCategoryText = document.getElementById('selectedCategoryText');
    const serviceTrigger = document.getElementById('serviceTrigger');
    const serviceMenu = document.getElementById('serviceMenu');
    const selectedServiceText = document.getElementById('selectedServiceText');
    
    const detailCard = document.getElementById('serviceDetailCard');
    const detailServiceName = document.getElementById('detailServiceName');
    const detailServiceId = document.getElementById('detailServiceId');
    const descriptionText = document.getElementById('descriptionText');
    const minOrderSpan = document.getElementById('minOrder');
    const maxOrderSpan = document.getElementById('maxOrder');
    const quantityInput = document.getElementById('quantityInput');
    const totalPriceDiv = document.getElementById('totalPrice');
    const orderBox = document.getElementById('orderBox');

    const linkInput = document.getElementById('linkInput');
    const addLinkBtn = document.getElementById('addLinkBtn');
    const purchaseBtn = document.getElementById('purchaseBtn');
    const searchInput = document.getElementById('searchInput');
    
    // Store all services for searching (after filtering)
    let allServices = [];

    // Categories to filter out - including TikTok
    const excludedCategoryKeywords = [
        // Telegram variations
        'telegram', '𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦', 'teligram', 'tele gram', 'telegram',
        // Twitter variations
        'twitter', '𝐓𝐰𝐢𝐭𝐭𝐞𝐫', 'x (twitter)', 'x twitter', 'x.com', 'tweet',
        // TikTok variations
        'tiktok', '𝐓𝐢𝐤𝐭𝐨𝐤', 'tik tok', 'tick tock', 'tiktok', '𝐓𝐢𝐤𝐓𝐨𝐤', 'private',
        // Facebook variations
        'facebook', '𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤', 'fb', 'meta', 'face book', 'fb.'
    ];

    function hideAllMenus() {
        categoryMenu.classList.remove('show');
        serviceMenu.classList.remove('show');
    }

    document.addEventListener('click', () => hideAllMenus());

    categoryTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShow = categoryMenu.classList.contains('show');
        hideAllMenus();
        if (!isShow) {
            populateCategoryMenu();
            categoryMenu.classList.add('show');
        }
    });

    serviceTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (serviceTrigger.classList.contains('disabled')) return;
        const isShow = serviceMenu.classList.contains('show');
        hideAllMenus();
        if (!isShow) {
            serviceMenu.classList.add('show');
        }
    });

    // Check if category should be excluded
    function isCategoryExcluded(categoryName) {
        if (!categoryName) return false;
        const lowerName = categoryName.toLowerCase();
        
        // Direct check against keywords
        return excludedCategoryKeywords.some(keyword => {
            const lowerKeyword = keyword.toLowerCase();
            // Check if the category name contains the keyword (case insensitive)
            return lowerName.includes(lowerKeyword) || 
                   // Also check for exact matches with special characters
                   categoryName.includes(keyword);
        });
    }

    // Get category priority (1 = Offers, 2 = Followers, 3 = Likes, 999 = others)
    function getCategoryPriority(categoryName) {
        if (!categoryName) return 999;
        const lowerName = categoryName.toLowerCase();
        
        // Priority 1: Offers (including special characters)
        if (lowerName.includes('offer') || 
            categoryName.includes('𝐎𝐟𝐟𝐞𝐫𝐬') ||
            lowerName.includes('offers') || 
            lowerName.includes('deal') ||
            lowerName.includes('package') ||
            lowerName.includes('special')) {
            return 1;
        }
        
        // Priority 2: Followers (including special characters)
        if (lowerName.includes('follower') || 
            categoryName.includes('𝐅𝐨𝐥𝐥𝐨𝐰𝐞𝐫𝐬') ||
            lowerName.includes('followers') || 
            lowerName.includes('subscriber') ||
            lowerName.includes('fans')) {
            return 2;
        }
        
        // Priority 3: Likes (including special characters)
        if (lowerName.includes('like') || 
            categoryName.includes('𝐋𝐢𝐤𝐞𝐬') ||
            lowerName.includes('likes') || 
            lowerName.includes('heart') ||
            lowerName.includes('favorite')) {
            return 3;
        }
        
        return 999;
    }

    // Build category menu with priority order: Offers > Followers > Likes > others
    function populateCategoryMenu() {
        categoryMenu.innerHTML = '';
        
        // Filter out excluded categories
        const filteredCategories = categoriesList.filter(cat => !isCategoryExcluded(cat));
        
        if (filteredCategories.length === 0) {
            categoryMenu.innerHTML = '<div class="dropdown-item">no categories available</div>';
            return;
        }

        // Sort categories by priority, then alphabetically
        const sorted = [...filteredCategories].sort((a, b) => {
            const priorityA = getCategoryPriority(a);
            const priorityB = getCategoryPriority(b);
            
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            return a.localeCompare(b);
        });

        sorted.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerHTML = `<i class="fas fa-folder" style="color:#aaa;"></i> <span>${cat}</span>`;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedCategoryText.innerText = cat;
                hideAllMenus();
                loadServicesForCategory(cat);
            });
            categoryMenu.appendChild(item);
        });
    }

    // Service priority function (for internal sorting within a category)
    function getServicePriority(serviceName) {
        const name = serviceName?.toLowerCase() || '';
        
        // Priority 1: Offers
        if (name.includes('offer') || name.includes('offers') || name.includes('special') || name.includes('deal') || name.includes('package')) {
            return 1;
        }
        
        // Priority 2: Followers
        if (name.includes('follower') || name.includes('followers') || name.includes('subscriber') || name.includes('fans')) {
            return 2;
        }
        
        // Priority 3: Likes
        if (name.includes('like') || name.includes('likes') || name.includes('heart') || name.includes('favorite')) {
            return 3;
        }
        
        return 999;
    }

    // Load services for category with custom priority order
    function loadServicesForCategory(category) {
        const services = groupedServices[category] || [];
        serviceTrigger.classList.remove('disabled');
        selectedServiceText.innerText = 'SELECT SERVICE';
        detailCard.classList.add('hidden');
        orderBox.classList.add('hidden');
        selectedServiceData = null;

        serviceMenu.innerHTML = '';
        if (services.length === 0) {
            serviceMenu.innerHTML = '<div class="dropdown-item">no services</div>';
            return;
        }

        // Sort services by custom priority first, then by rate
        const sortedServices = [...services].sort((a, b) => {
            const priorityA = getServicePriority(a.name);
            const priorityB = getServicePriority(b.name);
            
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            
            // If same priority, sort by rate (low to high)
            const rateA = parseFloat(a.rate) || 0;
            const rateB = parseFloat(b.rate) || 0;
            return rateA - rateB;
        });

        sortedServices.forEach(service => {
            const originalRate = parseFloat(service.rate) || 0;
            const finalRate = (originalRate * 1.45).toFixed(2);

            const item = document.createElement('div');
            item.className = 'dropdown-item';

            const textWrapper = document.createElement('span');
            textWrapper.style.display = 'inline';
            textWrapper.style.whiteSpace = 'normal';

            const idSpan = document.createElement('span');
            idSpan.className = 'service-inline-id';
            idSpan.textContent = `#${service.service} `;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'service-name-custom';
            nameSpan.style.display = 'inline';
            nameSpan.textContent = service.name || 'Unnamed';

            const priceSpan = document.createElement('span');
            priceSpan.className = 'service-inline-price';
            priceSpan.textContent = ` ₹ ${finalRate}`;

            textWrapper.appendChild(idSpan);
            textWrapper.appendChild(nameSpan);
            textWrapper.appendChild(priceSpan);

            item.appendChild(textWrapper);
            item.dataset.service = JSON.stringify(service);

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedServiceData = service;
                selectedServiceText.innerText = `#${service.service} ${service.name?.substring(0,20)}...`;
                hideAllMenus();
                displayServiceDetails(service);
            });

            serviceMenu.appendChild(item);
        });
    }

    // Search functionality with same priority order
    function performSearch(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            serviceTrigger.classList.add('disabled');
            selectedServiceText.innerText = 'select category first';
            detailCard.classList.add('hidden');
            orderBox.classList.add('hidden');
            selectedServiceData = null;
            return;
        }

        searchTerm = searchTerm.toLowerCase().trim();
        
        // Filter all services, but also filter out services from excluded categories
        const filteredServices = allServices.filter(service => {
            // Skip if category is excluded
            if (isCategoryExcluded(service.category)) return false;
            
            const nameMatch = service.name?.toLowerCase().includes(searchTerm) || false;
            const idMatch = service.service?.toString().includes(searchTerm) || false;
            const categoryMatch = service.category?.toLowerCase().includes(searchTerm) || false;
            return nameMatch || idMatch || categoryMatch;
        });

        if (filteredServices.length === 0) {
            serviceTrigger.classList.remove('disabled');
            selectedServiceText.innerText = 'no results found';
            serviceMenu.innerHTML = '<div class="dropdown-item">no matching services</div>';
            return;
        }

        // Sort filtered services by custom priority first, then by rate
        const sortedFiltered = [...filteredServices].sort((a, b) => {
            const priorityA = getServicePriority(a.name);
            const priorityB = getServicePriority(b.name);
            
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            
            const rateA = parseFloat(a.rate) || 0;
            const rateB = parseFloat(b.rate) || 0;
            return rateA - rateB;
        });

        serviceTrigger.classList.remove('disabled');
        selectedServiceText.innerText = 'search results';
        detailCard.classList.add('hidden');
        orderBox.classList.add('hidden');
        selectedServiceData = null;

        serviceMenu.innerHTML = '';
        
        sortedFiltered.forEach(service => {
            const originalRate = parseFloat(service.rate) || 0;
            const finalRate = (originalRate * 1.45).toFixed(2);

            const item = document.createElement('div');
            item.className = 'dropdown-item';

            const textWrapper = document.createElement('span');
            textWrapper.style.display = 'inline';
            textWrapper.style.whiteSpace = 'normal';

            const idSpan = document.createElement('span');
            idSpan.className = 'service-inline-id';
            idSpan.textContent = `#${service.service} `;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'service-name-custom';
            nameSpan.style.display = 'inline';
            nameSpan.textContent = service.name || 'Unnamed';

            const priceSpan = document.createElement('span');
            priceSpan.className = 'service-inline-price';
            priceSpan.textContent = ` ₹ ${finalRate}`;

            // Add category indicator for search results
            const categorySpan = document.createElement('span');
            categorySpan.style.color = '#888888';
            categorySpan.style.fontSize = '0.8rem';
            categorySpan.style.marginLeft = '8px';
            categorySpan.textContent = `[${service.category || 'Uncategorized'}]`;

            textWrapper.appendChild(idSpan);
            textWrapper.appendChild(nameSpan);
            textWrapper.appendChild(priceSpan);
            textWrapper.appendChild(categorySpan);

            item.appendChild(textWrapper);
            item.dataset.service = JSON.stringify(service);

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedServiceData = service;
                selectedServiceText.innerText = `#${service.service} ${service.name?.substring(0,20)}...`;
                hideAllMenus();
                displayServiceDetails(service);
            });

            serviceMenu.appendChild(item);
        });
    }

    // Debounced search
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(this.value);
        }, 300);
    });

    function displayServiceDetails(service) {
        detailServiceName.textContent = service.name || 'Service';
        detailServiceId.textContent = `ID ${service.service}`;
        descriptionText.textContent = service.description || 'No description provided.';
        minOrderSpan.textContent = service.min || '0';
        maxOrderSpan.textContent = service.max || '0';

        detailCard.classList.remove('hidden');
        orderBox.classList.remove('hidden');
        quantityInput.value = '';
        totalPriceDiv.innerHTML = '₹ 0.00<small>total</small>';
        linkInput.value = '';
    }

    quantityInput.addEventListener('input', function() {
        if (!selectedServiceData) {
            totalPriceDiv.innerHTML = '₹ 0.00<small>total</small>';
            return;
        }
        const qty = parseInt(this.value, 10);
        if (!qty || qty < 0) {
            totalPriceDiv.innerHTML = '₹ 0.00<small>total</small>';
            return;
        }
        const originalRate = parseFloat(selectedServiceData.rate) || 0;
        const finalRate = originalRate * 1.45;
        const total = (finalRate / 1000) * qty;
        totalPriceDiv.innerHTML = `₹ ${total.toFixed(2)}<small>total</small>`;
    });

    addLinkBtn.addEventListener('click', function() {
        if (linkInput.value.trim() !== '') {
            alert('✅ Link added: ' + linkInput.value);
        } else {
            alert('⚠️ Please paste a link first.');
        }
    });

    purchaseBtn.addEventListener('click', function() {
        if (!selectedServiceData) {
            alert('Please select a service first.');
            return;
        }
        const qty = parseInt(quantityInput.value, 10);
        if (!qty || qty <= 0) {
            alert('Enter a valid quantity.');
            return;
        }
        const link = linkInput.value.trim();
        if (!link) {
            alert('Please enter a profile or post link.');
            return;
        }

        const serviceId = selectedServiceData.service;
        const serviceName = selectedServiceData.name || 'Unnamed';
        const price = (parseFloat(selectedServiceData.rate) * 1.45 / 1000 * qty).toFixed(2);
        const message = `New order:%0A🔹 Service ID: ${serviceId}%0A🔹 Quantity: ${qty}%0A🔹 Link: ${link}%0A🔹 Price: ₹ ${price}`;
        
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    });

    // Fetch services from Vercel API and filter out unwanted categories
    async function fetchServices() {
        try {
            const response = await fetch(API_URL);
            const services = await response.json();
            if (!Array.isArray(services)) {
                console.warn("API did not return an array.");
                return;
            }

            // First, filter out services that belong to excluded categories
            const filteredServices = services.filter(service => !isCategoryExcluded(service.category));
            
            // Store filtered services for search
            allServices = filteredServices;

            // Group the filtered services by category
            filteredServices.forEach(service => {
                const cat = service.category || "Uncategorized";
                if (!groupedServices[cat]) groupedServices[cat] = [];
                groupedServices[cat].push(service);
            });

            // Get unique categories from filtered services
            categoriesList = Object.keys(groupedServices).sort();
            
            // Populate the category menu (with priority sorting)
            populateCategoryMenu();
            
            console.log(`Filtered out ${services.length - filteredServices.length} services from excluded categories`);
        } catch (err) {
            console.error("Fetch from Vercel API failed.", err);
        }
    }

    fetchServices();
    serviceTrigger.classList.add('disabled');
})();
