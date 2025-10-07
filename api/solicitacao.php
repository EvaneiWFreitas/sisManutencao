<?php
require_once '../config.php';

// Handle service request submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $requiredFields = ['name', 'phone', 'equipmentType', 'problem'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            handleError("Campo obrigatório: $field");
        }
    }
    
    // Generate protocol number
    $protocolNumber = generateProtocolNumber();
    
    // Prepare data for database
    $serviceData = [
        'protocol_number' => $protocolNumber,
        'client_name' => $data['name'],
        'client_phone' => $data['phone'],
        'client_email' => $data['email'] ?? null,
        'equipment_type' => $data['equipmentType'],
        'equipment_brand' => $data['brand'] ?? null,
        'serial_number' => $data['serialNumber'] ?? null,
        'problem_description' => $data['problem'],
        'additional_notes' => $data['notes'] ?? null,
        'status' => 'pending',
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    try {
        // Insert into database
        $sql = "INSERT INTO service_orders (protocol_number, client_name, client_phone, client_email, 
                equipment_type, equipment_brand, serial_number, problem_description, additional_notes, 
                status, created_at, updated_at) 
                VALUES (:protocol_number, :client_name, :client_phone, :client_email, 
                :equipment_type, :equipment_brand, :serial_number, :problem_description, 
                :additional_notes, :status, :created_at, :updated_at)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($serviceData);
        
        // Return success response
        handleSuccess([
            'protocolNumber' => $protocolNumber,
            'message' => 'Solicitação de serviço criada com sucesso!'
        ]);
        
    } catch(PDOException $e) {
        handleError("Erro ao salvar solicitação: " . $e->getMessage());
    }
}

// Handle GET requests (retrieve service requests)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $protocolNumber = $_GET['protocol'] ?? null;
    
    try {
        if ($protocolNumber) {
            // Get specific service request
            $sql = "SELECT * FROM service_orders WHERE protocol_number = :protocol_number";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['protocol_number' => $protocolNumber]);
            $order = $stmt->fetch();
            
            if ($order) {
                handleSuccess($order);
            } else {
                handleError("Protocolo não encontrado", 404);
            }
        } else {
            // Get all service requests
            $sql = "SELECT * FROM service_orders ORDER BY created_at DESC";
            $stmt = $pdo->query($sql);
            $orders = $stmt->fetchAll();
            
            handleSuccess($orders);
        }
    } catch(PDOException $e) {
        handleError("Erro ao buscar solicitações: " . $e->getMessage());
    }
}

// Generate protocol number
function generateProtocolNumber() {
    $year = date('Y');
    $randomNum = rand(1, 9999);
    return 'TS' . $year . str_pad($randomNum, 4, '0', STR_PAD_LEFT);
}
?>