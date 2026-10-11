<?php

if (!defined('ABSPATH')) {
    exit;
}

function efc_account_link_shortcode() {
    if (!function_exists('wc_get_page_permalink')) {
        return '';
    }

    $account_url = wc_get_page_permalink('myaccount');
    if (!$account_url) {
        return '';
    }

    $label = is_user_logged_in()
        ? __('حسابي', 'egypt-fashion-core')
        : __('دخول / إنشاء حساب', 'egypt-fashion-core');

    return '<a class="madar-account-link" href="' . esc_url($account_url) . '">'
        . esc_html($label) . '</a>';
}
add_shortcode('madar_account_link', 'efc_account_link_shortcode');

function efc_account_login_intro() {
    echo '<h2>' . esc_html__('حسابك في مدار', 'egypt-fashion-core') . '</h2>';
    echo '<p>' . esc_html__('سجّل الدخول لمتابعة طلباتك وإدارة عناوينك وبيانات حسابك.', 'egypt-fashion-core') . '</p>';
}
add_action('woocommerce_before_customer_login_form', 'efc_account_login_intro');

function efc_account_dashboard_intro() {
    if (!is_user_logged_in()) {
        return;
    }

    $customer = wp_get_current_user();
    $name = $customer->first_name ?: $customer->display_name;

    echo '<p>' . esc_html(sprintf(
        __('أهلًا %s، من هنا تقدر تتابع طلباتك وتحدّث عناوينك وبياناتك.', 'egypt-fashion-core'),
        $name
    )) . '</p>';
}
add_action('woocommerce_account_dashboard', 'efc_account_dashboard_intro');
