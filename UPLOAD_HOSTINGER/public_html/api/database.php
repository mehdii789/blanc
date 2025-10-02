<?php
require_once 'config.php';
class Database {
    private static $instance = null;
    private $conn;
    private function __construct() {
        try {
            $dsn = "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET;
            $this->conn = new PDO($dsn, DB_USER, DB_PASS);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            die(json_encode(['error' => 'Database connection failed']));
        }
    }
    public static function getInstance() {
        if (self::$instance === null) { self::$instance = new Database(); }
        return self::$instance;
    }
    public function getConnection() { return $this->conn; }
}
