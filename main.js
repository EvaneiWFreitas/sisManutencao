// Initialize animations and interactions
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeMobileMenu();
    initializeFormHandlers();
    initializeScrollEffects();
});

// Initialize typed text animation
function initializeAnimations() {
    // Typed.js animation for hero text
    const typed = new Typed('#typed-text', {
        strings: ['Manutenção de ', 'Reparo de ', 'Assistência Técnica '],
        typeSpeed: 80,
        backSpeed: 50,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });

    // Animate service cards on scroll
    const serviceCards = document.querySelectorAll('.card-hover');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    translateY: [50, 0],
                    opacity: [0, 1],
                    duration: 800,
                    delay: index * 200,
                    easing: 'easeOutCubic'
                });
            }
        });
    }, observerOptions);

    serviceCards.forEach(card => observer.observe(card));
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Form handlers
function initializeFormHandlers() {
    const serviceForm = document.getElementById('service-request-form');
    
    if (serviceForm) {
        serviceForm.addEventListener('submit', handleServiceRequest);
    }
}

// Handle service request form submission
function handleServiceRequest(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('client-name').value,
        phone: document.getElementById('client-phone').value,
        email: document.getElementById('client-email').value,
        equipmentType: document.getElementById('equipment-type').value,
        brand: document.getElementById('equipment-brand').value,
        serialNumber: document.getElementById('serial-number').value,
        problem: document.getElementById('problem-description').value,
        notes: document.getElementById('additional-notes').value
    };

    // Validate required fields
    if (!formData.name || !formData.phone || !formData.equipmentType || !formData.problem) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    // Generate protocol number
    const protocolNumber = generateProtocolNumber();
    
    // Simulate API call
    showLoadingState();
    
    setTimeout(() => {
        hideLoadingState();
        showSuccessModal(protocolNumber);
        saveServiceRequest({...formData, protocolNumber});
        clearForm();
    }, 2000);
}

// Generate protocol number
function generateProtocolNumber() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    return `TS${year}${randomNum.toString().padStart(4, '0')}`;
}

// Show loading state
function showLoadingState() {
    const submitBtn = document.querySelector('#service-request-form button[type="submit"]');
    submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Enviando...
    `;
    submitBtn.disabled = true;
}

// Hide loading state
function hideLoadingState() {
    const submitBtn = document.querySelector('#service-request-form button[type="submit"]');
    submitBtn.innerHTML = 'Enviar Solicitação';
    submitBtn.disabled = false;
}

// Show success modal
function showSuccessModal(protocolNumber) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Solicitação Enviada!</h3>
            <p class="text-slate-600 mb-4">Seu protocolo é:</p>
            <div class="bg-slate-100 rounded-lg p-4 mb-6">
                <span class="font-mono text-2xl font-bold text-blue-600">${protocolNumber}</span>
            </div>
            <p class="text-sm text-slate-600 mb-6">
                Anote seu número de protocolo para acompanhar o status do serviço. Entraremos em contato em breve.
            </p>
            <button onclick="closeModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                Fechar
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}

// Save service request to localStorage
function saveServiceRequest(data) {
    let requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    requests.push({
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    localStorage.setItem('serviceRequests', JSON.stringify(requests));
}

// Clear form
function clearForm() {
    document.getElementById('service-request-form').reset();
}

// Track service
function trackService() {
    const trackingNumber = document.getElementById('tracking-number').value.trim();
    const resultDiv = document.getElementById('tracking-result');
    
    if (!trackingNumber) {
        showNotification('Por favor, digite o número do protocolo.', 'error');
        return;
    }

    // Simulate API call
    showTrackingLoading();
    
    setTimeout(() => {
        const request = findServiceRequest(trackingNumber);
        
        if (request) {
            displayTrackingResult(request);
        } else {
            showTrackingError('Protocolo não encontrado. Verifique o número e tente novamente.');
        }
    }, 1500);
}

// Show tracking loading
function showTrackingLoading() {
    const resultDiv = document.getElementById('tracking-result');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-slate-600">Buscando informações...</p>
        </div>
    `;
}

// Find service request
function findServiceRequest(protocolNumber) {
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    return requests.find(req => req.protocolNumber === protocolNumber);
}

// Display tracking result
function displayTrackingResult(request) {
    const resultDiv = document.getElementById('tracking-result');
    const statusInfo = getStatusInfo(request.status);
    
    resultDiv.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-slate-800">Protocolo: ${request.protocolNumber}</h3>
                <span class="px-3 py-1 rounded-full text-sm font-medium ${statusInfo.class}">
                    ${statusInfo.text}
                </span>
            </div>
            <div class="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="font-medium text-slate-600">Cliente:</span>
                    <p class="text-slate-800">${request.name}</p>
                </div>
                <div>
                    <span class="font-medium text-slate-600">Equipamento:</span>
                    <p class="text-slate-800">${getEquipmentTypeLabel(request.equipmentType)}</p>
                </div>
                <div>
                    <span class="font-medium text-slate-600">Marca/Modelo:</span>
                    <p class="text-slate-800">${request.brand || 'Não informado'}</p>
                </div>
                <div>
                    <span class="font-medium text-slate-600">Data de Solicitação:</span>
                    <p class="text-slate-800">${new Date(request.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
            <div class="border-t pt-4">
                <span class="font-medium text-slate-600">Problema Relatado:</span>
                <p class="text-slate-800 mt-2">${request.problem}</p>
            </div>
            ${request.notes ? `
                <div class="border-t pt-4">
                    <span class="font-medium text-slate-600">Observações:</span>
                    <p class="text-slate-800 mt-2">${request.notes}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// Show tracking error
function showTrackingError(message) {
    const resultDiv = document.getElementById('tracking-result');
    resultDiv.innerHTML = `
        <div class="text-center py-8">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 mb-2">Erro na Busca</h3>
            <p class="text-slate-600">${message}</p>
        </div>
    `;
}

// Get status info
function getStatusInfo(status) {
    const statusMap = {
        'pending': { text: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
        'in_progress': { text: 'Em Andamento', class: 'bg-blue-100 text-blue-800' },
        'completed': { text: 'Concluído', class: 'bg-green-100 text-green-800' },
        'cancelled': { text: 'Cancelado', class: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || statusMap['pending'];
}

// Get equipment type label
function getEquipmentTypeLabel(type) {
    const typeMap = {
        'desktop': 'Computador Desktop',
        'notebook': 'Notebook',
        'tv-led': 'TV LED',
        'tv-lcd': 'TV LCD',
        'monitor': 'Monitor',
        'outro': 'Outro'
    };
    return typeMap[type] || type;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <span class="flex-1">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Scroll functions
function scrollToForm() {
    document.getElementById('service-form').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToTracking() {
    document.getElementById('tracking').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Initialize scroll effects
function initializeScrollEffects() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll-based animations
    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        animateOnScroll.observe(section);
    });
}

// Add fade-in animation class
const style = document.createElement('style');
style.textContent = `
    .animate-fade-in {
        animation: fadeIn 0.8s ease-out forwards;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);