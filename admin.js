// Admin dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    loadDashboardData();
    initializeCharts();
    setupEventListeners();
});

// Initialize admin dashboard
function initializeAdmin() {
    // Check if user is logged in (simulate)
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) {
        // Redirect to login (simulate)
        // window.location.href = 'login.html';
    }
    
    // Initialize navigation
    initializeNavigation();
    
    // Load initial data
    loadOrders();
    loadClients();
}

// Initialize navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.add('hidden'));
            
            // Show target section
            const targetId = item.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId + '-section');
            if (targetSection) {
                targetSection.classList.remove('hidden');
                
                // Update page title
                const pageTitle = document.getElementById('page-title');
                pageTitle.textContent = item.querySelector('span').textContent;
                
                // Load section specific data
                loadSectionData(targetId);
            }
        });
    });
    
    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-open');
            sidebarOverlay.classList.toggle('hidden');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('sidebar-open');
            sidebarOverlay.classList.add('hidden');
        });
    }
}

// Load dashboard data
function loadDashboardData() {
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    
    // Update stats
    const totalOrders = requests.length;
    const pendingOrders = requests.filter(req => req.status === 'pending').length;
    const inProgressOrders = requests.filter(req => req.status === 'in_progress').length;
    const completedOrders = requests.filter(req => req.status === 'completed').length;
    
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('in-progress-orders').textContent = inProgressOrders;
    document.getElementById('completed-orders').textContent = completedOrders;
    
    // Update badge
    const badge = document.getElementById('orders-badge');
    if (pendingOrders > 0) {
        badge.textContent = pendingOrders;
        badge.classList.remove('hidden');
    }
    
    // Load recent orders
    loadRecentOrders(requests);
}

