// Orders page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    setupEventListeners();
});

let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 10;

// Load orders from localStorage
function loadOrders() {
    allOrders = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    filteredOrders = [...allOrders];
    updateOrdersDisplay();
    updatePagination();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', filterOrders);
    document.getElementById('status-filter').addEventListener('change', filterOrders);
    document.getElementById('equipment-filter').addEventListener('change', filterOrders);
    document.getElementById('date-filter').addEventListener('change', filterOrders);
}

// Filter orders
function filterOrders() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const equipmentFilter = document.getElementById('equipment-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    filteredOrders = allOrders.filter(order => {
        // Search filter
        const matchesSearch = !searchTerm || 
            order.protocolNumber.toLowerCase().includes(searchTerm) ||
            order.name.toLowerCase().includes(searchTerm) ||
            getEquipmentTypeLabel(order.equipmentType).toLowerCase().includes(searchTerm) ||
            (order.brand && order.brand.toLowerCase().includes(searchTerm));
        
        // Status filter
        const matchesStatus = !statusFilter || order.status === statusFilter;
        
        // Equipment filter
        const matchesEquipment = !equipmentFilter || order.equipmentType === equipmentFilter;
        
        // Date filter
        const matchesDate = !dateFilter || checkDateFilter(order.createdAt, dateFilter);
        
        return matchesSearch && matchesStatus && matchesEquipment && matchesDate;
    });
    
    currentPage = 1;
    updateOrdersDisplay();
    updatePagination();
}

// Check date filter
function checkDateFilter(dateString, filter) {
    const orderDate = new Date(dateString);
    const now = new Date();
    
    switch (filter) {
        case 'today':
            return orderDate.toDateString() === now.toDateString();
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
        case 'month':
            return orderDate.getMonth() === now.getMonth() && 
                   orderDate.getFullYear() === now.getFullYear();
        default:
            return true;
    }
}

// Update orders display
function updateOrdersDisplay() {
    const tableBody = document.getElementById('orders-table-body');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const ordersToShow = filteredOrders.slice(startIndex, endIndex);
    
    // Update count
    document.getElementById('orders-count').textContent = `${filteredOrders.length} ordem${filteredOrders.length !== 1 ? 'ens' : ''}`;
    
    // Update showing info
    document.getElementById('showing-start').textContent = filteredOrders.length > 0 ? startIndex + 1 : 0;
    document.getElementById('showing-end').textContent = Math.min(endIndex, filteredOrders.length);
    document.getElementById('showing-total').textContent = filteredOrders.length;
    
    if (ordersToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-8 text-slate-500">
                    Nenhuma ordem de serviço encontrada
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = ordersToShow.map(order => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="py-3 px-4 font-mono text-sm text-blue-600 font-medium">${order.protocolNumber}</td>
            <td class="py-3 px-4 font-medium">${order.name}</td>
            <td class="py-3 px-4 text-slate-600">${order.phone}</td>
            <td class="py-3 px-4">${getEquipmentTypeLabel(order.equipmentType)}</td>
            <td class="py-3 px-4 text-slate-600">${order.brand || 'N/A'}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(order.status).class}">
                    ${getStatusInfo(order.status).text}
                </span>
            </td>
            <td class="py-3 px-4 text-sm text-slate-600">
                ${new Date(order.createdAt).toLocaleDateString('pt-BR')}
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="viewOrderDetails('${order.protocolNumber}')" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver
                    </button>
                    <button onclick="editOrder('${order.protocolNumber}')" 
                            class="text-green-600 hover:text-green-800 text-sm font-medium">
                        Editar
                    </button>
                    <button onclick="printOrder('${order.protocolNumber}')" 
                            class="text-purple-600 hover:text-purple-800 text-sm font-medium">
                        Imprimir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const pageNumbers = document.getElementById('page-numbers');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    
    // Update navigation buttons
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
    
    // Generate page numbers
    let pagesHtml = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        pagesHtml += `
            <button onclick="goToPage(${i})" 
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }">
                ${i}
            </button>
        `;
    }
    
    pageNumbers.innerHTML = pagesHtml;
}

// Change page
function changePage(direction) {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        updateOrdersDisplay();
        updatePagination();
    }
}

// Go to specific page
function goToPage(page) {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateOrdersDisplay();
        updatePagination();
    }
}

