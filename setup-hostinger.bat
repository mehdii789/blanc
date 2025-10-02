@echo off
chcp 65001 >nul
echo.
echo 
echo             SETUP HOSTINGER - BLANCHISSERIE                
echo 
echo.

echo  Cr?ation de la structure...
if not exist "hostinger" mkdir hostinger
if not exist "hostinger\api" mkdir hostinger\api
if not exist "hostinger\database" mkdir hostinger\database
if not exist "hostinger\docs" mkdir hostinger\docs
echo     Dossiers cr??s

echo.
echo  Cr?ation des fichiers PHP et MySQL...
call :CREATE_PHP_CONFIG
call :CREATE_PHP_DATABASE
call :CREATE_PHP_API
call :CREATE_MYSQL_SCHEMA
call :CREATE_HTACCESS
call :CREATE_TS_SERVICE
call :CREATE_DEPLOYMENT_GUIDE

echo.
echo 
echo                  CONFIGURATION TERMIN?E !                   
echo 
echo.
echo  Fichiers cr??s :
echo     hostinger\api\config.php
echo     hostinger\api\database.php
echo     hostinger\api\index.php
echo     hostinger\database\schema.sql
echo     hostinger\.htaccess
echo     hostinger\hostingerService.ts
echo     hostinger\docs\DEPLOIEMENT.md
echo.
echo  Prochaines ?tapes :
echo    1. Lisez : hostinger\docs\DEPLOIEMENT.md
echo    2. Modifiez config.php avec vos infos MySQL
echo    3. Build : npm run build
echo    4. Upload sur Hostinger
echo.
pause
goto :EOF

:CREATE_PHP_CONFIG
(
echo ^<?php
echo define('DB_HOST', 'localhost'^);
echo define('DB_NAME', 'u123456789_blanchisserie'^);
echo define('DB_USER', 'u123456789_admin'^);
echo define('DB_PASS', 'VotreMotDePasseSecurise'^);
echo define('DB_CHARSET', 'utf8mb4'^);
echo define('ALLOWED_ORIGINS', ['https://votre-domaine.com', 'http://localhost:3000']^);
echo define('API_VERSION', '1.0.0'^);
echo define('TIMEZONE', 'Europe/Paris'^);
echo define('DEBUG_MODE', false^);
echo if ^(DEBUG_MODE^) { error_reporting^(E_ALL^); ini_set('display_errors', 1^); }
echo else { error_reporting^(0^); ini_set('display_errors', 0^); }
echo date_default_timezone_set^(TIMEZONE^);
) > hostinger\api\config.php
echo     config.php
goto :EOF

:CREATE_PHP_DATABASE
(
echo ^<?php
echo require_once 'config.php';
echo class Database {
echo     private static $instance = null;
echo     private $conn;
echo     private function __construct^(^) {
echo         try {
echo             $dsn = "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET;
echo             $this-^>conn = new PDO^($dsn, DB_USER, DB_PASS^);
echo             $this-^>conn-^>setAttribute^(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION^);
echo             $this-^>conn-^>setAttribute^(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC^);
echo         } catch^(PDOException $e^) {
echo             die^(json_encode^(['error' =^> 'Database connection failed']^)^);
echo         }
echo     }
echo     public static function getInstance^(^) {
echo         if ^(self::$instance === null^) { self::$instance = new Database^(^); }
echo         return self::$instance;
echo     }
echo     public function getConnection^(^) { return $this-^>conn; }
echo }
) > hostinger\api\database.php
echo     database.php
goto :EOF

