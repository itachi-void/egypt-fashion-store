<?php

if (PHP_SAPI !== 'cli' || !defined('WP_CLI') || !WP_CLI || !defined('ABSPATH')) {
    exit(1);
}

if (!in_array(wp_get_environment_type(), ['local', 'development', 'staging'], true)) {
    WP_CLI::error('Account verification is restricted to non-production environments.');
}

function efc_verify_account_assert($condition, $message) {
    if (!$condition) {
        WP_CLI::error($message);
    }
    WP_CLI::log('PASS: ' . $message);
}

efc_verify_account_assert(function_exists('wc_get_orders'), 'WooCommerce is loaded.');
efc_verify_account_assert(shortcode_exists('madar_account_link'), 'Madar account link is registered.');

$account_page_id = (int) get_option('woocommerce_myaccount_page_id');
$account_page = get_post($account_page_id);
efc_verify_account_assert(
    $account_page && $account_page->post_status === 'publish'
        && has_shortcode($account_page->post_content, 'woocommerce_my_account'),
    'Published account page contains the native WooCommerce account shortcode.'
);
efc_verify_account_assert(get_option('woocommerce_enable_myaccount_registration') === 'yes', 'Account registration is enabled.');
efc_verify_account_assert(get_option('woocommerce_registration_generate_password') === 'no', 'Customers choose a password during local registration.');
efc_verify_account_assert(get_option('default_role') === 'subscriber', 'Default WordPress registration role is subscriber.');

$customer_ids = [
    filter_var(getenv('MADAR_TEST_CUSTOMER_A'), FILTER_VALIDATE_INT),
    filter_var(getenv('MADAR_TEST_CUSTOMER_B'), FILTER_VALIDATE_INT),
];
efc_verify_account_assert(
    $customer_ids[0] && $customer_ids[1] && $customer_ids[0] !== $customer_ids[1],
    'Two distinct test customer IDs were supplied.'
);

foreach ($customer_ids as $customer_id) {
    $customer = get_userdata($customer_id);
    efc_verify_account_assert($customer && $customer->roles === ['customer'], 'Test user has only the customer role.');
    foreach (['manage_options', 'manage_woocommerce', 'edit_users', 'promote_users', 'edit_others_shop_orders'] as $capability) {
        efc_verify_account_assert(!user_can($customer, $capability), 'Customer lacks privileged capability: ' . $capability);
    }
}

foreach ($customer_ids as $customer_index => $customer_id) {
    $orders = wc_get_orders(['customer_id' => $customer_id, 'limit' => 1, 'orderby' => 'date', 'order' => 'DESC']);
    efc_verify_account_assert(count($orders) === 1, 'Test customer owns an order for the permission check.');
    $order = $orders[0];
    efc_verify_account_assert((int) $order->get_customer_id() === $customer_id, 'Order ownership matches the test customer.');
    efc_verify_account_assert(user_can($customer_id, 'view_order', $order->get_id()), 'Owner can view their order.');
    efc_verify_account_assert(!user_can($customer_ids[1 - $customer_index], 'view_order', $order->get_id()), 'Other customer cannot view the order.');
    efc_verify_account_assert(!user_can(0, 'view_order', $order->get_id()), 'Guest cannot view the account order endpoint.');
}

WP_CLI::success('Read-only account capability checks passed. Browser authentication, reset, addresses and checkout still require separate tests.');
