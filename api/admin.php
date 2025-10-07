<?php
require_once '../config.php';

// Check if user is admin (simulate authentication)
if (!isset($_SESSION['admin_id'])) {
    // For demo purposes, allow all requests
    // In production, implement proper authentication
}

// Handle different API endpoints
$endpoint = $_GET['endpoint'] ?? '';

switch ($endpoint) {
    case 'dashboard':
        handleDashboardData();
        break;
    case 'orders':
        handleOrders();
        break;
    case 'clients':
        handleClients();
        break;
    case 'reports':
        handleReports();
        break;
    default:
        handleError("Endpoint inválido");
}

// Dashboard data
function handleDashboardData() {
    global $pdo;
    
    try {
        // Get order counts by status
        $sql = "SELECT status, COUNT(*) as count FROM service_orders GROUP BY status";
        $stmt = $pdo->query($sql);
        $statusCounts = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // Get service counts by type
        $sql = "SELECT equipment_type, COUNT(*) as count FROM service_orders GROUP BY equipment_type";
        $stmt = $pdo->query($sql);
        $serviceCounts = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // Get recent orders
        $sql = "SELECT * FROM service_orders ORDER BY created_at DESC LIMIT 5";
        $stmt = $pdo->query($sql);
        $recentOrders = $stmt->fetchAll();
        
        // Calculate totals
        $totalOrders = array_sum($statusCounts);
        $pendingOrders = $statusCounts['pending'] ?? 0;
        $inProgressOrders = $statusCounts['in_progress'] ?? 0;
        $completedOrders = $statusCounts['completed'] ?? 0;
        
        $dashboardData = [
            'totalOrders' => $totalOrders,
            'pendingOrders' => $pendingOrders,
            'inProgressOrders' => $inProgressOrders,
            'completedOrders' => $completedOrders,
            'statusCounts' => $statusCounts,
            'serviceCounts' => $serviceCounts,
            'recentOrders' => $recentOrders
        ];
        
        handleSuccess($dashboardData);
        
    } catch(PDOException $e) {
        handleError("Erro ao buscar dados do dashboard: " . $e->getMessage());
    }
}

// Orders management
function handleOrders() {
    global $pdo;
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get orders with optional filters
            $status = $_GET['status'] ?? null;
            $search = $_GET['search'] ?? null;
            
            $sql = "SELECT * FROM service_orders WHERE 1=1";
            $params = [];
            
            if ($status) {
                $sql .= " AND status = :status";
                $params['status'] = $status;
            }
            
            if ($search) {
                $sql .= " AND (protocol_number LIKE :search OR client_name LIKE :search OR equipment_type LIKE :search)";
                $params['search'] = "%$search%";
            }
            
            $sql .= " ORDER BY created_at DESC";
            
            try {
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $orders = $stmt->fetchAll();
                
                handleSuccess($orders);
            } catch(PDOException $e) {
                handleError("Erro ao buscar ordens: " . $e->getMessage());
            }
            break;
            
        case 'PUT':
            // Update order status
            $data = json_decode(file_get_contents('php://input'), true);
            $protocolNumber = $data['protocolNumber'] ?? null;
            $newStatus = $data['status'] ?? null;
            
            if (!$protocolNumber || !$newStatus) {
                handleError("Protocolo e status são obrigatórios");
            }
            
            try {
                $sql = "UPDATE service_orders SET status = :status, updated_at = NOW() WHERE protocol_number = :protocol_number";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    'status' => $newStatus,
                    'protocol_number' => $protocolNumber
                ]);
                
                if ($stmt->rowCount() > 0) {
                    handleSuccess(['message' => 'Status atualizado com sucesso!']);
                } else {
                    handleError("Ordem não encontrada", 404);
                }
            } catch(PDOException $e) {
                handleError("Erro ao atualizar ordem: " . $e->getMessage());
            }
            break;
            
        case 'DELETE':
            // Delete order
            $data = json_decode(file_get_contents('php://input'), true);
            $protocolNumber = $data['protocolNumber'] ?? null;
            
            if (!$protocolNumber) {
                handleError("Protocolo é obrigatório");
            }
            
            try {
                $sql = "DELETE FROM service_orders WHERE protocol_number = :protocol_number";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(['protocol_number' => $protocolNumber]);
                
                if ($stmt->rowCount() > 0) {
                    handleSuccess(['message' => 'Ordem excluída com sucesso!']);
                } else {
                    handleError("Ordem não encontrada", 404);
                }
            } catch(PDOException $e) {
                handleError("Erro ao excluir ordem: " . $e->getMessage());
            }
            break;
    }
}

// Clients management
function handleClients() {
    global $pdo;
    
    try {
        // Get clients with order counts
        $sql = "SELECT 
                client_phone,
                client_name,
                client_email,
                COUNT(*) as total_orders,
                MAX(created_at) as last_order_date
                FROM service_orders 
                GROUP BY client_phone, client_name, client_email
                ORDER BY client_name";
        
        $stmt = $pdo->query($sql);
        $clients = $stmt->fetchAll();
        
        handleSuccess($clients);
        
    } catch(PDOException $e) {
        handleError("Erro ao buscar clientes: " . $e->getMessage());
    }
}

// Reports generation
function handleReports() {
    global $pdo;
    
    $reportType = $_GET['type'] ?? 'general';
    
    try {
        switch ($reportType) {
            case 'monthly':
                // Monthly report
                $sql = "SELECT 
                        DATE_FORMAT(created_at, '%Y-%m') as month,
                        COUNT(*) as total_orders,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders
                        FROM service_orders 
                        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                        ORDER BY month DESC
                        LIMIT 12";
                break;
                
            case 'services':
                // Services report
                $sql = "SELECT 
                        equipment_type,
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
                        FROM service_orders 
                        GROUP BY equipment_type";
                break;
                
            case 'financial':
                // Financial report (simulated)
                $sql = "SELECT 
                        DATE_FORMAT(created_at, '%Y-%m') as month,
                        COUNT(*) as total_orders,
                        COUNT(*) * 150 as estimated_revenue
                        FROM service_orders 
                        WHERE status = 'completed'
                        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                        ORDER BY month DESC
                        LIMIT 12";
                break;
                
            default:
                // General statistics
                $sql = "SELECT 
                        COUNT(*) as total_orders,
                        COUNT(DISTINCT client_phone) as total_clients,
                        AVG(DATEDIFF(updated_at, created_at)) as avg_service_time
                        FROM service_orders 
                        WHERE status = 'completed'";
        }
        
        $stmt = $pdo->query($sql);
        $reportData = $stmt->fetchAll();
        
        handleSuccess($reportData);
        
    } catch(PDOException $e) {
        handleError("Erro ao gerar relatório: " . $e->getMessage());
    }
}
?>