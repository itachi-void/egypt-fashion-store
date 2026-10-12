<?php
/**
 * Madar presentation kit: client settings, trust strip, WhatsApp button,
 * lookbook + journal pages and a one-click demo content importer.
 *
 * @package EgyptFashionChild
 */

if (!defined('ABSPATH')) {
    exit;
}

/* ---------- Settings ---------- */

function madar_settings() {
    $defaults = [
        'whatsapp'       => '201000000000',
        'return_days'    => 14,
        'free_ship_over' => 1500,
    ];
    return wp_parse_args((array) get_option('madar_settings', []), $defaults);
}

function madar_setting($key) {
    $s = madar_settings();
    return $s[$key] ?? '';
}

function madar_whatsapp_url($text = '') {
    $number = preg_replace('/\D+/', '', (string) madar_setting('whatsapp'));
    if ('' === $number) {
        return '';
    }
    return 'https://wa.me/' . $number . ($text ? '?text=' . rawurlencode($text) : '');
}

function madar_page_url($slug) {
    $page = get_page_by_path($slug);
    return $page ? get_permalink($page) : home_url('/' . $slug . '/');
}

function madar_demo_image($file) {
    return madar_storefront_image('demo/' . $file);
}

/* ---------- Trust strip ---------- */

function madar_trust_strip($context = 'home') {
    $days = absint(madar_setting('return_days'));
    $free = absint(madar_setting('free_ship_over'));
    $wa   = madar_whatsapp_url('أهلًا مدار، عندي سؤال');
    $items = [
        ['cash', 'الدفع عند الاستلام', 'افحص طلبك وادفع وقت ما يوصلك.'],
        ['return', $days ? "استبدال واسترجاع خلال {$days} يوم" : 'استبدال واسترجاع', 'لو المقاس مش مظبوط، نبدّلهولك.'],
        ['truck', $free ? 'شحن مجاني فوق ' . number_format_i18n($free) . ' ج.م' : 'توصيل لكل المحافظات', 'توصيل لكل المحافظات خلال ٢–٥ أيام.'],
    ];
    ob_start();
    ?>
<ul class="mdr-trust mdr-trust--<?php echo esc_attr($context); ?>">
<?php foreach ($items as $item) { ?>
<li><?php echo madar_icon($item[0]); ?><span><strong><?php echo esc_html($item[1]); ?></strong><small><?php echo esc_html($item[2]); ?></small></span></li>
<?php } ?>
<?php if ($wa) { ?>
<li><?php echo madar_icon('chat'); ?><span><strong>محتاج مساعدة؟</strong><small><a href="<?php echo esc_url($wa); ?>" target="_blank" rel="noopener">كلّمنا على واتساب</a></small></span></li>
<?php } ?>
</ul>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_trust', function () {
    return madar_trust_strip('home');
});

add_action('wp_footer', function () {
    $url = madar_whatsapp_url('أهلًا مدار، عندي سؤال');
    if (!$url || is_checkout() || is_front_page() || is_home()) {
        return;
    }
    echo '<a class="mdr-wa" href="' . esc_url($url) . '" target="_blank" rel="noopener" aria-label="تواصل معنا على واتساب">' . madar_icon('chat') . '<span>واتساب</span></a>';
});

/* ---------- Lookbook ---------- */

function madar_demo_looks() {
    return [
        ['m-coat-brown.jpg', 'm-coat-brown-2.jpg', 'LOOK 01', 'الجملي، من غير مجهود.', 'معطف بلون الجمل على بلوفر برقبة عالية. لون واحد، درجات كتير.', 'men'],
        ['m-white-wall.jpg', 'f-stack.jpg', 'LOOK 02', 'أوفرشيرت لكل الأيام.', 'طبقة خفيفة فوق تيشيرت سادة. للشغل، وللخروج بعده.', 'men'],
        ['k-stripe.jpg', 'k-arms.jpg', 'LOOK 03', 'مقلّم وصغير.', 'بولو قطن بخطوط كحلي. مريح للعب، ومرتب للزيارة.', 'kids'],
        ['m-black-coat.jpg', 'm-suit-chair.jpg', 'LOOK 04', 'أسود على أسود.', 'معطف طويل وبنطلون مستقيم. هدوء كامل، حضور واضح.', 'men'],
    ];
}

