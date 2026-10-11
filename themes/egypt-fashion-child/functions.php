<?php
/**
 * Egypt Fashion Child Theme Functions
 *
 * @package EgyptFashionChild
 * @version 2.0.1
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

define('MADAR_THEME_VERSION', '2.0.1');

/**
 * Enqueue parent, child and Madar design layer.
 */
function ef_enqueue_theme_styles() {
    $parent_handle = 'twentytwentyfive-style';

    wp_enqueue_style(
        $parent_handle,
        get_template_directory_uri() . '/style.css',
        [],
        wp_get_theme()->parent() ? wp_get_theme()->parent()->get('Version') : '1.0.0'
    );

    wp_enqueue_style(
        'egypt-fashion-child-style',
        get_stylesheet_uri(),
        [$parent_handle],
        MADAR_THEME_VERSION
    );

    wp_enqueue_style(
        'madar-fonts',
        'https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500&family=Noto+Naskh+Arabic:wght@400;500&display=swap',
        [],
        null
    );

    wp_enqueue_style(
        'madar',
        get_stylesheet_directory_uri() . '/assets/madar.css',
        ['egypt-fashion-child-style', 'madar-fonts'],
        MADAR_THEME_VERSION
    );

    wp_enqueue_script(
        'madar',
        get_stylesheet_directory_uri() . '/assets/madar.js',
        [],
        MADAR_THEME_VERSION,
        ['in_footer' => true, 'strategy' => 'defer']
    );
}
add_action('wp_enqueue_scripts', 'ef_enqueue_theme_styles', 20);

/**
 * Declare WooCommerce theme support features.
 */
function ef_add_woocommerce_support() {
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
}
add_action('after_setup_theme', 'ef_add_woocommerce_support');

require_once __DIR__ . '/storefront.php';
require_once __DIR__ . '/commerce.php';