// View order details
function viewOrderDetails(protocolNumber) {
    const order = allOrders.find(o => o.protocolNumber === protocolNumber);
    
    if (!order) {
        showNotification('Ordem não encontrada', 'error');
        return;
    }
    
    const modal = document.getElementById('order-details-modal');
    const content = document.getElementById('order-details-content');
    
    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold text-slate-700 mb-2">Informações do Cliente</h4>
                    <div class="bg-slate-50 rounded-lg p-4 space-y-2">
                        <div><span class="font-medium">Nome:</span> ${order.name}</div>
                        <div><span class="font-medium">Telefone:</span> ${order.phone}</div>
                        <div><span class="font-medium">Email:</span> ${order.email || 'Não informado'}</div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-slate-700 mb-2">Informações do Equipamento</h4>
                    <div class="bg-slate-50 rounded-lg p-4 space-y-2">
                        <div><span class="font-medium">Tipo:</span> ${getEquipmentTypeLabel(order.equipmentType)}</div>
                        <div><span class="font-medium">Marca/Modelo:</span> ${order.brand || 'Não informado'}</div>
                        <div><span class="font-medium">Número de Série:</span> ${order.serialNumber || 'Não informado'}</div>
                    </div>
                </div>
            </div>
            
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold text-slate-700 mb-2">Status e Datas</h4>
                    <div class="bg-slate-50 rounded-lg p-4 space-y-2">
                        <div>
                            <span class="font-medium">Status:</span>
                            <span class="ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(order.status).class}">
                                ${getStatusInfo(order.status).text}
                            </span>
                        </div>
                        <div><span class="font-medium">Protocolo:</span> ${order.protocolNumber}</div>
                        <div><span class="font-medium">Data de Entrada:</span> ${new Date(order.createdAt).toLocaleDateString('pt-BR')}</div>
                        <div><span class="font-medium">Última Atualização:</span> ${new Date(order.updatedAt).toLocaleDateString('pt-BR')}</div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-slate-700 mb-2">Descrição do Problema</h4>
                    <div class="bg-slate-50 rounded-lg p-4">
                        ${order.problem}
                    </div>
                </div>
                
                ${order.notes ? `
                <div>
                    <h4 class="font-semibold text-slate-700 mb-2">Observações</h4>
                    <div class="bg-slate-50 rounded-lg p-4">
                        ${order.notes}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3 pt-4 border-t">
            <button onclick="editOrder('${order.protocolNumber}')" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Editar Ordem
            </button>
            <button onclick="printOrder('${order.protocolNumber}')" 
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Imprimir
            </button>
            <button onclick="closeOrderDetails()" 
                    class="border border-slate-300 text-slate-600 px-4 py-2 rounded-lg font-medium hover:bg-slate-50">
                Fechar
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Close order details
function closeOrderDetails() {
    document.getElementById('order-details-modal').classList.add('hidden');
}

// Edit order
function editOrder(protocolNumber) {
    const order = allOrders.find(o => o.protocolNumber === protocolNumber);
    
    if (!order) {
        showNotification('Ordem não encontrada', 'error');
        return;
    }
    
    // For simplicity, just show an alert with current data
    // In a real application, you would show an edit form
    const newStatus = prompt(`Editar ordem ${protocolNumber}\n\nStatus atual: ${getStatusInfo(order.status).text}\n\nNovo status (pending/in_progress/completed/cancelled):`, order.status);
    
    if (newStatus && ['pending', 'in_progress', 'completed', 'cancelled'].includes(newStatus)) {
        // Update order status
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('serviceRequests', JSON.stringify(allOrders));
        
        // Refresh display
        loadOrders();
        showNotification('Ordem atualizada com sucesso!', 'success');
    }
}

// Print order
function printOrder(protocolNumber) {
    const order = allOrders.find(o => o.protocolNumber === protocolNumber);
    
    if (!order) {
        showNotification('Ordem não encontrada', 'error');
        return;
    }
    
    // Create print content
    const printContent = `
        <html>
        <head>
            <title>Ordem de Serviço - ${order.protocolNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .section { margin-bottom: 20px; }
                .label { font-weight: bold; display: inline-block; width: 150px; }
                .value { display: inline-block; }
                .problem { background: #f5f5f5; padding: 10px; margin: 10px 0; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>TechService</h1>
                <h2>Ordem de Serviço</h2>
                <p>Protocolo: ${order.protocolNumber}</p>
            </div>
            
            <div class="section">
                <h3>Informações do Cliente</h3>
                <p><span class="label">Nome:</span> <span class="value">${order.name}</span></p>
                <p><span class="label">Telefone:</span> <span class="value">${order.phone}</span></p>
                <p><span class="label">Email:</span> <span class="value">${order.email || 'Não informado'}</span></p>
            </div>
            
            <div class="section">
                <h3>Informações do Equipamento</h3>
                <p><span class="label">Tipo:</span> <span class="value">${getEquipmentTypeLabel(order.equipmentType)}</span></p>
                <p><span class="label">Marca/Modelo:</span> <span class="value">${order.brand || 'Não informado'}</span></p>
                <p><span class="label">Número de Série:</span> <span class="value">${order.serialNumber || 'Não informado'}</span></p>
            </div>
            
            <div class="section">
                <h3>Status e Datas</h3>
                <p><span class="label">Status:</span> <span class="value">${getStatusInfo(order.status).text}</span></p>
                <p><span class="label">Data de Entrada:</span> <span class="value">${new Date(order.createdAt).toLocaleDateString('pt-BR')}</span></p>
            </div>
            
            <div class="section">
                <h3>Descrição do Problema</h3>
                <div class="problem">${order.problem}</div>
            </div>
            
            ${order.notes ? `
            <div class="section">
                <h3>Observações</h3>
                <div class="problem">${order.notes}</div>
            </div>
            ` : ''}
            
            <div class="footer">
                <p>TechService - Manutenção de Computadores e TVs</p>
                <p>Documento gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
        </body>
        </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Export orders
function exportOrders() {
    if (filteredOrders.length === 0) {
        showNotification('Nenhuma ordem para exportar', 'error');
        return;
    }
    
    // Create CSV content
    const headers = ['Protocolo', 'Cliente', 'Telefone', 'Email', 'Tipo de Equipamento', 'Marca', 'Status', 'Data de Entrada', 'Problema'];
    const csvContent = [
        headers.join(','),
        ...filteredOrders.map(order => [
            order.protocolNumber,
            `"${order.name}"`,
            order.phone,
            order.email || '',
            getEquipmentTypeLabel(order.equipmentType),
            order.brand || '',
            getStatusInfo(order.status).text,
            new Date(order.createdAt).toLocaleDateString('pt-BR'),
            `"${order.problem.replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ordens_de_servico_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Ordens exportadas com sucesso!', 'success');
}

// Utility functions
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