function madar_lookbook() {
    ob_start();
    ?>
<main class="mdr-page mdr-lookbook" id="mdr-main">
<header class="mdr-page__head mdr-reveal"><p class="mdr-eyebrow" dir="ltr">LOOKBOOK / FW</p><h1 class="mdr-display">لوكات على مدار يومك.</h1><p class="mdr-lead">أربع إطلالات من التشكيلة، متنسّقة ومستعدة. اختار اللوك، أو اختار قطعة منه.</p></header>
<?php foreach (madar_demo_looks() as $i => $look) { ?>
<section class="mdr-look<?php echo $i % 2 ? ' mdr-look--flip' : ''; ?>">
<figure class="mdr-look__main"><img loading="<?php echo $i ? 'lazy' : 'eager'; ?>" src="<?php echo esc_url(madar_demo_image($look[0])); ?>" alt="" width="900" height="1200" /></figure>
<div class="mdr-look__copy mdr-reveal">
<p class="mdr-eyebrow" dir="ltr"><?php echo esc_html($look[2]); ?></p>
<h2 class="mdr-title mdr-title--xl"><?php echo esc_html($look[3]); ?></h2>
<p class="mdr-lead"><?php echo esc_html($look[4]); ?></p>
<a class="mdr-btn" href="<?php echo esc_url(madar_category_url([$look[5]])); ?>">تسوّق اللوك <?php echo madar_icon('arrow'); ?></a>
<img class="mdr-look__detail" loading="lazy" src="<?php echo esc_url(madar_demo_image($look[1])); ?>" alt="" width="900" height="1200" />
</div>
</section>
<?php } ?>
</main>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_lookbook', 'madar_lookbook');

/* ---------- Journal ---------- */

function madar_journal() {
    $stories = [
        ['f-sweaters.jpg', 'خامات', 'إزاي تختار بلوفر يعيش معاك.', 'الصوف المخلوط، القطن المبروم، والكشمير. الفرق في الإحساس، وفي عدد السنين.'],
        ['k-brown-shirt.jpg', 'أطفال', 'مقاس يكبر معاهم.', 'نصايح بسيطة تختار بيها مقاس الأطفال من غير ما تبدّل كل شهرين.'],
        ['f-shoes.jpg', 'تنسيق', 'خزانة الخمس قطع.', 'خمس قطع أساسية، وعشر لوكات مختلفة. التنسيق مش محتاج كتير.'],
    ];
    ob_start();
    ?>
<main class="mdr-page mdr-journal" id="mdr-main">
<header class="mdr-page__head mdr-reveal"><p class="mdr-eyebrow" dir="ltr">THE JOURNAL</p><h1 class="mdr-display">المجلة.</h1><p class="mdr-lead">حكايات عن الخامة والقصّة والتنسيق. نقرا بهدوء، ونلبس على مزاجنا.</p></header>
<article class="mdr-story-lead mdr-reveal">
<img src="<?php echo esc_url(madar_demo_image('m-coat-brown-2.jpg')); ?>" alt="" width="900" height="1200" />
<div><p class="mdr-eyebrow">قصة الموسم</p><h2 class="mdr-title mdr-title--xl">معطف واحد، شتا كامل.</h2><p class="mdr-lead">ليه المعطف الجملي هو أذكى قطعة ممكن تشتريها الموسم ده، وإزاي تلبسه بخمس طرق مختلفة.</p><a class="mdr-link" href="<?php echo esc_url(madar_page_url('lookbook')); ?>">شوف اللوكات</a></div>
</article>
<div class="mdr-stories">
<?php foreach ($stories as $s) { ?>
<article class="mdr-story mdr-reveal"><img loading="lazy" src="<?php echo esc_url(madar_demo_image($s[0])); ?>" alt="" width="900" height="1200" /><p class="mdr-eyebrow"><?php echo esc_html($s[1]); ?></p><h3><?php echo esc_html($s[2]); ?></h3><p><?php echo esc_html($s[3]); ?></p></article>
<?php } ?>
</div>
</main>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_journal', 'madar_journal');

/* ---------- Admin: settings + demo import ---------- */

add_action('admin_menu', function () {
    add_theme_page('إعدادات مدار', 'إعدادات مدار', 'manage_options', 'madar-settings', 'madar_settings_page');
});

function madar_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $s = madar_settings();
    $notice = isset($_GET['madar']) ? sanitize_key($_GET['madar']) : '';
    $messages = ['saved' => 'اتحفظت الإعدادات.', 'imported' => 'اتستورد محتوى العرض.', 'removed' => 'اتمسح محتوى العرض.', 'exists' => 'محتوى العرض موجود بالفعل.'];
    ?>
<div class="wrap">
<h1>إعدادات مدار</h1>
<?php if (isset($messages[$notice])) { ?><div class="notice notice-success"><p><?php echo esc_html($messages[$notice]); ?></p></div><?php } ?>
<form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
<input type="hidden" name="action" value="madar_save_settings" />
<?php wp_nonce_field('madar_settings'); ?>
<table class="form-table" role="presentation">
<tr><th><label for="mdr-wa">رقم واتساب</label></th><td><input id="mdr-wa" name="whatsapp" class="regular-text" dir="ltr" value="<?php echo esc_attr($s['whatsapp']); ?>" /><p class="description">بالصيغة الدولية من غير +، مثلًا 2010xxxxxxxx. سيبه فاضي عشان تخفي زر واتساب.</p></td></tr>
<tr><th><label for="mdr-rd">أيام الاسترجاع</label></th><td><input id="mdr-rd" name="return_days" type="number" min="0" value="<?php echo esc_attr($s['return_days']); ?>" /></td></tr>
<tr><th><label for="mdr-fs">شحن مجاني فوق (ج.م)</label></th><td><input id="mdr-fs" name="free_ship_over" type="number" min="0" value="<?php echo esc_attr($s['free_ship_over']); ?>" /><p class="description">0 = من غير شحن مجاني. ده نص بيظهر بس، واظبط الشحن نفسه من إعدادات WooCommerce.</p></td></tr>
</table>
<?php submit_button('حفظ'); ?>
</form>
<hr />
<h2>محتوى العرض</h2>
<p>بيضيف منتجات وأقسام (رجالي/أطفال) وصفحتي اللوكبوك والمجلة بصور جاهزة، عشان تعرض المتجر على العميل. ينفع تمسحه بعدين من غير ما يأثر على أي محتوى تاني.</p>
<form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="display:inline-block;margin-inline-end:8px">
<input type="hidden" name="action" value="madar_demo_import" /><?php wp_nonce_field('madar_demo'); ?>
<?php submit_button('استيراد محتوى العرض', 'primary', 'submit', false); ?>
</form>
<form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="display:inline-block" onsubmit="return confirm('هيتمسح محتوى العرض بس. متأكد؟')">
<input type="hidden" name="action" value="madar_demo_remove" /><?php wp_nonce_field('madar_demo'); ?>
<?php submit_button('مسح محتوى العرض', 'delete', 'submit', false); ?>
</form>
</div>
    <?php
}

function madar_admin_redirect($code) {
    wp_safe_redirect(admin_url('themes.php?page=madar-settings&madar=' . $code));
    exit;
}

add_action('admin_post_madar_save_settings', function () {
    if (!current_user_can('manage_options')) {
        wp_die('', 403);
    }
    check_admin_referer('madar_settings');
    update_option('madar_settings', [
        'whatsapp'       => preg_replace('/\D+/', '', wp_unslash($_POST['whatsapp'] ?? '')),
        'return_days'    => absint($_POST['return_days'] ?? 0),
        'free_ship_over' => absint($_POST['free_ship_over'] ?? 0),
    ]);
    madar_admin_redirect('saved');
});

add_action('admin_post_madar_demo_import', function () {
    if (!current_user_can('manage_options')) {
        wp_die('', 403);
    }
    check_admin_referer('madar_demo');
    madar_admin_redirect(madar_demo_import() ? 'imported' : 'exists');
});

add_action('admin_post_madar_demo_remove', function () {
    if (!current_user_can('manage_options')) {
        wp_die('', 403);
    }
    check_admin_referer('madar_demo');
    madar_demo_remove();
    madar_admin_redirect('removed');
});

function madar_demo_posts() {
    return get_posts([
        'post_type'   => ['product', 'product_variation', 'page', 'attachment'],
        'post_status' => 'any',
        'numberposts' => -1,
        'fields'      => 'ids',
        'meta_key'    => '_madar_demo',
    ]);
}

/**
 * Creates demo categories, products and pages. Returns false if already imported.
 * Also callable from WP-CLI: wp eval 'madar_demo_import();'
 */
function madar_demo_import() {
    if (!class_exists('WooCommerce') || madar_demo_posts()) {
        return false;
    }
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $dir = get_stylesheet_directory() . '/assets/images/demo/';
    $images = [];
    $image = function ($file) use ($dir, &$images) {
        if (isset($images[$file])) {
            return $images[$file];
        }
        $tmp = wp_tempnam($file);
        copy($dir . $file, $tmp);
        $id = media_handle_sideload(['name' => 'madar-' . $file, 'tmp_name' => $tmp], 0);
        if (is_wp_error($id)) {
            @unlink($tmp);
            return 0;
        }
        update_post_meta($id, '_madar_demo', 1);
        return $images[$file] = $id;
    };
    $cat = function ($name, $slug) {
        $term = get_term_by('slug', $slug, 'product_cat');
        if ($term) {
            return (int) $term->term_id;
        }
        $new = wp_insert_term($name, 'product_cat', ['slug' => $slug]);
        return is_wp_error($new) ? 0 : (int) $new['term_id'];
    };
    $men  = $cat('رجالي', 'men');
    $kids = $cat('أطفال', 'kids');

    $products = [
        ['بلوفر تريكو بدرجات ترابي', 790, 0, $men, 'f-sweaters.jpg', 'f-stack.jpg', 'تريكو ناعم وتقيل بألوان تتنسّق مع كل حاجة.'],
        ['معطف طويل أسود', 2190, 0, $men, 'm-black-coat.jpg', 'm-suit-chair.jpg', 'قصّة طويلة وخامة متماسكة. هادي ومرتب.'],
        ['طقم بدلة سادة', 2490, 2190, $men, 'm-suit-chair.jpg', 'm-black-coat.jpg', 'جاكيت وبنطلون بقصّة حديثة. للمناسبات والشغل.'],
        ['تيشيرت أطفال مقلّم فاتح', 320, 0, $kids, 'k-curly.jpg', 'k-arms.jpg', 'تيشيرت قطن خفيف لأيام اللعب.'],
        ['سويتشيرت أطفال بخطوط', 520, 0, $kids, 'k-arms.jpg', 'k-stripe.jpg', 'قطن مبطّن من جوه بخطوط كلاسيكية. دافي ومريح.'],
        ['قميص مقلّم بقصّة واسعة', 690, 0, $men, 'm-stripe.jpg', 'm-white-wall.jpg', 'قطن خفيف بخطوط رفيعة. للصيف والأيام الدافية.'],
        ['بولو أطفال مقلّم', 420, 0, $kids, 'k-stripe.jpg', 'k-arms.jpg', 'قطن ناعم على الجلد بخطوط كحلي. يتغسل ويتلبس كتير.'],
        ['أوفرشيرت قطن مبروم', 990, 0, $men, 'm-white-wall.jpg', 'f-stack.jpg', 'قطن تقيل بجيوب صدر. فوق تيشيرت، أو تحت معطف.'],
        ['قميص أطفال بني', 480, 390, $kids, 'k-brown-shirt.jpg', 'k-stripe.jpg', 'قميص بياقة صغيرة ولون دافي. للعيد والزيارات.'],
        ['معطف صوف بلون الجمل', 1890, 1490, $men, 'm-coat-brown.jpg', 'm-coat-brown-2.jpg', 'صوف مخلوط بقصّة مستقيمة وياقة كلاسيكية. طبقة واحدة تكفي الشتا.'],
    ];

    foreach ($products as $i => $p) {
        $is_kids  = $p[3] === $kids;
        $sizes    = $is_kids ? ['2–3', '4–5', '6–7', '8–9'] : ['S', 'M', 'L', 'XL'];
        $product  = new WC_Product_Variable();
        $product->set_name($p[0]);
        $product->set_category_ids([$p[3]]);
        $product->set_image_id($image($p[4]));
        $product->set_gallery_image_ids(array_filter([$image($p[5])]));
        $product->set_short_description($p[6]);
        $product->set_description($p[6] . ' قطعة أساسية من تشكيلة مدار، معمولة عشان تعيش معاك.');
        $product->set_sku('MDR-DEMO-' . ($i + 1));
        $attr = new WC_Product_Attribute();
        $attr->set_name('المقاس');
        $attr->set_options($sizes);
        $attr->set_visible(true);
        $attr->set_variation(true);
        $product->set_attributes([$attr]);
        $product->update_meta_data('_madar_demo', 1);
        $pid = $product->save();
        foreach ($sizes as $j => $size) {
            $var = new WC_Product_Variation();
            $var->set_parent_id($pid);
            $var->set_attributes([sanitize_title('المقاس') => $size]);
            $var->set_regular_price($p[1]);
            if ($p[2]) {
                $var->set_sale_price($p[2]);
            }
            $var->set_manage_stock(true);
            $var->set_stock_quantity(3 === $j && 0 === $i % 3 ? 0 : 8);
            $var->update_meta_data('_madar_demo', 1);
            $var->save();
        }
        WC_Product_Variable::sync($pid);
    }

    foreach (['lookbook' => 'لوكبوك', 'journal' => 'المجلة'] as $slug => $title) {
        if (!get_page_by_path($slug)) {
            $id = wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_name' => $slug, 'post_title' => $title, 'post_content' => '']);
            if ($id && !is_wp_error($id)) {
                update_post_meta($id, '_madar_demo', 1);
            }
        }
    }

    if ('EGP' !== get_option('woocommerce_currency')) {
        update_option('woocommerce_currency', 'EGP');
    }
    $cod = get_option('woocommerce_cod_settings', []);
    if (empty($cod['enabled']) || 'yes' !== $cod['enabled']) {
        $cod['enabled'] = 'yes';
        $cod['title'] = $cod['title'] ?? 'الدفع عند الاستلام';
        update_option('woocommerce_cod_settings', $cod);
    }
    flush_rewrite_rules();
    return true;
}

function madar_demo_remove() {
    foreach (madar_demo_posts() as $id) {
        $type = get_post_type($id);
        if ('attachment' === $type) {
            wp_delete_attachment($id, true);
        } elseif (in_array($type, ['product', 'product_variation'], true) && function_exists('wc_get_product')) {
            $product = wc_get_product($id);
            if ($product) {
                $product->delete(true);
            }
        } else {
            wp_delete_post($id, true);
        }
    }
    if (function_exists('wc_delete_product_transients')) {
        wc_delete_product_transients();
    }
}
