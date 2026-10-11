<?php
/**
 * Madar storefront markup: header, home page and footer.
 * Rendered through shortcodes inside wp:html blocks (no wpautop).
 *
 * @package EgyptFashionChild
 */

if (!defined('ABSPATH')) {
    exit;
}

function madar_storefront_image($filename) {
    return get_stylesheet_directory_uri() . '/assets/images/' . $filename;
}

function madar_storefront_shop_url() {
    return function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/');
}

/**
 * Link to the first existing product category among the given slugs,
 * falling back to the shop page.
 */
function madar_category_url($slugs) {
    foreach ((array) $slugs as $slug) {
        $term = get_term_by('slug', $slug, 'product_cat');
        if ($term && !is_wp_error($term)) {
            $link = get_term_link($term);
            if (!is_wp_error($link)) {
                return $link;
            }
        }
    }
    return madar_storefront_shop_url();
}

function madar_account_link() {
    if (shortcode_exists('madar_account_link')) {
        return do_shortcode('[madar_account_link]');
    }
    $url = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : wp_login_url();
    $label = is_user_logged_in() ? 'حسابي' : 'دخول / إنشاء حساب';
    return '<a href="' . esc_url($url) . '">' . esc_html($label) . '</a>';
}

function madar_icon($name) {
    $paths = [
        'menu'    => '<path d="M3 7h18M3 12h18M3 17h18"/>',
        'close'   => '<path d="M5 5l14 14M19 5L5 19"/>',
        'search'  => '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
        'arrow'   => '<path d="M19 12H5M11 6l-6 6 6 6"/>',
        'filter'  => '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
        'grid'    => '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>',
        'rows'    => '<rect x="4" y="4" width="16" height="7"/><rect x="4" y="13" width="16" height="7"/>',
        'cash'    => '<rect x="3" y="6" width="18" height="12"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
        'return'  => '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
        'truck'   => '<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
        'chat'    => '<path d="M4 20l1.4-4A8 8 0 1112 20a8 8 0 01-4-1z"/>',
        'ruler'   => '<path d="M3 15L15 3l6 6L9 21z"/><path d="M7 11l2 2M10 8l2 2M13 5l2 2"/>',
    ];
    if (!isset($paths[$name])) {
        return '';
    }
    return '<svg class="mdr-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true" focusable="false">' . $paths[$name] . '</svg>';
}

