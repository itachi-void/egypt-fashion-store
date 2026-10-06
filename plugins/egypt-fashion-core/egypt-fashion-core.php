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
function efc_validate_egyptian_phone_number() {
    if (isset($_POST['billing_phone'])) {
        $phone = sanitize_text_field(wp_unslash($_POST['billing_phone']));
        $clean_phone = preg_replace('/[^0-9]/', '', $phone);
        
        // التحقق من أن الرقم يبدأ بـ 01 ويتكون من 11 رقمًا
        if (!empty($clean_phone) && !preg_match('/^01[0125][0-9]{8}$/', $clean_phone)) {
            wc_add_notice('يرجى إدخال رقم هاتف محمول مصري صحيح يبدأ بـ 01 ويتكون من 11 رقمًا.', 'error');
        }
    }
}
add_action('woocommerce_checkout_process', 'efc_validate_egyptian_phone_number');
