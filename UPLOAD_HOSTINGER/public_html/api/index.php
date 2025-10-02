<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'database.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$path = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$entity = $path[0] ?? null;
$id = $path[1] ?? null;

try {
    switch ($entity) {
        case 'customers': handleCustomers($db, $method, $id); break;
        case 'orders': handleOrders($db, $method, $id); break;
        case 'services': handleServices($db, $method, $id); break;
        case 'employees': handleEmployees($db, $method, $id); break;
        case 'inventory': handleInventory($db, $method, $id); break;
        case 'invoices': handleInvoices($db, $method, $id); break;
        case 'client-access': handleClientAccess($db, $method, $id); break;
        case 'service-packs': handleServicePacks($db, $method, $id); break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleCustomers($db, $method, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $db->prepare("SELECT * FROM customers WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode($stmt->fetch());
            } else {
                $stmt = $db->query("SELECT * FROM customers ORDER BY created_at DESC");
                echo json_encode($stmt->fetchAll());
            }
            break;
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("INSERT INTO customers ^(name, email, phone, address, city, postal_code, notes^) VALUES ^(?, ?, ?, ?, ?, ?, ?^)");
            $stmt->execute([$input['name'], $input['email'], $input['phone'] ?? '', $input['address'] ?? '', $input['city'] ?? '', $input['postalCode'] ?? '', $input['notes'] ?? '']);
            echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Created']);
            break;
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("UPDATE customers SET name=?, email=?, phone=?, address=?, city=?, postal_code=?, notes=? WHERE id=?");
            $stmt->execute([$input['name'], $input['email'], $input['phone'], $input['address'], $input['city'], $input['postalCode'], $input['notes'], $id]);
            echo json_encode(['message' => 'Updated']);
            break;
        case 'DELETE':
            $stmt = $db->prepare("DELETE FROM customers WHERE id=?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Deleted']);
            break;
    }
}

function handleOrders($db, $method, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $db->prepare("SELECT o.*, c.name as customer_name FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id = ?");
                $stmt->execute([$id]);
                $order = $stmt->fetch();
                $stmt = $db->prepare("SELECT os.*, s.name FROM order_services os LEFT JOIN services s ON os.service_id = s.id WHERE os.order_id = ?");
                $stmt->execute([$id]);
                $order['services'] = $stmt->fetchAll();
                echo json_encode($order);
            } else {
                $stmt = $db->query("SELECT o.*, c.name as customer_name FROM orders o LEFT JOIN customers c ON o.customer_id = c.id ORDER BY o.created_at DESC");
                echo json_encode($stmt->fetchAll());
            }
            break;
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            $db->beginTransaction();
            $stmt = $db->prepare("INSERT INTO orders ^(customer_id, status, total_amount, paid, payment_method, notes, due_date^) VALUES ^(?, ?, ?, ?, ?, ?, ?^)");
            $stmt->execute([$input['customerId'], $input['status'] ?? 'en_attente', $input['totalAmount'], $input['paid'] ? 1 : 0, $input['paymentMethod'] ?? null, $input['notes'] ?? '', $input['dueDate'] ?? null]);
            $orderId = $db->lastInsertId();
            if (isset($input['services'])) {
                foreach ($input['services'] as $service) {
                    $stmt = $db->prepare("INSERT INTO order_services ^(order_id, service_id, quantity, unit_price, total_price^) VALUES ^(?, ?, ?, ?, ?^)");
                    $stmt->execute([$orderId, $service['id'], $service['quantity'], $service['price'], $service['price'] * $service['quantity']]);
                }
            }
            $db->commit();
            echo json_encode(['id' => $orderId, 'message' => 'Created']);
            break;
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("UPDATE orders SET status=?, total_amount=?, paid=?, payment_method=?, notes=?, due_date=? WHERE id=?");
            $stmt->execute([$input['status'], $input['totalAmount'], $input['paid'] ? 1 : 0, $input['paymentMethod'], $input['notes'], $input['dueDate'], $id]);
            echo json_encode(['message' => 'Updated']);
            break;
        case 'DELETE':
            $stmt = $db->prepare("DELETE FROM orders WHERE id=?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Deleted']);
            break;
    }
}

function handleServices($db, $method, $id) {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM services ORDER BY name");
        echo json_encode($stmt->fetchAll());
    }
}

function handleEmployees($db, $method, $id) {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM employees ORDER BY name");
        echo json_encode($stmt->fetchAll());
    }
}

function handleInventory($db, $method, $id) {
    switch ($method) {
        case 'GET':
            $stmt = $db->query("SELECT * FROM inventory_items ORDER BY name");
            echo json_encode($stmt->fetchAll());
            break;
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("UPDATE inventory_items SET quantity=?, reorder_level=? WHERE id=?");
            $stmt->execute([$input['quantity'], $input['reorderLevel'] ?? 0, $id]);
            echo json_encode(['message' => 'Updated']);
            break;
    }
}

function handleInvoices($db, $method, $id) {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT i.*, c.name as customer_name FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id ORDER BY i.created_at DESC");
        echo json_encode($stmt->fetchAll());
    }
}

function handleClientAccess($db, $method, $id) {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT ca.*, c.name FROM client_access ca LEFT JOIN customers c ON ca.customer_id = c.id");
        echo json_encode($stmt->fetchAll());
    }
}

function handleServicePacks($db, $method, $id) {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM service_packs WHERE is_active = 1");
        echo json_encode($stmt->fetchAll());
    }
}