// Load recent orders
function loadRecentOrders(requests) {
    const recentOrders = requests.slice(-5).reverse(); // Last 5 orders
    const tableBody = document.getElementById('recent-orders-table');
    
    if (recentOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-slate-500">
                    Nenhuma ordem de serviço encontrada
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = recentOrders.map(order => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="py-3 px-4 font-mono text-sm">${order.protocolNumber}</td>
            <td class="py-3 px-4">${order.name}</td>
            <td class="py-3 px-4">${getEquipmentTypeLabel(order.equipmentType)}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(order.status).class}">
                    ${getStatusInfo(order.status).text}
                </span>
            </td>
            <td class="py-3 px-4 text-sm text-slate-600">
                ${new Date(order.createdAt).toLocaleDateString('pt-BR')}
            </td>
            <td class="py-3 px-4">
                <button onclick="viewOrder('${order.protocolNumber}')" 
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Ver Detalhes
                </button>
            </td>
        </tr>
    `).join('');
}

// Initialize charts
function initializeCharts() {
    initializeStatusChart();
    initializeServicesChart();
}

// Initialize status chart
function initializeStatusChart() {
    const chartDom = document.getElementById('status-chart');
    const myChart = echarts.init(chartDom);
    
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const statusCounts = {
        pending: requests.filter(req => req.status === 'pending').length,
        in_progress: requests.filter(req => req.status === 'in_progress').length,
        completed: requests.filter(req => req.status === 'completed').length,
        cancelled: requests.filter(req => req.status === 'cancelled').length
    };
    
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: {
                fontSize: 12
            }
        },
        series: [
            {
                name: 'Status',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['60%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: statusCounts.pending, name: 'Pendente', itemStyle: { color: '#f59e0b' } },
                    { value: statusCounts.in_progress, name: 'Em Andamento', itemStyle: { color: '#3b82f6' } },
                    { value: statusCounts.completed, name: 'Concluído', itemStyle: { color: '#10b981' } },
                    { value: statusCounts.cancelled, name: 'Cancelado', itemStyle: { color: '#ef4444' } }
                ]
            }
        ]
    };
    
    myChart.setOption(option);
    
    // Make chart responsive
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

// Initialize services chart
function initializeServicesChart() {
    const chartDom = document.getElementById('services-chart');
    const myChart = echarts.init(chartDom);
    
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const serviceCounts = {
        desktop: requests.filter(req => req.equipmentType === 'desktop').length,
        notebook: requests.filter(req => req.equipmentType === 'notebook').length,
        'tv-led': requests.filter(req => req.equipmentType === 'tv-led').length,
        'tv-lcd': requests.filter(req => req.equipmentType === 'tv-lcd').length,
        monitor: requests.filter(req => req.equipmentType === 'monitor').length,
        outro: requests.filter(req => req.equipmentType === 'outro').length
    };
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: ['Desktop', 'Notebook', 'TV LED', 'TV LCD', 'Monitor', 'Outro'],
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    fontSize: 11
                }
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                name: 'Quantidade',
                type: 'bar',
                barWidth: '60%',
                itemStyle: {
                    color: '#3b82f6',
                    borderRadius: [4, 4, 0, 0]
                },
                data: [
                    serviceCounts.desktop,
                    serviceCounts.notebook,
                    serviceCounts['tv-led'],
                    serviceCounts['tv-lcd'],
                    serviceCounts.monitor,
                    serviceCounts.outro
                ]
            }
        ]
    };
    
    myChart.setOption(option);
    
    // Make chart responsive
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

// Setup event listeners
function setupEventListeners() {
    // Order form submission
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmission);
    }
    
    // Search functionality
    const orderSearch = document.getElementById('order-search');
    if (orderSearch) {
        orderSearch.addEventListener('input', filterOrders);
    }
    
    const clientSearch = document.getElementById('client-search');
    if (clientSearch) {
        clientSearch.addEventListener('input', filterClients);
    }
    
    // Status filter
    const orderStatusFilter = document.getElementById('order-status-filter');
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', filterOrders);
    }
}

// Load section specific data
function loadSectionData(sectionId) {
    switch (sectionId) {
        case 'orders':
            loadOrders();
            break;
        case 'clients':
            loadClients();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Load all orders
function loadOrders() {
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const tableBody = document.getElementById('orders-table');
    
    if (requests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-slate-500">
                    Nenhuma ordem de serviço encontrada
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = requests.map(order => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="py-3 px-4 font-mono text-sm">${order.protocolNumber}</td>
            <td class="py-3 px-4">${order.name}</td>
            <td class="py-3 px-4">${getEquipmentTypeLabel(order.equipmentType)}</td>
            <td class="py-3 px-4">
                <select onchange="updateOrderStatus('${order.protocolNumber}', this.value)" 
                        class="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendente</option>
                    <option value="in_progress" ${order.status === 'in_progress' ? 'selected' : ''}>Em Andamento</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Concluído</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                </select>
            </td>
            <td class="py-3 px-4 text-sm text-slate-600">
                ${new Date(order.createdAt).toLocaleDateString('pt-BR')}
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="viewOrder('${order.protocolNumber}')" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver
                    </button>
                    <button onclick="editOrder('${order.protocolNumber}')" 
                            class="text-green-600 hover:text-green-800 text-sm font-medium">
                        Editar
                    </button>
                    <button onclick="deleteOrder('${order.protocolNumber}')" 
                            class="text-red-600 hover:text-red-800 text-sm font-medium">
                        Excluir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load clients
function loadClients() {
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const clients = {};
    
    // Group requests by client
    requests.forEach(request => {
        const key = request.phone; // Use phone as unique identifier
        if (!clients[key]) {
            clients[key] = {
                name: request.name,
                phone: request.phone,
                email: request.email || 'Não informado',
                orders: []
            };
        }
        clients[key].orders.push(request);
    });
    
    const tableBody = document.getElementById('clients-table');
    
    if (Object.keys(clients).length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-slate-500">
                    Nenhum cliente encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = Object.values(clients).map(client => {
        const lastOrder = client.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
        return `
            <tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="py-3 px-4">${client.name}</td>
                <td class="py-3 px-4">${client.phone}</td>
                <td class="py-3 px-4">${client.email}</td>
                <td class="py-3 px-4 text-center">${client.orders.length}</td>
                <td class="py-3 px-4 text-sm text-slate-600">
                    ${lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                </td>
                <td class="py-3 px-4">
                    <button onclick="viewClient('${client.phone}')" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver Detalhes
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load reports
function loadReports() {
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const detailedStats = document.getElementById('detailed-stats');
    
    // Calculate statistics
    const stats = {
        totalRevenue: requests.filter(req => req.status === 'completed').length * 150, // Simulate revenue
        averageServiceTime: calculateAverageServiceTime(requests),
        mostCommonService: getMostCommonService(requests),
        clientSatisfaction: 95 // Simulated
    };
    
    detailedStats.innerHTML = `
        <div class="bg-slate-50 rounded-lg p-4">
            <h4 class="font-medium text-slate-700 mb-2">Receita Total</h4>
            <p class="text-2xl font-bold text-green-600">R$ ${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div class="bg-slate-50 rounded-lg p-4">
            <h4 class="font-medium text-slate-700 mb-2">Tempo Médio de Serviço</h4>
            <p class="text-2xl font-bold text-blue-600">${stats.averageServiceTime} dias</p>
        </div>
        <div class="bg-slate-50 rounded-lg p-4">
            <h4 class="font-medium text-slate-700 mb-2">Serviço Mais Comum</h4>
            <p class="text-2xl font-bold text-purple-600">${stats.mostCommonService}</p>
        </div>
        <div class="bg-slate-50 rounded-lg p-4">
            <h4 class="font-medium text-slate-700 mb-2">Satisfação dos Clientes</h4>
            <p class="text-2xl font-bold text-yellow-600">${stats.clientSatisfaction}%</p>
        </div>
    `;
}

// Calculate average service time
function calculateAverageServiceTime(requests) {
    const completed = requests.filter(req => req.status === 'completed');
    if (completed.length === 0) return 0;
    
    // Simulate average service time
    return Math.floor(Math.random() * 5) + 2;
}

// Get most common service
function getMostCommonService(requests) {
    const types = {};
    requests.forEach(req => {
        types[req.equipmentType] = (types[req.equipmentType] || 0) + 1;
    });
    
    const mostCommon = Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b);
    return getEquipmentTypeLabel(mostCommon);
}

// Load settings
function loadSettings() {
    // Settings are static for now
}

// Handle order submission
function handleOrderSubmission(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('order-client').value,
        phone: document.getElementById('order-phone').value,
        equipmentType: document.getElementById('order-equipment').value,
        brand: document.getElementById('order-brand').value,
        problem: document.getElementById('order-problem').value,
        notes: document.getElementById('order-notes').value
    };
    
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.equipmentType || !formData.problem) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Generate protocol number
    const protocolNumber = generateProtocolNumber();
    
    // Save order
    const order = {
        ...formData,
        protocolNumber,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    let requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    requests.push(order);
    localStorage.setItem('serviceRequests', JSON.stringify(requests));
    
    // Close modal and refresh data
    closeOrderModal();
    loadDashboardData();
    loadOrders();
    showNotification('Ordem de serviço criada com sucesso!', 'success');
    
    // Reset form
    document.getElementById('order-form').reset();
}

// Show new order modal
function showNewOrderModal() {
    const modal = document.getElementById('order-modal');
    modal.classList.remove('hidden');
}

// Close order modal
function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    modal.classList.add('hidden');
}

