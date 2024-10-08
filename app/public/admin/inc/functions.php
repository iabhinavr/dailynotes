<?php

function set_app_timezone() {
    date_default_timezone_set('Asia/Kolkata');
}

set_app_timezone();

function get_template($template_name) {
    ob_start();

    include 'templates/' . $template_name . '.php';

    $template_content = ob_get_clean();

    echo $template_content;
}

function get_home_url() {
    return "http://dailynotes.local:9084";
}

function generate_csrf_token() {
    if(!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
}

function validate_csrf_token($token) {
    if(!isset($_SESSION['csrf_token']) || $token !== $_SESSION['csrf_token']) {
        return ["status" => false, "result" => "Invalid token"];
    }
    return ["status" => true, "result" => "Token validated"];
}

function esc_html($string) {
    if(empty($string)) {
        $string = '';
    }
    return htmlspecialchars($string, ENT_QUOTES, "UTF-8");
}