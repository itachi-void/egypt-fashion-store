<?php
/**
 * Plugin Name: Egypt Fashion Core
 * Plugin URI: https://github.com/itachi-void/egypt-fashion-store
 * Description: إضافة الوظائف المخصصة لمتجر الأزياء المصري (تخصيص العملة المصرية، التحقق من الحقول، وتخصيصات المتجر).
 * Version: 1.0.0
 * Author: Egypt Fashion Team
 * Text Domain: egypt-fashion-core
 * Requires at least: 6.0
 * Requires PHP: 8.0
 */

if (!defined('ABSPATH')) {
    exit; // خروج في حال الوصول المباشر
}

/**
 * تخصيص رمز العملة المصرية في ووكومرس لضمان العرض العربي السليم.
 *
 * @param string $currency_symbol رمز العملة الحالي
 * @param string $currency كود العملة (EGP)
 * @return string رمز العملة المعرب
 */
function efc_custom_egp_currency_symbol($currency_symbol, $currency) {
    if ($currency === 'EGP') {
        return 'ج.م';
    }
    return $currency_symbol;
}
add_filter('woocommerce_currency_symbol', 'efc_custom_egp_currency_symbol', 10, 2);

/**
 * تخصيص وتعديل نصوص حقول إتمام الطلب (Checkout) للتوافق مع السوق المصري.
 *
 * @param array $fields حقول إتمام الطلب
 * @return array الحقول المحدثة
 */
function efc_customize_checkout_fields($fields) {
    if (isset($fields['billing']['billing_phone'])) {
        $fields['billing']['billing_phone']['placeholder'] = '01xxxxxxxxx';
        $fields['billing']['billing_phone']['label'] = 'رقم الهاتف (للتواصل والتوصيل)';
    }

    if (isset($fields['billing']['billing_city'])) {
        $fields['billing']['billing_city']['label'] = 'المدينة / المركز';
    }

    return $fields;
}
add_filter('woocommerce_checkout_fields', 'efc_customize_checkout_fields');

/**
 * التحقق من صحة رقم الهاتف المصري عند إتمام الطلب.
 */
function efc_normalize_phone($phone) {
    $phone = strtr(trim((string) $phone), [
        '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
        '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
        '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
    ]);
    $phone = preg_replace('/[\s()\-]+/u', '', $phone);
    if (strpos($phone, '+20') === 0) {
        $phone = '0' . substr($phone, 3);
    } elseif (strpos($phone, '0020') === 0) {
        $phone = '0' . substr($phone, 4);
    }
    return $phone;
}

function efc_validate_egyptian_phone_number($data, $errors) {
    if (($data['billing_country'] ?? '') !== 'EG') {
        return;
    }
    $phone = efc_normalize_phone($data['billing_phone'] ?? '');
    if ($phone !== '' && !preg_match('/^01[0125][0-9]{8}$/', $phone)) {
        $errors->add('efc_invalid_phone', 'يرجى إدخال رقم محمول مصري صحيح، مثل 01012345678 أو +201012345678.');
    }
}
add_action('woocommerce_after_checkout_validation', 'efc_validate_egyptian_phone_number', 10, 2);

function efc_normalize_checkout_phone($data) {
    if (($data['billing_country'] ?? '') === 'EG') {
        $data['billing_phone'] = efc_normalize_phone($data['billing_phone'] ?? '');
    }
    return $data;
}
add_filter('woocommerce_checkout_posted_data', 'efc_normalize_checkout_phone');

function efc_validate_store_api_phone($order, $request) {
    if ($order->get_billing_country() !== 'EG') {
        return;
    }
    $phone = efc_normalize_phone($order->get_billing_phone());
    if ($phone === '' || !preg_match('/^01[0125][0-9]{8}$/', $phone)) {
        throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException(
            'efc_invalid_phone',
            'يرجى إدخال رقم محمول مصري صحيح، مثل 01012345678 أو +201012345678.',
            400
        );
    }
    $order->set_billing_phone($phone);
}
add_action('woocommerce_store_api_checkout_update_order_from_request', 'efc_validate_store_api_phone', 10, 2);