// Update order status
function updateOrderStatus(protocolNumber, newStatus) {
    let requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const orderIndex = requests.findIndex(req => req.protocolNumber === protocolNumber);
    
    if (orderIndex !== -1) {
        requests[orderIndex].status = newStatus;
        requests[orderIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('serviceRequests', JSON.stringify(requests));
        
        loadDashboardData();
        showNotification('Status atualizado com sucesso!', 'success');
    }
}

// View order details
function viewOrder(protocolNumber) {
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const order = requests.find(req => req.protocolNumber === protocolNumber);
    
    if (order) {
        alert(`Detalhes da Ordem ${protocolNumber}:\n\n` +
              `Cliente: ${order.name}\n` +
              `Telefone: ${order.phone}\n` +
              `Equipamento: ${getEquipmentTypeLabel(order.equipmentType)}\n` +
              `Marca: ${order.brand || 'Não informado'}\n` +
              `Status: ${getStatusInfo(order.status).text}\n` +
              `Problema: ${order.problem}\n` +
              `Observações: ${order.notes || 'Nenhuma'}\n` +
              `Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}`);
    }
}

// Edit order
function editOrder(protocolNumber) {
    // For simplicity, just show view dialog
    viewOrder(protocolNumber);
}

// Delete order
function deleteOrder(protocolNumber) {
    if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
        let requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
        requests = requests.filter(req => req.protocolNumber !== protocolNumber);
        localStorage.setItem('serviceRequests', JSON.stringify(requests));
        
        loadDashboardData();
        loadOrders();
        showNotification('Ordem excluída com sucesso!', 'success');
    }
}

