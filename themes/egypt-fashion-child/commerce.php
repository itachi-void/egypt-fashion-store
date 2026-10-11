<?php
/**
 * Madar WooCommerce presentation enhancements.
 * WooCommerce still owns queries, prices, stock, variations, cart and checkout.
 *
 * @package EgyptFashionChild
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Second gallery image used as a hover alternate on product cards.
 */
function madar_alt_image_html($product_id) {
    if (!function_exists('wc_get_product')) {
        return '';
    }
    $product = wc_get_product($product_id);
    if (!$product) {
        return '';
    }
    $ids = $product->get_gallery_image_ids();
    if (empty($ids)) {
        return '';
    }
    return wp_get_attachment_image($ids[0], 'woocommerce_thumbnail', false, [
        'class'   => 'mdr-card-alt',
        'alt'     => '',
        'loading' => 'lazy',
    ]);
}

// Classic loops ([products] shortcode on the home page).
add_action('woocommerce_before_shop_loop_item_title', function () {
    global $product;
    if ($product) {
        echo madar_alt_image_html($product->get_id()); // phpcs:ignore WordPress.Security.EscapeOutput
    }
}, 11);

add_filter('render_block', 'madar_render_block_enhancements', 10, 3);

function madar_render_block_enhancements($content, $block, $instance = null) {
    $name = $block['blockName'] ?? '';

    // WooCommerce's checkout template points at its own simplified header part.
    if ('core/template-part' === $name && 'checkout-header' === ($block['attrs']['slug'] ?? '')) {
        return '<header class="wp-block-template-part">' . madar_storefront_header() . '</header>';
    }

    // Block loops: hover alternate image.
    if ('woocommerce/product-image' === $name && $instance && !empty($instance->context['postId'])) {
        $alt = madar_alt_image_html((int) $instance->context['postId']);
        if ($alt && false !== strpos($content, '</a>')) {
            $pos = strrpos($content, '</a>');
            $content = substr_replace($content, $alt . '</a>', $pos, 4);
        }
        return $content;
    }

    // Archive toolbar before the main (inherited) product collection.
    if ('woocommerce/product-collection' === $name && !empty($block['attrs']['query']['inherit'])) {
        return madar_shop_toolbar() . $content;
    }

    // Product page extras after the add to cart form.
    if ('woocommerce/add-to-cart-form' === $name && is_product()) {
        return $content . madar_product_extras();
    }

    // Untranslated hardcoded labels in WooCommerce block templates.
    if ('woocommerce/product-sku' === $name) {
        return str_replace('SKU:', 'رمز المنتج:', $content);
    }

    if ('woocommerce/related-products' === $name
        || ('woocommerce/product-collection' === $name && false !== strpos((string) ($block['attrs']['collection'] ?? ''), 'related'))) {
        return str_replace('منتجات ذات صلة', 'كمّل اللوك', $content);
    }

    return $content;
}

/**
 * WooCommerce block templates hardcode English prefixes in block attributes,
 * which bypass translation files.
 */
function madar_translate_post_terms_prefix($block) {
    if ('core/post-terms' !== ($block['blockName'] ?? '') || !isset($block['attrs']['prefix'])) {
        return $block;
    }
    $prefixes = [
        'Category: '   => 'التصنيف: ',
        'Categories: ' => 'التصنيفات: ',
        'Tags: '       => 'الوسوم: ',
        'Tag: '        => 'الوسم: ',
    ];
    if (isset($prefixes[$block['attrs']['prefix']])) {
        $block['attrs']['prefix'] = $prefixes[$block['attrs']['prefix']];
    }
    return $block;
}
add_filter('render_block_data', 'madar_translate_post_terms_prefix');