:CREATE_PHP_API
powershell -Command "$api = @'^<?php`nheader('Content-Type: application/json');`nheader('Access-Control-Allow-Origin: *');`nheader('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');`nheader('Access-Control-Allow-Headers: Content-Type');`nif ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }`nrequire_once 'database.php';`n$db = Database::getInstance()->getConnection();`n$method = $_SERVER['REQUEST_METHOD'];`n$path = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));`n$entity = $path[0] ?? null;`n$id = $path[1] ?? null;`ntry {`n    switch ($entity) {`n        case 'customers': handleCustomers($db, $method, $id); break;`n        case 'orders': handleOrders($db, $method, $id); break;`n        case 'services': handleServices($db, $method, $id); break;`n        case 'employees': handleEmployees($db, $method, $id); break;`n        case 'inventory': handleInventory($db, $method, $id); break;`n        case 'invoices': handleInvoices($db, $method, $id); break;`n        default: http_response_code(404); echo json_encode(['error' => 'Not found']); break;`n    }`n} catch (Exception $e) {`n    http_response_code(500);`n    echo json_encode(['error' => $e->getMessage()]);`n}`nfunction handleCustomers($db, $method, $id) {`n    switch ($method) {`n        case 'GET':`n            if ($id) {`n                $stmt = $db->prepare(\"SELECT * FROM customers WHERE id = ?\");`n                $stmt->execute([$id]);`n                echo json_encode($stmt->fetch());`n            } else {`n                $stmt = $db->query(\"SELECT * FROM customers ORDER BY created_at DESC\");`n                echo json_encode($stmt->fetchAll());`n            }`n            break;`n        case 'POST':`n            $input = json_decode(file_get_contents('php://input'), true);`n            $stmt = $db->prepare(\"INSERT INTO customers (name, email, phone, address, city, postal_code, notes) VALUES (?, ?, ?, ?, ?, ?, ?)\");`n            $stmt->execute([$input['name'], $input['email'], $input['phone'], $input['address'], $input['city'], $input['postalCode'], $input['notes']]);`n            echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Created']);`n            break;`n        case 'PUT':`n            $input = json_decode(file_get_contents('php://input'), true);`n            $stmt = $db->prepare(\"UPDATE customers SET name=?, email=?, phone=?, address=?, city=?, postal_code=?, notes=? WHERE id=?\");`n            $stmt->execute([$input['name'], $input['email'], $input['phone'], $input['address'], $input['city'], $input['postalCode'], $input['notes'], $id]);`n            echo json_encode(['message' => 'Updated']);`n            break;`n        case 'DELETE':`n            $stmt = $db->prepare(\"DELETE FROM customers WHERE id=?\");`n            $stmt->execute([$id]);`n            echo json_encode(['message' => 'Deleted']);`n            break;`n    }`n}`nfunction handleOrders($db, $method, $id) {`n    switch ($method) {`n        case 'GET':`n            if ($id) {`n                $stmt = $db->prepare(\"SELECT o.*, c.name as customer_name FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id = ?\");`n                $stmt->execute([$id]);`n                $order = $stmt->fetch();`n                $stmt = $db->prepare(\"SELECT * FROM order_services WHERE order_id = ?\");`n                $stmt->execute([$id]);`n                $order['services'] = $stmt->fetchAll();`n                echo json_encode($order);`n            } else {`n                $stmt = $db->query(\"SELECT o.*, c.name as customer_name FROM orders o LEFT JOIN customers c ON o.customer_id = c.id ORDER BY o.created_at DESC\");`n                echo json_encode($stmt->fetchAll());`n            }`n            break;`n        case 'POST':`n            $input = json_decode(file_get_contents('php://input'), true);`n            $db->beginTransaction();`n            $stmt = $db->prepare(\"INSERT INTO orders (customer_id, status, total_amount, paid, payment_method, notes, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)\");`n            $stmt->execute([$input['customerId'], $input['status'], $input['totalAmount'], $input['paid'] ? 1 : 0, $input['paymentMethod'], $input['notes'], $input['dueDate']]);`n            $orderId = $db->lastInsertId();`n            foreach ($input['services'] as $service) {`n                $stmt = $db->prepare(\"INSERT INTO order_services (order_id, service_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)\");`n                $stmt->execute([$orderId, $service['id'], $service['quantity'], $service['price'], $service['price'] * $service['quantity']]);`n            }`n            $db->commit();`n            echo json_encode(['id' => $orderId, 'message' => 'Created']);`n            break;`n        case 'PUT':`n            $input = json_decode(file_get_contents('php://input'), true);`n            $stmt = $db->prepare(\"UPDATE orders SET status=?, total_amount=?, paid=?, payment_method=?, notes=?, due_date=? WHERE id=?\");`n            $stmt->execute([$input['status'], $input['totalAmount'], $input['paid'] ? 1 : 0, $input['paymentMethod'], $input['notes'], $input['dueDate'], $id]);`n            echo json_encode(['message' => 'Updated']);`n            break;`n        case 'DELETE':`n            $stmt = $db->prepare(\"DELETE FROM orders WHERE id=?\");`n            $stmt->execute([$id]);`n            echo json_encode(['message' => 'Deleted']);`n            break;`n    }`n}`nfunction handleServices($db, $method, $id) {`n    if ($method === 'GET') {`n        $stmt = $db->query(\"SELECT * FROM services ORDER BY name\");`n        echo json_encode($stmt->fetchAll());`n    }`n}`nfunction handleEmployees($db, $method, $id) {`n    if ($method === 'GET') {`n        $stmt = $db->query(\"SELECT * FROM employees ORDER BY name\");`n        echo json_encode($stmt->fetchAll());`n    }`n}`nfunction handleInventory($db, $method, $id) {`n    switch ($method) {`n        case 'GET':`n            $stmt = $db->query(\"SELECT * FROM inventory_items ORDER BY name\");`n            echo json_encode($stmt->fetchAll());`n            break;`n        case 'PUT':`n            $input = json_decode(file_get_contents('php://input'), true);`n            $stmt = $db->prepare(\"UPDATE inventory_items SET quantity=?, reorder_level=? WHERE id=?\");`n            $stmt->execute([$input['quantity'], $input['reorderLevel'], $id]);`n            echo json_encode(['message' => 'Updated']);`n            break;`n    }`n}`nfunction handleInvoices($db, $method, $id) {`n    if ($method === 'GET') {`n        $stmt = $db->query(\"SELECT i.*, c.name as customer_name FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id ORDER BY i.created_at DESC\");`n        echo json_encode($stmt->fetchAll());`n    }`n}'^@; $api | Out-File -FilePath 'hostinger\api\index.php' -Encoding UTF8"
echo     index.php (API REST compl?te)
goto :EOF

