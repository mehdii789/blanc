<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'blanchisserie');
define('DB_USER', 'Blanc_admin');
define('DB_PASS', 'a8VFD@w#IO2*');
define('DB_CHARSET', 'utf8mb4');
define('ALLOWED_ORIGINS', ['https://brown-coyote-823292.hostingersite.com', 'http://localhost:3000']);
define('API_VERSION', '1.0.0');
define('TIMEZONE', 'Europe/Paris');
define('DEBUG_MODE', false);
if (DEBUG_MODE) { error_reporting(E_ALL); ini_set('display_errors', 1); }
else { error_reporting(0); ini_set('display_errors', 0); }
date_default_timezone_set(TIMEZONE);