function madar_shop_toolbar() {
    static $done = false;
    if ($done) {
        return '';
    }
    $done = true;

    $current = is_product_category() ? get_queried_object_id() : 0;
    $terms = get_terms([
        'taxonomy'   => 'product_cat',
        'parent'     => 0,
        'hide_empty' => true,
    ]);
    $terms = is_wp_error($terms) ? [] : $terms;
    $base = remove_query_arg(['orderby', 'paged']);
    $sorts = [
        'menu_order' => 'الترتيب الافتراضي',
        'date'       => 'الأحدث',
        'popularity' => 'الأكثر طلبًا',
        'price'      => 'السعر: من الأقل',
        'price-desc' => 'السعر: من الأعلى',
    ];
    $active_sort = isset($_GET['orderby']) ? sanitize_key(wp_unslash($_GET['orderby'])) : 'menu_order'; // phpcs:ignore WordPress.Security.NonceVerification

    ob_start();
    ?>
<div class="mdr-toolbar">
<nav class="mdr-chips" aria-label="الأقسام">
<a href="<?php echo esc_url(madar_storefront_shop_url()); ?>"<?php echo $current ? '' : ' aria-current="page"'; ?>>الكل</a>
<?php foreach ($terms as $term) { if ('uncategorized' === $term->slug) { continue; } ?>
<a href="<?php echo esc_url(get_term_link($term)); ?>"<?php echo $current === $term->term_id ? ' aria-current="page"' : ''; ?>><?php echo esc_html($term->name); ?></a>
<?php } ?>
</nav>
<div class="mdr-toolbar__actions">
<button type="button" class="mdr-tool" data-mdr-open="mdr-filters"><?php echo madar_icon('filter'); ?><span>الفلاتر والترتيب</span></button>
<div class="mdr-density" role="group" aria-label="شكل العرض">
<button type="button" class="mdr-tool" data-mdr-density="large" aria-pressed="false" aria-label="صور أكبر"><?php echo madar_icon('rows'); ?></button>
<button type="button" class="mdr-tool" data-mdr-density="dense" aria-pressed="true" aria-label="منتجات أكثر"><?php echo madar_icon('grid'); ?></button>
</div>
</div>
</div>
<dialog id="mdr-filters" class="mdr-drawer" aria-labelledby="mdr-filters-title">
<div class="mdr-drawer__head"><h2 id="mdr-filters-title">الفلاتر والترتيب</h2><button type="button" class="mdr-icon-btn" data-mdr-close aria-label="إغلاق"><?php echo madar_icon('close'); ?></button></div>
<div class="mdr-drawer__body">
<h3>القسم</h3>
<ul class="mdr-drawer__list">
<li><a href="<?php echo esc_url(madar_storefront_shop_url()); ?>"<?php echo $current ? '' : ' aria-current="page"'; ?>>الكل</a></li>
<?php foreach ($terms as $term) { if ('uncategorized' === $term->slug) { continue; } ?>
<li><a href="<?php echo esc_url(get_term_link($term)); ?>"<?php echo $current === $term->term_id ? ' aria-current="page"' : ''; ?>><?php echo esc_html($term->name); ?> <small><?php echo (int) $term->count; ?></small></a></li>
<?php } ?>
</ul>
<h3>الترتيب</h3>
<ul class="mdr-drawer__list">
<?php foreach ($sorts as $key => $label) { ?>
<li><a href="<?php echo esc_url('menu_order' === $key ? $base : add_query_arg('orderby', $key, $base)); ?>"<?php echo $active_sort === $key ? ' aria-current="true"' : ''; ?>><?php echo esc_html($label); ?></a></li>
<?php } ?>
</ul>
</div>
</dialog>
    <?php
    return ob_get_clean();
}

function madar_product_extras() {
    static $done = false;
    if ($done) {
        return '';
    }
    $done = true;

    ob_start();
    ?>
<div class="mdr-extras">
<button type="button" class="mdr-size-link" data-mdr-open="mdr-size-guide"><?php echo madar_icon('ruler'); ?>دليل المقاسات</button>
<details><summary>الشحن والتوصيل</summary><p>بنوصّل لكل المحافظات. مدة وتكلفة التوصيل بتظهر في صفحة الدفع حسب عنوانك.</p></details>
<details><summary>الاسترجاع والاستبدال</summary><p>لو المقاس أو القطعة مش مناسبين، تقدر تطلب استبدال أو استرجاع حسب سياسة المتجر، والقطعة بحالتها الأصلية.</p></details>
<details><summary>العناية بالقطعة</summary><p>اتبع تعليمات الغسيل على الكارت الداخلي. الغسيل على البارد والتجفيف في الظل بيحافظوا على الخامة واللون.</p></details>
</div>
<dialog id="mdr-size-guide" class="mdr-drawer" aria-labelledby="mdr-size-title">
<div class="mdr-drawer__head"><h2 id="mdr-size-title">دليل المقاسات</h2><button type="button" class="mdr-icon-btn" data-mdr-close aria-label="إغلاق"><?php echo madar_icon('close'); ?></button></div>
<div class="mdr-drawer__body">
<p>المقاسات بالسنتيمتر، وممكن تختلف شوية حسب القصّة. لو بين مقاسين، اختار الأكبر لراحة أكتر.</p>
<h3>رجالي</h3>
<table><thead><tr><th>المقاس</th><th>الصدر</th><th>الوسط</th><th>الطول</th></tr></thead><tbody>
<tr><td>S</td><td>92–96</td><td>78–82</td><td>70</td></tr>
<tr><td>M</td><td>97–102</td><td>83–88</td><td>72</td></tr>
<tr><td>L</td><td>103–108</td><td>89–94</td><td>74</td></tr>
<tr><td>XL</td><td>109–115</td><td>95–101</td><td>76</td></tr>
<tr><td>XXL</td><td>116–122</td><td>102–108</td><td>78</td></tr>
</tbody></table>
<h3>أطفال</h3>
<table><thead><tr><th>السن</th><th>الطول</th><th>الصدر</th></tr></thead><tbody>
<tr><td>2–3</td><td>92–98</td><td>53–55</td></tr>
<tr><td>4–5</td><td>104–110</td><td>56–58</td></tr>
<tr><td>6–7</td><td>116–122</td><td>60–62</td></tr>
<tr><td>8–9</td><td>128–134</td><td>64–67</td></tr>
<tr><td>10–12</td><td>140–152</td><td>70–76</td></tr>
</tbody></table>
</div>
</dialog>
    <?php
    return ob_get_clean();
}

/**
 * WooCommerce stores the default checkout privacy text in English.
 */
add_filter('woocommerce_get_privacy_policy_text', function ($text, $type) {
    $default = __('Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our [privacy_policy].', 'woocommerce');
    if ('checkout' === $type && (false !== strpos($text, 'Your personal data') || $text === $default)) {
        return 'بنستخدم بياناتك عشان نجهّز طلبك ونحسّن تجربتك على الموقع، وللأغراض الموضّحة في [privacy_policy].';
    }
    return $text;
}, 10, 2);
