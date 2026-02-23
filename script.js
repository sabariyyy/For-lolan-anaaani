        (function() {
            const API_URL = "/api/services";
            const WHATSAPP_NUMBER = "919633605648";
            const QR_API_URL = "https://sabari-qr-api.vercel.app/api/upi-qr?amount=";
            const MIN_QR_AMOUNT = 1; // Minimum ₹1 for QR code

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

            // Elements for streamlined flow
            const linkInput = document.getElementById('linkInput');
            const linkError = document.getElementById('linkError');
            const continueBtn = document.getElementById('continueBtn');
            const paymentSection = document.getElementById('paymentSection');
            const qrDisplay = document.getElementById('qrDisplay');
            const utrInput = document.getElementById('utrInput');
            const submitUtrBtn = document.getElementById('submitUtrBtn');
            
            const searchInput = document.getElementById('searchInput');
            
            let allServices = [];
            let currentLink = '';
            let currentAmount = 0;
            let currentPrice = 0;

            const excludedCategoryKeywords = [
                'telegram', '𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦', 'teligram', 'tele gram',
                'twitter', '𝐓𝐰𝐢𝐭𝐭𝐞𝐫', 'x (twitter)', 'x twitter', 'x.com', 'tweet',
                'tiktok', '𝐓𝐢𝐤𝐭𝐨𝐤', 'tik tok', 'tick tock', '𝐓𝐢𝐤𝐓𝐨𝐤', 'private',
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

            function isCategoryExcluded(categoryName) {
                if (!categoryName) return false;
                const lowerName = categoryName.toLowerCase();
                return excludedCategoryKeywords.some(keyword => 
                    lowerName.includes(keyword.toLowerCase()) || categoryName.includes(keyword)
                );
            }

            function getCategoryPriority(categoryName) {
                if (!categoryName) return 999;
                const lowerName = categoryName.toLowerCase();
                
                if (lowerName.includes('offer') || categoryName.includes('𝐎𝐟𝐟𝐞𝐫𝐬') ||
                    lowerName.includes('offers') || lowerName.includes('deal') ||
                    lowerName.includes('package') || lowerName.includes('special')) {
                    return 1;
                }
                
                if (lowerName.includes('follower') || categoryName.includes('𝐅𝐨𝐥𝐥𝐨𝐰𝐞𝐫𝐬') ||
                    lowerName.includes('followers') || lowerName.includes('subscriber') ||
                    lowerName.includes('fans')) {
                    return 2;
                }
                
                if (lowerName.includes('like') || categoryName.includes('𝐋𝐢𝐤𝐞𝐬') ||
                    lowerName.includes('likes') || lowerName.includes('heart') ||
                    lowerName.includes('favorite')) {
                    return 3;
                }
                
                return 999;
            }

            function populateCategoryMenu() {
                categoryMenu.innerHTML = '';
                const filteredCategories = categoriesList.filter(cat => !isCategoryExcluded(cat));
                
                if (filteredCategories.length === 0) {
                    categoryMenu.innerHTML = '<div class="dropdown-item">no categories available</div>';
                    return;
                }

                const sorted = [...filteredCategories].sort((a, b) => {
                    const priorityA = getCategoryPriority(a);
                    const priorityB = getCategoryPriority(b);
                    if (priorityA !== priorityB) return priorityA - priorityB;
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

            function getServicePriority(serviceName) {
                const name = serviceName?.toLowerCase() || '';
                if (name.includes('offer') || name.includes('offers') || name.includes('special') || 
                    name.includes('deal') || name.includes('package')) return 1;
                if (name.includes('follower') || name.includes('followers') || 
                    name.includes('subscriber') || name.includes('fans')) return 2;
                if (name.includes('like') || name.includes('likes') || 
                    name.includes('heart') || name.includes('favorite')) return 3;
                return 999;
            }

            function loadServicesForCategory(category) {
                const services = groupedServices[category] || [];
                serviceTrigger.classList.remove('disabled');
                selectedServiceText.innerText = 'SELECT SERVICE';
                detailCard.classList.add('hidden');
                orderBox.classList.add('hidden');
                selectedServiceData = null;
                paymentSection.classList.remove('show');

                serviceMenu.innerHTML = '';
                if (services.length === 0) {
                    serviceMenu.innerHTML = '<div class="dropdown-item">no services</div>';
                    return;
                }

                const sortedServices = [...services].sort((a, b) => {
                    const priorityA = getServicePriority(a.name);
                    const priorityB = getServicePriority(b.name);
                    if (priorityA !== priorityB) return priorityA - priorityB;
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
                
                const filteredServices = allServices.filter(service => {
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

                const sortedFiltered = [...filteredServices].sort((a, b) => {
                    const priorityA = getServicePriority(a.name);
                    const priorityB = getServicePriority(b.name);
                    if (priorityA !== priorityB) return priorityA - priorityB;
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

            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => performSearch(this.value), 300);
            });

            function displayServiceDetails(service) {
                detailServiceName.textContent = service.name || 'Service';
                detailServiceId.textContent = `ID ${service.service}`;
                descriptionText.textContent = service.description || 'No description provided.';
                minOrderSpan.textContent = service.min || '0';
                maxOrderSpan.textContent = service.max || '0';

                detailCard.classList.remove('hidden');
                orderBox.classList.remove('hidden');
                paymentSection.classList.remove('show');
                
                quantityInput.value = '';
                totalPriceDiv.innerHTML = '₹ 0.00<small>total</small>';
                linkInput.value = '';
                utrInput.value = '';
                
                // Clear QR display
                qrDisplay.innerHTML = '';
                
                currentLink = '';
                currentAmount = 0;
                currentPrice = 0;
                
                // Remove any error styling
                linkInput.classList.remove('input-error');
                linkError.classList.remove('show');
            }

            // Update price when quantity changes
            quantityInput.addEventListener('input', function() {
                if (!selectedServiceData) {
                    totalPriceDiv.innerHTML = '₹ 0.00<small>total</small>';
                    return;
                }
                const qty = parseInt(this.value, 10);
                if (!qty || qty < 0) {
                    totalPriceDiv.innerHTML = '₹ 0.00<small>total</small>';
                    currentAmount = 0;
                    currentPrice = 0;
                    return;
                }
                
                currentAmount = qty;
                
                const originalRate = parseFloat(selectedServiceData.rate) || 0;
                const finalRate = originalRate * 1.45;
                const total = (finalRate / 1000) * qty;
                currentPrice = total;
                
                totalPriceDiv.innerHTML = `₹ ${total.toFixed(2)}<small>total</small>`;
            });

            // Track link input and remove error styling when user types
            linkInput.addEventListener('input', function() {
                currentLink = this.value;
                linkInput.classList.remove('input-error');
                linkError.classList.remove('show');
            });

            // Function to validate URL
            function isValidUrl(string) {
                try {
                    new URL(string);
                    return true;
                } catch (_) {
                    return false;
                }
            }

            // Function to show loading animation
            function showLoadingAnimation() {
                qrDisplay.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <div class="loading-text">
                            Generating QR code<span class="loading-dots"></span>
                        </div>
                    </div>
                `;
            }

            // Function to generate and display QR code
            function generateQRCode(amount) {
                // Ensure minimum amount of ₹1 for QR
                const qrAmount = Math.max(amount, MIN_QR_AMOUNT);
                const qrUrl = `${QR_API_URL}${qrAmount.toFixed(2)}`;
                
                // Show loading animation
                showLoadingAnimation();
                
                // Create new image object to handle load/error events
                const qrImg = new Image();
                qrImg.src = qrUrl;
                qrImg.alt = `QR Code for ₹${qrAmount.toFixed(2)}`;
                
                qrImg.onload = function() {
                    // Clear loading animation and display QR
                    qrDisplay.innerHTML = '';
                    qrDisplay.appendChild(qrImg);
                    
                    // Add message
                    const amountMsg = document.createElement('p');
                    if (amount < MIN_QR_AMOUNT) {
                        amountMsg.innerHTML = `<i class="fas fa-info-circle" style="color: #9ed9b5;"></i> Minimum ₹${MIN_QR_AMOUNT} QR generated (actual amount: ₹${amount.toFixed(2)})`;
                    } else {
                        amountMsg.innerHTML = `<i class="fas fa-check-circle" style="color: #9ed9b5;"></i> Scan to pay ₹${amount.toFixed(2)}`;
                    }
                    qrDisplay.appendChild(amountMsg);
                };
                
                qrImg.onerror = function() {
                    qrDisplay.innerHTML = '<p style="color: #ff8a9f;">Failed to load QR code. Please try again.</p>';
                };
            }

            // Continue button - validates link, generates QR, and shows payment section
            continueBtn.addEventListener('click', function() {
                if (!selectedServiceData) {
                    alert('Please select a service first.');
                    return;
                }
                
                const qty = parseInt(quantityInput.value, 10);
                if (!qty || qty <= 0) {
                    alert('Enter a valid quantity.');
                    return;
                }
                
                // Validate link
                if (!currentLink) {
                    linkInput.classList.add('input-error');
                    linkError.classList.add('show');
                    return;
                }
                
                // Check if it's a valid URL
                if (!isValidUrl(currentLink)) {
                    linkInput.classList.add('input-error');
                    linkError.classList.add('show');
                    return;
                }
                
                // Show payment section
                paymentSection.classList.add('show');
                
                // Generate QR code with minimum amount logic
                generateQRCode(currentPrice);
            });

            // Submit UTR and send to WhatsApp
            submitUtrBtn.addEventListener('click', function() {
                if (!selectedServiceData) {
                    alert('Please select a service first.');
                    return;
                }
                
                const qty = parseInt(quantityInput.value, 10);
                if (!qty || qty <= 0) {
                    alert('Enter a valid quantity.');
                    return;
                }
                
                if (!currentLink) {
                    alert('Please enter a profile or post link.');
                    return;
                }
                
                const utr = utrInput.value.trim();
                if (!utr) {
                    alert('Please enter the UTR/Transaction ID.');
                    return;
                }

                const serviceId = selectedServiceData.service;
                const serviceName = selectedServiceData.name || 'Unnamed';
                const price = currentPrice.toFixed(2);
                
                const message = `New order request ✋🏻:%0A🔹 Service ID: ${serviceId}%0A🔹 Quantity: ${qty}%0A🔹 Link: ${currentLink}%0A🔹 Price: ₹ ${price}%0A🔹 UTR: ${utr}`;
                
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
            });

            async function fetchServices() {
                try {
                    const response = await fetch(API_URL);
                    const services = await response.json();
                    if (!Array.isArray(services)) {
                        console.warn("API did not return an array.");
                        return;
                    }

                    const filteredServices = services.filter(service => !isCategoryExcluded(service.category));
                    allServices = filteredServices;

                    filteredServices.forEach(service => {
                        const cat = service.category || "Uncategorized";
                        if (!groupedServices[cat]) groupedServices[cat] = [];
                        groupedServices[cat].push(service);
                    });

                    categoriesList = Object.keys(groupedServices).sort();
                    populateCategoryMenu();
                    
                    console.log(`Filtered out ${services.length - filteredServices.length} services from excluded categories`);
                } catch (err) {
                    console.error("Fetch from Vercel API failed.", err);
                }
            }

            fetchServices();
            serviceTrigger.classList.add('disabled');
        })();