:CREATE_MYSQL_SCHEMA
(
echo -- Schema MySQL pour Hostinger
echo SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
echo SET time_zone = "+00:00";
echo.
echo CREATE TABLE IF NOT EXISTS customers ^(
echo   id INT AUTO_INCREMENT PRIMARY KEY,
echo   name VARCHAR^(255^) NOT NULL,
echo   email VARCHAR^(255^) UNIQUE NOT NULL,
echo   phone VARCHAR^(50^),
echo   address TEXT,
echo   city VARCHAR^(100^),
echo   postal_code VARCHAR^(20^),
echo   notes TEXT,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
echo   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
echo   INDEX idx_email ^(email^)
echo ^) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
echo.
echo CREATE TABLE IF NOT EXISTS employees ^(
echo   id INT AUTO_INCREMENT PRIMARY KEY,
echo   name VARCHAR^(255^) NOT NULL,
echo   role ENUM^('gerant','operateur','comptoir','livreur'^) NOT NULL,
echo   email VARCHAR^(255^) UNIQUE NOT NULL,
echo   phone VARCHAR^(50^),
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
echo.
echo CREATE TABLE IF NOT EXISTS services ^(
echo   id INT AUTO_INCREMENT PRIMARY KEY,
echo   name VARCHAR^(255^) NOT NULL,
echo   price DECIMAL^(10,2^) NOT NULL,
echo   description TEXT,
echo   estimated_time INT DEFAULT 0,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
echo.
echo CREATE TABLE IF NOT EXISTS inventory_items ^(
echo   id INT AUTO_INCREMENT PRIMARY KEY,
echo   name VARCHAR^(255^) NOT NULL,
echo   quantity DECIMAL^(10,2^) NOT NULL DEFAULT 0,
echo   unit VARCHAR^(50^) NOT NULL,
echo   reorder_level DECIMAL^(10,2^) NOT NULL DEFAULT 0,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
echo.
echo CREATE TABLE IF NOT EXISTS orders ^(
echo   id INT AUTO_INCREMENT PRIMARY KEY,
echo   customer_id INT NOT NULL,
echo   status ENUM^('en_attente','en_traitement','lavage','sechage','pliage','pret','livre','annule'^) DEFAULT 'en_attente',
echo   total_amount DECIMAL^(10,2^) NOT NULL DEFAULT 0,
echo   paid BOOLEAN DEFAULT FALSE,
echo   payment_method ENUM^('cash','card','transfer','check'^),
echo   notes TEXT,
echo   due_date DATETIME,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
echo   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
echo   FOREIGN KEY ^(customer_id^) REFERENCES customers^(id^) ON DELETE CASCADE
echo ^) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
echo.
echo CREATE TABLE IF NOT EXISTS order_services ^(
echo   id INT AUTO_INCREMENT PRIMARY KEY,
echo   order_id INT NOT NULL,
echo   service_id INT NOT NULL,
echo   quantity INT NOT NULL DEFAULT 1,
echo   unit_price DECIMAL^(10,2^) NOT NULL,
echo   total_price DECIMAL^(10,2^) NOT NULL,
echo   FOREIGN KEY ^(order_id^) REFERENCES orders^(id^) ON DELETE CASCADE,
echo   FOREIGN KEY ^(service_id^) REFERENCES services^(id^) ON DELETE CASCADE
echo ^) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
echo.
echo CREATE TABLE IF NOT EXISTS invoices ^(
echo   id INT AUTO_INCREMENT PRIMARY KEY,
echo   invoice_number VARCHAR^(100^) UNIQUE NOT NULL,
echo   order_id INT NOT NULL,
echo   customer_id INT NOT NULL,
echo   issue_date DATE NOT NULL,
echo   due_date DATE NOT NULL,
echo   subtotal DECIMAL^(10,2^) DEFAULT 0,
echo   tax DECIMAL^(10,2^) DEFAULT 0,
echo   discount DECIMAL^(10,2^) DEFAULT 0,
echo   total DECIMAL^(10,2^) DEFAULT 0,
echo   notes TEXT,
echo   status ENUM^('draft','sent','paid','overdue','cancelled'^) DEFAULT 'draft',
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
echo   FOREIGN KEY ^(order_id^) REFERENCES orders^(id^) ON DELETE CASCADE,
echo   FOREIGN KEY ^(customer_id^) REFERENCES customers^(id^) ON DELETE CASCADE
echo ^) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
echo.
echo CREATE TABLE IF NOT EXISTS client_access ^(
echo   id INT AUTO_INCREMENT PRIMARY KEY,
echo   customer_id INT NOT NULL,
echo   access_code VARCHAR^(50^) UNIQUE NOT NULL,
echo   is_active BOOLEAN DEFAULT TRUE,
echo   last_login DATETIME,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
echo   FOREIGN KEY ^(customer_id^) REFERENCES customers^(id^) ON DELETE CASCADE
echo ^) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
echo.
echo CREATE TABLE IF NOT EXISTS service_packs ^(
echo   id INT AUTO_INCREMENT PRIMARY KEY,
echo   name VARCHAR^(255^) NOT NULL,
echo   description TEXT,
echo   total_price DECIMAL^(10,2^) NOT NULL,
echo   estimated_time INT DEFAULT 0,
echo   is_active BOOLEAN DEFAULT TRUE,
echo   category ENUM^('standard','express','premium','literie','professionnel'^) DEFAULT 'standard',
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
) > hostinger\database\schema.sql
echo     schema.sql (9 tables)
goto :EOF

:CREATE_HTACCESS
(
echo RewriteEngine On
echo RewriteBase /
echo ErrorDocument 404 /index.html
echo RewriteCond %%{REQUEST_FILENAME} !-f
echo RewriteCond %%{REQUEST_FILENAME} !-d
echo RewriteCond %%{REQUEST_URI} !^/api/
echo RewriteRule . /index.html [L]
echo ^<IfModule mod_deflate.c^>
echo   AddOutputFilterByType DEFLATE text/html text/css application/javascript
echo ^</IfModule^>
) > hostinger\.htaccess
echo     .htaccess
goto :EOF

:CREATE_TS_SERVICE
(
echo // Service Hostinger - src/services/hostingerService.ts
echo import { Customer, Order, Service, Employee, InventoryItem, Invoice } from '../types';
echo.
echo const API_BASE_URL = import.meta.env.VITE_HOSTINGER_API_URL ^|^| 'https://votre-domaine.com/api';
echo.
echo class HostingerService {
echo   private async request^(endpoint: string, options?: RequestInit^) {
echo     const response = await fetch^(`${API_BASE_URL}${endpoint}`, {
echo       ...options, headers: { 'Content-Type': 'application/json', ...options?.headers }
echo     }^);
echo     if ^(!response.ok^) throw new Error^(`API Error: ${response.statusText}`^);
echo     return response.json^(^);
echo   }
echo   async getCustomers^(^) { return this.request^('/customers'^); }
echo   async createCustomer^(data: any^) { return this.request^('/customers', { method: 'POST', body: JSON.stringify^(data^) }^); }
echo   async updateCustomer^(id: string, data: any^) { return this.request^(`/customers/${id}`, { method: 'PUT', body: JSON.stringify^(data^) }^); }
echo   async deleteCustomer^(id: string^) { return this.request^(`/customers/${id}`, { method: 'DELETE' }^); }
echo   async getOrders^(^) { return this.request^('/orders'^); }
echo   async createOrder^(data: any^) { return this.request^('/orders', { method: 'POST', body: JSON.stringify^(data^) }^); }
echo   async updateOrder^(id: string, data: any^) { return this.request^(`/orders/${id}`, { method: 'PUT', body: JSON.stringify^(data^) }^); }
echo   async deleteOrder^(id: string^) { return this.request^(`/orders/${id}`, { method: 'DELETE' }^); }
echo   async getServices^(^) { return this.request^('/services'^); }
echo   async getEmployees^(^) { return this.request^('/employees'^); }
echo   async getInventory^(^) { return this.request^('/inventory'^); }
echo   async updateInventoryItem^(id: string, data: any^) { return this.request^(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify^(data^) }^); }
echo   async getInvoices^(^) { return this.request^('/invoices'^); }
echo }
echo export const hostingerService = new HostingerService^(^);
) > hostinger\hostingerService.ts
echo     hostingerService.ts
goto :EOF

:CREATE_DEPLOYMENT_GUIDE
(
echo #  GUIDE DEPLOIEMENT HOSTINGER
echo.
echo ## ETAPE 1 : Build
echo npm install --legacy-peer-deps
echo npm run build
echo.
echo ## ETAPE 2 : Base de donn?es MySQL
echo 1. hPanel ^> Bases de donn?es ^> MySQL ^> Cr?er
echo 2. Notez : nom, user, password, host
echo 3. phpMyAdmin ^> Import ^> schema.sql
echo.
echo ## ETAPE 3 : Configuration API
echo Editez hostinger/api/config.php avec vos infos MySQL
echo.
echo ## ETAPE 4 : Upload
echo A. public_html/ ^<- Tout le contenu de dist/
echo B. public_html/api/ ^<- Tous les fichiers de hostinger/api/
echo C. public_html/.htaccess ^<- hostinger/.htaccess
echo.
echo ## ETAPE 5 : Permissions
echo - Dossiers : 755
echo - Fichiers PHP : 644
echo.
echo ## ETAPE 6 : Variables d'environnement
echo Cr?ez .env.production :
echo VITE_HOSTINGER_API_URL=https://votre-domaine.com/api
echo.
echo Puis rebuild : npm run build
echo.
echo ## ETAPE 7 : SSL
echo hPanel ^> S?curit? ^> SSL ^> Activer ^+ Forcer HTTPS
echo.
echo ## ETAPE 8 : Test
echo https://votre-domaine.com
echo https://votre-domaine.com/api/customers
echo.
echo ## Structure finale :
echo public_html/
echo   index.html
echo   .htaccess
echo   assets/
echo   api/
echo     config.php
echo     database.php
echo     index.php
) > hostinger\docs\DEPLOIEMENT.md
echo     DEPLOIEMENT.md
goto :EOF
