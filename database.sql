-- TechService Database Schema
-- Sistema de Manutenção de Computadores e TVs

CREATE DATABASE IF NOT EXISTS techservice;
USE techservice;

-- Tabela de ordens de serviço
CREATE TABLE IF NOT EXISTS service_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    protocol_number VARCHAR(20) UNIQUE NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    client_email VARCHAR(100),
    equipment_type ENUM('desktop', 'notebook', 'tv-led', 'tv-lcd', 'monitor', 'outro') NOT NULL,
    equipment_brand VARCHAR(50),
    serial_number VARCHAR(50),
    problem_description TEXT NOT NULL,
    additional_notes TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    technician_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_protocol (protocol_number),
    INDEX idx_status (status),
    INDEX idx_client_phone (client_phone),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de usuários administrativos
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'technician', 'receptionist') DEFAULT 'technician',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de histórico de status
CREATE TABLE IF NOT EXISTS order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    old_status ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    new_status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL,
    changed_by INT,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de peças e materiais
CREATE TABLE IF NOT EXISTS parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    part_number VARCHAR(50),
    manufacturer VARCHAR(50),
    unit_cost DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    min_stock INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_part_number (part_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de peças utilizadas em ordens de serviço
CREATE TABLE IF NOT EXISTS order_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_part_id (part_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    type ENUM('status_change', 'ready_for_pickup', 'payment_due', 'warranty_reminder') NOT NULL,
    message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_is_sent (is_sent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key_name (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir usuário admin padrão
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@techservice.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin'),
('tecnico', 'tecnico@techservice.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Técnico', 'technician');

-- Inserir configurações padrão
INSERT INTO settings (key_name, value, description) VALUES
('company_name', 'TechService', 'Nome da empresa'),
('company_phone', '(11) 9999-9999', 'Telefone da empresa'),
('company_email', 'contato@techservice.com', 'Email da empresa'),
('company_address', 'Rua Exemplo, 123 - São Paulo/SP', 'Endereço da empresa'),
('default_service_price', '150.00', 'Preço padrão de serviço'),
('warranty_days', '90', 'Dias de garantia padrão'),
('enable_notifications', '1', 'Habilitar notificações'),
('enable_backup', '1', 'Habilitar backup automático');

-- Inserir peças de exemplo
INSERT INTO parts (name, description, part_number, manufacturer, unit_cost, stock_quantity) VALUES
('Memória RAM DDR4 8GB', 'Memória RAM DDR4 8GB 2666MHz', 'DDR4-8G-2666', 'Kingston', 120.00, 10),
('HD SATA 1TB', 'Disco rígido SATA 1TB 7200RPM', 'HD-1TB-SATA', 'Seagate', 180.00, 5),
('Fonte ATX 500W', 'Fonte de alimentação ATX 500W', 'PSU-500W-ATX', 'Corsair', 220.00, 3),
('Placa-mãe Micro-ATX', 'Placa-mãe Micro-ATX para Intel', 'MB-MATX-INTEL', 'ASUS', 450.00, 2),
('Processador Intel i5', 'Processador Intel Core i5 10ª geração', 'CPU-I5-10GEN', 'Intel', 850.00, 2),
('Tela LED 15.6', 'Tela LED 15.6 polegadas para notebook', 'LCD-15.6-LED', 'Samsung', 280.00, 4),
('Teclado Notebook', 'Teclado para notebook diversas marcas', 'KB-NOTEBOOK', 'Genérico', 85.00, 8),
('Bateria Notebook', 'Bateria para notebook 11.1V 4400mAh', 'BAT-NOTEBOOK', 'Genérico', 150.00, 6),
('Placa de vídeo GTX', 'Placa de vídeo GTX 1650 4GB', 'GPU-GTX1650', 'NVIDIA', 1200.00, 1),
('SSD 240GB', 'SSD SATA 240GB', 'SSD-240GB', 'Kingston', 150.00, 12);

-- Criar views para relatórios
CREATE VIEW vw_order_status_summary AS
SELECT 
    status,
    COUNT(*) as total_orders,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM service_orders) as percentage
FROM service_orders 
GROUP BY status;

CREATE VIEW vw_service_type_summary AS
SELECT 
    equipment_type,
    COUNT(*) as total_services,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM service_orders) as percentage
FROM service_orders 
GROUP BY equipment_type;

CREATE VIEW vw_monthly_orders AS
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as month,
    YEAR(created_at) as year,
    MONTH(created_at) as month_num,
    COUNT(*) as total_orders,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders
FROM service_orders 
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month DESC;

-- Permissões para o usuário do banco de dados
-- (Ajuste de acordo com seu ambiente)
-- GRANT ALL PRIVILEGES ON techservice.* TO 'techservice_user'@'localhost' IDENTIFIED BY 'your_password';
-- FLUSH PRIVILEGES;

-- Comentários sobre as tabelas
-- service_orders: Tabela principal para ordens de serviço
-- users: Usuários do sistema administrativo
-- order_status_history: Histórico de mudanças de status
-- parts: Controle de estoque de peças e materiais
-- order_parts: Relacionamento entre ordens e peças utilizadas
-- notifications: Sistema de notificações para clientes
-- settings: Configurações gerais do sistema