// View client details
function viewClient(phone) {
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const clientOrders = requests.filter(req => req.phone === phone);
    
    if (clientOrders.length > 0) {
        const client = {
            name: clientOrders[0].name,
            phone: clientOrders[0].phone,
            email: clientOrders[0].email || 'Não informado'
        };
        
        const ordersList = clientOrders.map(order => 
            `• ${order.protocolNumber} - ${getEquipmentTypeLabel(order.equipmentType)} - ${getStatusInfo(order.status).text}`
        ).join('\n');
        
        alert(`Detalhes do Cliente:\n\n` +
              `Nome: ${client.name}\n` +
              `Telefone: ${client.phone}\n` +
              `Email: ${client.email}\n` +
              `Total de Ordens: ${clientOrders.length}\n\n` +
              `Ordens de Serviço:\n${ordersList}`);
    }
}

// Filter orders
function filterOrders() {
    const searchTerm = document.getElementById('order-search').value.toLowerCase();
    const statusFilter = document.getElementById('order-status-filter').value;
    
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const filteredRequests = requests.filter(req => {
        const matchesSearch = !searchTerm || 
            req.protocolNumber.toLowerCase().includes(searchTerm) ||
            req.name.toLowerCase().includes(searchTerm) ||
            getEquipmentTypeLabel(req.equipmentType).toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || req.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    const tableBody = document.getElementById('orders-table');
    
    if (filteredRequests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-slate-500">
                    Nenhuma ordem encontrada com os filtros aplicados
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredRequests.map(order => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="py-3 px-4 font-mono text-sm">${order.protocolNumber}</td>
            <td class="py-3 px-4">${order.name}</td>
            <td class="py-3 px-4">${getEquipmentTypeLabel(order.equipmentType)}</td>
            <td class="py-3 px-4">
                <select onchange="updateOrderStatus('${order.protocolNumber}', this.value)" 
                        class="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendente</option>
                    <option value="in_progress" ${order.status === 'in_progress' ? 'selected' : ''}>Em Andamento</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Concluído</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                </select>
            </td>
            <td class="py-3 px-4 text-sm text-slate-600">
                ${new Date(order.createdAt).toLocaleDateString('pt-BR')}
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="viewOrder('${order.protocolNumber}')" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver
                    </button>
                    <button onclick="editOrder('${order.protocolNumber}')" 
                            class="text-green-600 hover:text-green-800 text-sm font-medium">
                        Editar
                    </button>
                    <button onclick="deleteOrder('${order.protocolNumber}')" 
                            class="text-red-600 hover:text-red-800 text-sm font-medium">
                        Excluir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter clients
function filterClients() {
    const searchTerm = document.getElementById('client-search').value.toLowerCase();
    
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const clients = {};
    
    // Group requests by client
    requests.forEach(request => {
        const key = request.phone;
        if (!clients[key]) {
            clients[key] = {
                name: request.name,
                phone: request.phone,
                email: request.email || 'Não informado',
                orders: []
            };
        }
        clients[key].orders.push(request);
    });
    
    const filteredClients = Object.values(clients).filter(client => {
        return !searchTerm ||
            client.name.toLowerCase().includes(searchTerm) ||
            client.phone.toLowerCase().includes(searchTerm) ||
            client.email.toLowerCase().includes(searchTerm);
    });
    
    const tableBody = document.getElementById('clients-table');
    
    if (filteredClients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-slate-500">
                    Nenhum cliente encontrado com os filtros aplicados
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredClients.map(client => {
        const lastOrder = client.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
        return `
            <tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="py-3 px-4">${client.name}</td>
                <td class="py-3 px-4">${client.phone}</td>
                <td class="py-3 px-4">${client.email}</td>
                <td class="py-3 px-4 text-center">${client.orders.length}</td>
                <td class="py-3 px-4 text-sm text-slate-600">
                    ${lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                </td>
                <td class="py-3 px-4">
                    <button onclick="viewClient('${client.phone}')" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver Detalhes
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Generate report
function generateReport(type) {
    showNotification(`Relatório ${type} gerado com sucesso!`, 'success');
}

// Logout function
function logout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
}

// Utility functions
function generateProtocolNumber() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    return `TS${year}${randomNum.toString().padStart(4, '0')}`;
}

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

function getStatusInfo(status) {
    const statusMap = {
        'pending': { text: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
        'in_progress': { text: 'Em Andamento', class: 'bg-blue-100 text-blue-800' },
        'completed': { text: 'Concluído', class: 'bg-green-100 text-green-800' },
        'cancelled': { text: 'Cancelado', class: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || statusMap['pending'];
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'error' ? 'bg-red-500 text-white' : 
        type === 'success' ? 'bg-green-500 text-white' : 
        'bg-blue-500 text-white'
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