function madar_storefront_header() {
    $shop_url = madar_storefront_shop_url();
    ob_start();
    ?>
<div class="mdr-top"><p>خامات مختارة. قصّات هادية. <span>عالم الرجال والأطفال</span></p></div>
<div class="mdr-header" data-mdr-header>
<div class="mdr-header__inner">
<button type="button" class="mdr-icon-btn mdr-menu-toggle" aria-expanded="false" aria-controls="mdr-nav" aria-label="القائمة"><?php echo madar_icon('menu'); ?></button>
<a class="mdr-brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="مدار — الرئيسية">مدار<span>MADAR</span></a>
<nav id="mdr-nav" class="mdr-nav" aria-label="التنقل الرئيسي">
<a href="<?php echo esc_url($shop_url); ?>">التشكيلة</a>
<a href="<?php echo esc_url(madar_category_url(['men', 'mens', 'rjal'])); ?>">رجالي</a>
<a href="<?php echo esc_url(madar_category_url(['kids', 'children', 'atfal'])); ?>">أطفال</a>
<a href="<?php echo esc_url(madar_page_url('lookbook')); ?>">لوكبوك</a>
<a href="<?php echo esc_url(madar_page_url('journal')); ?>">المجلة</a>
</nav>
<div class="mdr-tools">
<button type="button" class="mdr-icon-btn" aria-expanded="false" aria-controls="mdr-search" aria-label="البحث" data-mdr-search-toggle><?php echo madar_icon('search'); ?></button>
<span class="mdr-account"><?php echo madar_account_link(); ?></span>
<?php if (function_exists('WC')) { echo do_blocks('<!-- wp:woocommerce/mini-cart /-->'); } ?>
</div>
</div>
<div id="mdr-search" class="mdr-search" hidden>
<form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>">
<label for="mdr-search-input" class="screen-reader-text">البحث في المنتجات</label>
<input id="mdr-search-input" type="search" name="s" value="<?php echo esc_attr(get_search_query()); ?>" placeholder="دوّر على قطعتك…" autocomplete="off" />
<input type="hidden" name="post_type" value="product" />
<button type="submit" class="mdr-btn">بحث</button>
</form>
</div>
</div>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_storefront_header', 'madar_storefront_header');

function madar_storefront_home() {
    $shop_url = madar_storefront_shop_url();
    $men_url  = madar_category_url(['men', 'mens', 'rjal']);
    $kids_url = madar_category_url(['kids', 'children', 'atfal']);
    ob_start();
    ?>
<main class="mdr-home" id="mdr-main">
<section class="mdr-hero">
<div class="mdr-hero__copy mdr-reveal">
<p class="mdr-eyebrow">مدار / خريف وشتاء</p>
<h1 class="mdr-display">حضور هادي.<br /><em>على مدار يومك.</em></h1>
<p class="mdr-lead">قطع تشبهك، معمولة عشان تتلبس كتير. للرجال والأطفال، من غير مبالغة.</p>
<div class="mdr-hero__actions">
<a class="mdr-btn" href="<?php echo esc_url($men_url); ?>">تسوّق الرجالي <?php echo madar_icon('arrow'); ?></a>
<a class="mdr-link" href="<?php echo esc_url($kids_url); ?>">تسوّق الأطفال</a>
</div>
<p class="mdr-latin" dir="ltr">LESS, BUT BETTER — MADAR</p>
</div>
<figure class="mdr-hero__media">
<img src="<?php echo esc_url(madar_storefront_image('campaign.jpg')); ?>" alt="رجل بمعطف بلون الجمل" width="1200" height="1800" fetchpriority="high" />
<figcaption>من القطعة الأولى، لآخر اليوم.</figcaption>
</figure>
</section>
<div class="mdr-marquee" aria-hidden="true"><div class="mdr-marquee__track"><span>خامات مختارة</span><span>قصّات هادية</span><span>للرجال والأطفال</span><span dir="ltr">THOUGHTFULLY CHOSEN</span><span>خامات مختارة</span><span>قصّات هادية</span><span>للرجال والأطفال</span><span dir="ltr">THOUGHTFULLY CHOSEN</span></div></div>
<?php echo madar_trust_strip('home'); ?>
<section class="mdr-section" id="madar-worlds">
<header class="mdr-section__head mdr-reveal"><p class="mdr-eyebrow">عالم مدار / TWO WORLDS</p><h2 class="mdr-title">مساحة لك. ومساحة لهم.</h2></header>
<div class="mdr-worlds">
<a class="mdr-world mdr-reveal" href="<?php echo esc_url($men_url); ?>"><img loading="lazy" src="<?php echo esc_url(madar_storefront_image('coat.jpg')); ?>" alt="" width="1100" height="1649" /><span><small dir="ltr">MEN</small><strong>للرجال</strong><b>تفاصيل تصنع حضورك ←</b></span></a>
<a class="mdr-world mdr-reveal" href="<?php echo esc_url($kids_url); ?>"><img loading="lazy" src="<?php echo esc_url(madar_storefront_image('kids.jpg')); ?>" alt="" width="1100" height="734" /><span><small dir="ltr">KIDS</small><strong>للأطفال</strong><b>مساحة لكل يوم جديد ←</b></span></a>
</div>
</section>
<section class="mdr-section mdr-picks">
<header class="mdr-section__head mdr-section__head--split mdr-reveal"><div><p class="mdr-eyebrow">من التشكيلة</p><h2 class="mdr-title">اختيارات على مدار يومك.</h2></div><a class="mdr-link" href="<?php echo esc_url($shop_url); ?>">شوف التشكيلة كاملة</a></header>
<?php if (shortcode_exists('products')) { echo do_shortcode('[products limit="4" columns="4" orderby="date" order="DESC"]'); } ?>
</section>
<section class="mdr-manifesto mdr-reveal"><p class="mdr-eyebrow" dir="ltr">THE MADAR WAY</p><h2 class="mdr-display mdr-display--center">مش محتاج كتير.<br />محتاج اللي يشبهك.</h2><p class="mdr-lead">حضور مش محتاج صوت عالي. اختار على ذوقك، والبس بطريقتك.</p></section>
<section class="mdr-split">
<img loading="lazy" src="<?php echo esc_url(madar_storefront_image('city-edit.jpg')); ?>" alt="رجل بنظارة شمس في المدينة" width="1100" height="1557" />
<div class="mdr-split__copy mdr-reveal"><p class="mdr-eyebrow" dir="ltr">OFF DUTY / ON YOUR TERMS</p><h2 class="mdr-title mdr-title--xl">إيقاع المدينة.<br />على مزاجك.</h2><p class="mdr-lead">من أول خطوة، لآخر مشوار. قطع خفيفة تمشي معاك اليوم كله.</p><a class="mdr-link" href="<?php echo esc_url($shop_url); ?>">اكتشف المزيد</a></div>
</section>
</main>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_storefront_home', 'madar_storefront_home');

function madar_storefront_footer() {
    $shop_url = madar_storefront_shop_url();
    ob_start();
    ?>
<div class="mdr-footer">
<div class="mdr-footer__brand"><a class="mdr-brand" href="<?php echo esc_url(home_url('/')); ?>">مدار<span>MADAR</span></a><p>حضور هادي على مدار يومك. ملابس للرجال والأطفال.</p></div>
<nav aria-label="التسوق"><h3>التسوق</h3><a href="<?php echo esc_url($shop_url); ?>">التشكيلة</a><a href="<?php echo esc_url(madar_category_url(['men', 'mens', 'rjal'])); ?>">رجالي</a><a href="<?php echo esc_url(madar_category_url(['kids', 'children', 'atfal'])); ?>">أطفال</a></nav>
<nav aria-label="مدار"><h3>مدار</h3><a href="<?php echo esc_url(madar_page_url('lookbook')); ?>">لوكبوك</a><a href="<?php echo esc_url(madar_page_url('journal')); ?>">المجلة</a><?php $wa = madar_whatsapp_url(); if ($wa) { ?><a href="<?php echo esc_url($wa); ?>" target="_blank" rel="noopener">واتساب</a><?php } ?></nav>
<nav aria-label="حسابك"><h3>حسابك</h3><?php echo madar_account_link(); ?><?php if (function_exists('wc_get_cart_url')) { ?><a href="<?php echo esc_url(wc_get_cart_url()); ?>">سلة المشتريات</a><?php } ?></nav>
<p class="mdr-footer__note">مدار — نسخة تجريبية. الصور والمحتوى للإلهام؛ بيانات المنتجات الفعلية موضّحة في المتجر.</p>
</div>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_storefront_footer', 'madar_storefront_footer');
