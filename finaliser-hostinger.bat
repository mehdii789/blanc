@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║        🚀 FINALISATION HOSTINGER - AUTOMATIQUE              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 📋 Création de index.php...
(
echo ^<?php
echo header^('Content-Type: application/json'^);
echo header^('Access-Control-Allow-Origin: *'^);
echo header^('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'^);
echo header^('Access-Control-Allow-Headers: Content-Type, Authorization'^);
echo.
echo if ^($_SERVER['REQUEST_METHOD'] === 'OPTIONS'^) {
echo     http_response_code^(200^);
echo     exit^(^);
echo }
echo.
echo require_once 'database.php';
echo.
echo $db = Database::getInstance^(^)-^>getConnection^(^);
echo $method = $_SERVER['REQUEST_METHOD'];
echo $path = explode^('/', trim^($_SERVER['PATH_INFO'] ?? '', '/'^)^);
echo $entity = $path[0] ?? null;
echo $id = $path[1] ?? null;
echo.
echo try {
echo     switch ^($entity^) {
echo         case 'customers': handleCustomers^($db, $method, $id^); break;
echo         case 'orders': handleOrders^($db, $method, $id^); break;
echo         case 'services': handleServices^($db, $method, $id^); break;
echo         case 'employees': handleEmployees^($db, $method, $id^); break;
echo         case 'inventory': handleInventory^($db, $method, $id^); break;
echo         case 'invoices': handleInvoices^($db, $method, $id^); break;
echo         case 'client-access': handleClientAccess^($db, $method, $id^); break;
echo         case 'service-packs': handleServicePacks^($db, $method, $id^); break;
echo         default:
echo             http_response_code^(404^);
echo             echo json_encode^(['error' =^> 'Not found']^);
echo             break;
echo     }
echo } catch ^(Exception $e^) {
echo     http_response_code^(500^);
echo     echo json_encode^(['error' =^> $e-^>getMessage^(^)]^);
echo }
echo.
echo function handleCustomers^($db, $method, $id^) {
echo     switch ^($method^) {
echo         case 'GET':
echo             if ^($id^) {
echo                 $stmt = $db-^>prepare^("SELECT * FROM customers WHERE id = ?"^);
echo                 $stmt-^>execute^([$id]^);
echo                 echo json_encode^($stmt-^>fetch^(^)^);
echo             } else {
echo                 $stmt = $db-^>query^("SELECT * FROM customers ORDER BY created_at DESC"^);
echo                 echo json_encode^($stmt-^>fetchAll^(^)^);
echo             }
echo             break;
echo         case 'POST':
echo             $input = json_decode^(file_get_contents^('php://input'^), true^);
echo             $stmt = $db-^>prepare^("INSERT INTO customers ^(name, email, phone, address, city, postal_code, notes^) VALUES ^(?, ?, ?, ?, ?, ?, ?^)"^);
echo             $stmt-^>execute^([$input['name'], $input['email'], $input['phone'] ?? '', $input['address'] ?? '', $input['city'] ?? '', $input['postalCode'] ?? '', $input['notes'] ?? '']^);
echo             echo json_encode^(['id' =^> $db-^>lastInsertId^(^), 'message' =^> 'Created']^);
echo             break;
echo         case 'PUT':
echo             $input = json_decode^(file_get_contents^('php://input'^), true^);
echo             $stmt = $db-^>prepare^("UPDATE customers SET name=?, email=?, phone=?, address=?, city=?, postal_code=?, notes=? WHERE id=?"^);
echo             $stmt-^>execute^([$input['name'], $input['email'], $input['phone'], $input['address'], $input['city'], $input['postalCode'], $input['notes'], $id]^);
echo             echo json_encode^(['message' =^> 'Updated']^);
echo             break;
echo         case 'DELETE':
echo             $stmt = $db-^>prepare^("DELETE FROM customers WHERE id=?"^);
echo             $stmt-^>execute^([$id]^);
echo             echo json_encode^(['message' =^> 'Deleted']^);
echo             break;
echo     }
echo }
echo.
echo function handleOrders^($db, $method, $id^) {
echo     switch ^($method^) {
echo         case 'GET':
echo             if ^($id^) {
echo                 $stmt = $db-^>prepare^("SELECT o.*, c.name as customer_name FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id = ?"^);
echo                 $stmt-^>execute^([$id]^);
echo                 $order = $stmt-^>fetch^(^);
echo                 $stmt = $db-^>prepare^("SELECT os.*, s.name FROM order_services os LEFT JOIN services s ON os.service_id = s.id WHERE os.order_id = ?"^);
echo                 $stmt-^>execute^([$id]^);
echo                 $order['services'] = $stmt-^>fetchAll^(^);
echo                 echo json_encode^($order^);
echo             } else {
echo                 $stmt = $db-^>query^("SELECT o.*, c.name as customer_name FROM orders o LEFT JOIN customers c ON o.customer_id = c.id ORDER BY o.created_at DESC"^);
echo                 echo json_encode^($stmt-^>fetchAll^(^)^);
echo             }
echo             break;
echo         case 'POST':
echo             $input = json_decode^(file_get_contents^('php://input'^), true^);
echo             $db-^>beginTransaction^(^);
echo             $stmt = $db-^>prepare^("INSERT INTO orders ^(customer_id, status, total_amount, paid, payment_method, notes, due_date^) VALUES ^(?, ?, ?, ?, ?, ?, ?^)"^);
echo             $stmt-^>execute^([$input['customerId'], $input['status'] ?? 'en_attente', $input['totalAmount'], $input['paid'] ? 1 : 0, $input['paymentMethod'] ?? null, $input['notes'] ?? '', $input['dueDate'] ?? null]^);
echo             $orderId = $db-^>lastInsertId^(^);
echo             if ^(isset^($input['services']^)^) {
echo                 foreach ^($input['services'] as $service^) {
echo                     $stmt = $db-^>prepare^("INSERT INTO order_services ^(order_id, service_id, quantity, unit_price, total_price^) VALUES ^(?, ?, ?, ?, ?^)"^);
echo                     $stmt-^>execute^([$orderId, $service['id'], $service['quantity'], $service['price'], $service['price'] * $service['quantity']]^);
echo                 }
echo             }
echo             $db-^>commit^(^);
echo             echo json_encode^(['id' =^> $orderId, 'message' =^> 'Created']^);
echo             break;
echo         case 'PUT':
echo             $input = json_decode^(file_get_contents^('php://input'^), true^);
echo             $stmt = $db-^>prepare^("UPDATE orders SET status=?, total_amount=?, paid=?, payment_method=?, notes=?, due_date=? WHERE id=?"^);
echo             $stmt-^>execute^([$input['status'], $input['totalAmount'], $input['paid'] ? 1 : 0, $input['paymentMethod'], $input['notes'], $input['dueDate'], $id]^);
echo             echo json_encode^(['message' =^> 'Updated']^);
echo             break;
echo         case 'DELETE':
echo             $stmt = $db-^>prepare^("DELETE FROM orders WHERE id=?"^);
echo             $stmt-^>execute^([$id]^);
echo             echo json_encode^(['message' =^> 'Deleted']^);
echo             break;
echo     }
echo }
echo.
echo function handleServices^($db, $method, $id^) {
echo     if ^($method === 'GET'^) {
echo         $stmt = $db-^>query^("SELECT * FROM services ORDER BY name"^);
echo         echo json_encode^($stmt-^>fetchAll^(^)^);
echo     }
echo }
echo.
echo function handleEmployees^($db, $method, $id^) {
echo     if ^($method === 'GET'^) {
echo         $stmt = $db-^>query^("SELECT * FROM employees ORDER BY name"^);
echo         echo json_encode^($stmt-^>fetchAll^(^)^);
echo     }
echo }
echo.
echo function handleInventory^($db, $method, $id^) {
echo     switch ^($method^) {
echo         case 'GET':
echo             $stmt = $db-^>query^("SELECT * FROM inventory_items ORDER BY name"^);
echo             echo json_encode^($stmt-^>fetchAll^(^)^);
echo             break;
echo         case 'PUT':
echo             $input = json_decode^(file_get_contents^('php://input'^), true^);
echo             $stmt = $db-^>prepare^("UPDATE inventory_items SET quantity=?, reorder_level=? WHERE id=?"^);
echo             $stmt-^>execute^([$input['quantity'], $input['reorderLevel'] ?? 0, $id]^);
echo             echo json_encode^(['message' =^> 'Updated']^);
echo             break;
echo     }
echo }
echo.
echo function handleInvoices^($db, $method, $id^) {
echo     if ^($method === 'GET'^) {
echo         $stmt = $db-^>query^("SELECT i.*, c.name as customer_name FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id ORDER BY i.created_at DESC"^);
echo         echo json_encode^($stmt-^>fetchAll^(^)^);
echo     }
echo }
echo.
echo function handleClientAccess^($db, $method, $id^) {
echo     if ^($method === 'GET'^) {
echo         $stmt = $db-^>query^("SELECT ca.*, c.name FROM client_access ca LEFT JOIN customers c ON ca.customer_id = c.id"^);
echo         echo json_encode^($stmt-^>fetchAll^(^)^);
echo     }
echo }
echo.
echo function handleServicePacks^($db, $method, $id^) {
echo     if ^($method === 'GET'^) {
echo         $stmt = $db-^>query^("SELECT * FROM service_packs WHERE is_active = 1"^);
echo         echo json_encode^($stmt-^>fetchAll^(^)^);
echo     }
echo }
) > hostinger\api\index.php
echo    ✅ index.php créé

echo.
echo 📋 Création de .env.production...
(
echo # Configuration Hostinger - Production
echo VITE_HOSTINGER_API_URL=https://votre-domaine.com/api
echo VITE_USE_HOSTINGER=true
echo.
echo # Desactiver Supabase en production
echo VITE_USE_SUPABASE=false
) > .env.production
echo    ✅ .env.production créé

echo.
echo 📋 Création du guide de configuration...
(
echo # CONFIGURATION HOSTINGER - GUIDE COMPLET
echo.
echo ## ETAPE 1 : Creer la base MySQL sur Hostinger
echo 1. hPanel ^> Bases de donnees ^> MySQL ^> Creer
echo 2. Notez : nom, user, password, host
echo.
echo ## ETAPE 2 : Modifier hostinger/api/config.php
echo Remplacez :
echo   - DB_NAME : votre nom de base
echo   - DB_USER : votre utilisateur
echo   - DB_PASS : votre mot de passe
echo   - ALLOWED_ORIGINS : votre domaine
echo.
echo ## ETAPE 3 : Modifier .env.production
echo Remplacez votre-domaine.com par votre vrai domaine
echo.
echo ## ETAPE 4 : Importer schema.sql dans phpMyAdmin
echo.
echo ## ETAPE 5 : Build
echo npm run build
echo.
echo ## ETAPE 6 : Upload sur Hostinger
echo - public_html/ ^<- contenu de dist/
echo - public_html/api/ ^<- fichiers de hostinger/api/
echo - public_html/.htaccess ^<- hostinger/.htaccess
echo.
echo ## ETAPE 7 : Permissions
echo - Dossiers : 755
echo - Fichiers PHP : 644
echo.
echo ## ETAPE 8 : SSL
echo hPanel ^> Securite ^> SSL ^> Activer
) > hostinger\GUIDE-RAPIDE.txt
echo    ✅ Guide créé

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🎉 TOUT EST PRÊT POUR HOSTINGER !              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ✅ Fichiers créés :
echo    - hostinger\api\index.php ^(API REST complete^)
echo    - .env.production ^(config production^)
echo    - hostinger\GUIDE-RAPIDE.txt ^(instructions^)
echo.
echo 📋 Lisez : hostinger\GUIDE-RAPIDE.txt
echo.
echo 💡 Modifiez maintenant :
echo    1. hostinger\api\config.php ^(infos MySQL^)
echo    2. .env.production ^(votre domaine^)
echo.
pause