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

function madar_render_featured_products($limit = 4) {
    $shop_url = madar_storefront_shop_url();
    
    // Iconic 4 concept pieces matching React exactly
    $concept_items = [
        [
            'slug'      => 'morning-coat',
            'search'    => 'معطف صوف بلون الجمل',
            'name'      => 'معطف الصوف البكر بلون الجمل',
            'price'     => '2,890.00 ج.م',
            'main'      => madar_storefront_image('coat-camel.jpg'),
            'alt'       => madar_storefront_image('coat-camel-alt.jpg'),
            'dept'      => 'MEN',
            'sub'       => 'قصّة عادية أو مريحة · خياران للّون',
        ],
        [
            'slug'      => 'city-suit',
            'search'    => 'طقم بدلة سادة',
            'name'      => 'بدلة إيقاع المدينة الكحلية',
            'price'     => '3,490.00 ج.م',
            'main'      => madar_storefront_image('suit-navy.jpg'),
            'alt'       => madar_storefront_image('suit-navy-alt.jpg'),
            'dept'      => 'MEN',
            'sub'       => 'قصّة عادية أو مريحة · خياران للّون',
        ],
        [
            'slug'      => 'everyday-knit',
            'search'    => 'بلوفر تريكو بدرجات ترابي',
            'name'      => 'كنزة الكشمير بالياقة العالية',
            'price'     => '1,490.00 ج.م',
            'main'      => madar_storefront_image('knit-cream.jpg'),
            'alt'       => madar_storefront_image('knit-cream-alt.jpg'),
            'dept'      => 'MEN',
            'sub'       => 'قصّة عادية أو مريحة · خياران للّون',
        ],
        [
            'slug'      => 'little-adventures',
            'search'    => 'سويتشيرت أطفال بخطوط',
            'name'      => 'جاكيت المغامرات الشتوي للأطفال',
            'price'     => '890.00 ج.م',
            'main'      => madar_storefront_image('kids-adventure.jpg'),
            'alt'       => madar_storefront_image('kids-adventure-alt.jpg'),
            'dept'      => 'KIDS',
            'sub'       => 'مقاسات عمرية · خياران للّون',
        ],
    ];

    ob_start();
    ?>
    <div class="store-product-grid">
        <?php foreach ($concept_items as $index => $item) :
            $permalink = $shop_url;
            $price_display = $item['price'];
            $prod_id = 'prod-' . ($index + 1);

            if (function_exists('wc_get_products')) {
                $found = wc_get_products([
                    'limit'   => 1,
                    'orderby' => 'date',
                    'order'   => 'DESC',
                    'title'   => $item['search'],
                ]);
                if (!empty($found)) {
                    $wc_p = $found[0];
                    $permalink = get_permalink($wc_p->get_id());
                    $price_display = $wc_p->get_price_html() ?: $item['price'];
                    $prod_id = $wc_p->get_id();
                }
            }
        ?>
        <article class="store-product-card mdr-reveal" data-product-id="<?php echo esc_attr($prod_id); ?>">
            <div class="store-card-image">
                <a href="<?php echo esc_url($permalink); ?>">
                    <img class="store-card-main" src="<?php echo esc_url($item['main']); ?>" alt="<?php echo esc_attr($item['name']); ?>" loading="lazy" />
                    <img class="store-card-alternate" src="<?php echo esc_url($item['alt']); ?>" alt="" loading="lazy" />
                </a>
                <button type="button" class="store-card-fav" aria-label="حفظ أو إزالة القطعة" data-mdr-fav="<?php echo esc_attr($prod_id); ?>">♡</button>
                <small><?php echo esc_html($item['dept']); ?></small>
                <button type="button" class="experience-quick-trigger" onclick="window.location.href='<?php echo esc_url($permalink); ?>'">معاينة سريعة +</button>
            </div>
            <div class="store-card-meta">
                <a href="<?php echo esc_url($permalink); ?>"><?php echo esc_html($item['name']); ?></a>
                <span><?php echo wp_kses_post($price_display); ?></span>
            </div>
            <p><?php echo esc_html($item['sub']); ?></p>
        </article>
        <?php endforeach; ?>
    </div>
    <?php
    return ob_get_clean();
}

function madar_storefront_header() {
    $shop_url     = madar_storefront_shop_url();
    $men_url      = madar_category_url(['men', 'mens', 'rjal']);
    $kids_url     = madar_category_url(['kids', 'children', 'atfal']);
    $lookbook_url = madar_page_url('lookbook');
    $journal_url  = madar_page_url('journal');
    $account_url  = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/my-account/');
    $cart_url     = function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/cart/');
    ob_start();
    ?>
<div class="quiet-top">
    <span>رجال وأطفال — تجربة متجر كاملة، بدون دفع أو طلب حقيقي</span>
    <a href="<?php echo esc_url($shop_url); ?>">التشكيلة ↗</a>
</div>
<header class="quiet-header store-header" data-mdr-header>
    <a href="<?php echo esc_url(home_url('/')); ?>" class="quiet-brand" aria-label="مدار — الرئيسية">
        مدار
        <span>MEN + KIDS / CAIRO</span>
    </a>
    <button type="button" class="store-menu-toggle mdr-menu-toggle" aria-expanded="false" aria-controls="mdr-nav" aria-label="القائمة">☰</button>
    <nav id="mdr-nav" class="store-nav" aria-label="التنقل الرئيسي">
        <a href="<?php echo esc_url($shop_url); ?>">وصل حديثًا</a>
        <a href="<?php echo esc_url($men_url); ?>" class="experience-nav-button">الرجال ⌄</a>
        <a href="<?php echo esc_url($kids_url); ?>" class="experience-nav-button">الأطفال</a>
        <a href="<?php echo esc_url($lookbook_url); ?>">الإطلالات</a>
        <a href="<?php echo esc_url($journal_url); ?>">دفتر مدار</a>
    </nav>
    <div class="quiet-header-tools">
        <button type="button" class="experience-search-trigger" aria-expanded="false" aria-controls="mdr-search" aria-label="البحث" data-mdr-search-toggle>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
        </button>
        <button type="button" aria-expanded="false">مصر / عربي ⌄</button>
        <a href="<?php echo esc_url($account_url); ?>" aria-label="المفضلة">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true"><path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15Z"/></svg><small>0</small>
        </a>
        <a href="<?php echo esc_url($account_url); ?>" aria-label="الحساب">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>
        </a>
        <a href="<?php echo esc_url($cart_url); ?>" class="store-cart-link" aria-label="سلة المشتريات">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg><small><?php echo function_exists('WC') && WC()->cart ? (int)WC()->cart->get_cart_contents_count() : 0; ?></small>
        </a>
    </div>
</header>
<div id="mdr-search" class="mdr-search" hidden>
    <form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>">
        <label for="mdr-search-input" class="screen-reader-text">البحث في المنتجات</label>
        <input id="mdr-search-input" type="search" name="s" value="<?php echo esc_attr(get_search_query()); ?>" placeholder="دوّر على قطعتك…" autocomplete="off" />
        <input type="hidden" name="post_type" value="product" />
        <button type="submit" class="mdr-btn">بحث</button>
    </form>
</div>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_storefront_header', 'madar_storefront_header');

function madar_storefront_home() {
    $shop_url     = madar_storefront_shop_url();
    $men_url      = madar_category_url(['men', 'mens', 'rjal']);
    $kids_url     = madar_category_url(['kids', 'children', 'atfal']);
    $lookbook_url = madar_page_url('lookbook');
    $journal_url  = madar_page_url('journal');
    ob_start();
    ?>
<main class="mdr-home complete-store" id="mdr-main">

<!-- 0. Opening Curtain -->
<div class="motion-curtain" aria-hidden="true"><span>MADAR / مدار</span></div>

<!-- 1. Editorial Hero -->
<section class="quiet-hero">
<div class="quiet-hero-copy">
<div class="quiet-kicker">مدار / عالم الرجال والأطفال</div>
<h1>حضورٌ هادئ.<br /><em>أثرٌ لا يُنسى.</em></h1>
<p>لأيامك العادية، بطريقتك الاستثنائية.<br />ولحكاياتهم الصغيرة، مساحة للنمو.</p>
<a class="quiet-cta" href="<?php echo esc_url($shop_url); ?>">اكتشف التشكيلة <span>←</span></a>
<div class="quiet-hero-foot">
<span>القاهرة / مختارة بعناية</span>
<span dir="ltr">EVERYDAY, ELEVATED.</span>
</div>
</div>
<div class="quiet-hero-visual">
<img class="quiet-main-photo" src="<?php echo esc_url(madar_storefront_image('coat-camel.jpg')); ?>" alt="معطف الصوف البكر الإيطالي بلون الجمل" width="1200" height="1800" fetchpriority="high" />
<img class="quiet-alternate-photo" src="<?php echo esc_url(madar_storefront_image('coat-camel-alt.jpg')); ?>" alt="تفاصيل المعطف والقصّة الإيطالية المتقنة" width="1200" height="1800" />
<div class="quiet-photo-top">
<span dir="ltr">AUTUMN / 26</span>
<span>THE EVERYDAY EDIT</span>
</div>
<a class="quiet-photo-note" href="<?php echo esc_url($shop_url); ?>">
<span>من النظرة الأولى،<br />إلى كل يوم.</span>
<span class="quiet-circle">↗</span>
</a>
</div>
</section>

<!-- 2. Luxury Marquee Ticker -->
<div class="quiet-marquee" data-home-line-scroll>
<div class="home-line-track">
<div class="home-line-group">
<span dir="auto">رجال وأطفال</span><i aria-hidden="true">✳</i><span dir="auto">اختيارات على ذوقك</span><i aria-hidden="true">✳</i><span dir="auto">أقل، ولكن أجمل</span><i aria-hidden="true">✳</i><span>THOUGHTFULLY CHOSEN.</span><i aria-hidden="true">✳</i>
</div>
<div class="home-line-group" aria-hidden="true">
<span dir="auto">رجال وأطفال</span><i aria-hidden="true">✳</i><span dir="auto">اختيارات على ذوقك</span><i aria-hidden="true">✳</i><span dir="auto">أقل، ولكن أجمل</span><i aria-hidden="true">✳</i><span>THOUGHTFULLY CHOSEN.</span><i aria-hidden="true">✳</i>
</div>
</div>
</div>

<!-- 3. Motion Guide Nav -->
<nav class="motion-guide" aria-label="جرّب الحركات">
<span>MOTION PLAYGROUND</span>
<a href="#motion-scroll">مشهد التمرير ↓</a>
<a href="#motion-elastic">الصور المرنة ↓</a>
<a href="#motion-trail">أثر المؤشر ↓</a>
<a href="<?php echo esc_url($shop_url); ?>">انتقال المنتج والسلة ↗</a>
</nav>

<!-- 4. Two Worlds (Men & Kids) -->
<section class="quiet-worlds" id="madar-worlds">
<a href="<?php echo esc_url($men_url); ?>">
<img loading="lazy" src="<?php echo esc_url(madar_storefront_image('coat-camel.jpg')); ?>" alt="للرجل، على مدار يومه." width="1100" height="1649" />
<span>
<small dir="ltr">01 / MEN</small>
<strong>للرجل، على مدار يومه.</strong>
<b>استكشف الرجال ←</b>
</span>
</a>
<a href="<?php echo esc_url($kids_url); ?>">
<img loading="lazy" src="<?php echo esc_url(madar_storefront_image('kids-adventure.jpg')); ?>" alt="حكايات صغيرة. لحظات كبيرة." width="1100" height="1467" />
<span>
<small dir="ltr">02 / KIDS</small>
<strong>حكايات صغيرة. لحظات كبيرة.</strong>
<b>استكشف الأطفال ←</b>
</span>
</a>
</section>

<!-- 5. Featured Considered Edit -->
<section class="store-section mdr-picks">
<div class="store-heading">
<div>
<span class="quiet-kicker" dir="ltr">THE CONSIDERED EDIT</span>
<h2>مساحة لما تحبّ.</h2>
</div>
<a class="quiet-line-button" href="<?php echo esc_url($shop_url); ?>">كل القطع ↗</a>
</div>
<?php echo madar_render_featured_products(4); ?>
</section>

<!-- 6. Brand Manifesto -->
<section class="store-manifesto">
<span class="quiet-kicker" dir="ltr">THE MADAR PHILOSOPHY</span>
<h2>ليست أكثر. بل أقرب إليك.</h2>
<p>قصّة ترتاح فيها، لون يعود معك كل موسم، وقطعة تصبح جزءًا من حكايتك.</p>
<a class="quiet-line-button" href="<?php echo esc_url($journal_url); ?>">اقرأ حكايتنا ↗</a>
</section>

<!-- 7. Motion Scenes -->
<section id="motion-scroll" class="motion-scroll">
<div class="motion-scroll-stage">
<img class="motion-scene-base" src="<?php echo esc_url(madar_storefront_image('coat-camel.jpg')); ?>" alt="معطف الصوف البكر الإيطالي" />
<img class="motion-scene-reveal" src="<?php echo esc_url(madar_storefront_image('coat-camel-alt.jpg')); ?>" alt="الزاوية الحركية للمعطف" />
<div class="motion-scene-copy">
<span>01 / THE MOVING EDIT</span>
<h2>كل حركة،<br /><em>حكاية مختلفة.</em></h2>
<a href="<?php echo esc_url($shop_url); ?>" class="motion-scene-link">اكتشف القطع ↗</a>
</div>
<div class="motion-scroll-cue"><span>كمّل التمرير لتتغيّر الصورة</span><span>↓</span></div>
<span class="motion-progress"><i style="width: calc(var(--scene-progress, 0) * 100%);"></i></span>
</div>
</section>

<section id="motion-elastic" class="motion-editorial">
<div class="motion-editorial-heading">
<span>02 / A DIFFERENT RHYTHM</span>
<h2>على مدار يومك.</h2>
<p>مرّر وشاهد الصور تتحرّك بإيقاعات مختلفة.</p>
</div>
<div class="motion-elastic-grid">
<a href="<?php echo esc_url($men_url); ?>" class="motion-elastic-column motion-column-0">
<img src="<?php echo esc_url(madar_storefront_image('coat-camel.jpg')); ?>" alt="عالم الرجال" loading="lazy" />
<span>01 / إيقاعك الخاص ↗</span>
</a>
<a href="<?php echo esc_url($kids_url); ?>" class="motion-elastic-column motion-column-1">
<img src="<?php echo esc_url(madar_storefront_image('kids-adventure.jpg')); ?>" alt="عالم الأطفال" loading="lazy" />
<span>02 / لحظات صغيرة ↗</span>
</a>
<a href="<?php echo esc_url($men_url); ?>" class="motion-elastic-column motion-column-2">
<img src="<?php echo esc_url(madar_storefront_image('suit-navy.jpg')); ?>" alt="عالم الرجال" loading="lazy" />
<span>03 / إيقاعك الخاص ↗</span>
</a>
</div>
</section>

<section id="motion-trail" class="motion-trail" data-img-base="<?php echo esc_url(get_stylesheet_directory_uri() . '/assets/images/'); ?>">
<span class="motion-trail-eyebrow">03 / FOLLOW YOUR CURIOSITY</span>
<h2>اتبع إحساسك.</h2>
<p class="motion-pointer-hint">حرّك المؤشر هنا… وشاهد الاختيارات تظهر.</p>
<div class="motion-touch-edit" aria-hidden="true">
<img src="<?php echo esc_url(madar_storefront_image('coat-camel.jpg')); ?>" alt="" />
<img src="<?php echo esc_url(madar_storefront_image('kids-adventure.jpg')); ?>" alt="" />
</div>
<a class="quiet-line-button" href="<?php echo esc_url($shop_url); ?>">كل اختيارات مدار ↗</a>
</section>

<!-- 8. Categories Grid -->
<section class="experience-categories">
<div class="experience-section-heading">
<span class="experience-eyebrow" dir="ltr">EVERYDAY, IN EVERY WAY</span>
<h2>ابدأ بما يشبهك.</h2>
<a href="<?php echo esc_url($shop_url); ?>">خلّينا نختار معاك ↗</a>
</div>
<div class="experience-category-grid">
<a href="<?php echo esc_url($shop_url); ?>">
<img src="<?php echo esc_url(madar_storefront_image('coat-camel.jpg')); ?>" alt="المعاطف الفاخرة" loading="lazy" width="600" height="800" />
<span>المعاطف الفاخرة ↗</span>
</a>
<a href="<?php echo esc_url($shop_url); ?>">
<img src="<?php echo esc_url(madar_storefront_image('suit-navy.jpg')); ?>" alt="البدل والتفصيل" loading="lazy" width="600" height="800" />
<span>البدل والتفصيل ↗</span>
</a>
<a href="<?php echo esc_url($shop_url); ?>">
<img src="<?php echo esc_url(madar_storefront_image('knit-cream.jpg')); ?>" alt="الكنزات والكشمير" loading="lazy" width="600" height="800" />
<span>الكنزات والكشمير ↗</span>
</a>
<a href="<?php echo esc_url($kids_url); ?>">
<img src="<?php echo esc_url(madar_storefront_image('kids-adventure.jpg')); ?>" alt="عالم الأطفال" loading="lazy" width="600" height="800" />
<span>عالم الأطفال ↗</span>
</a>
</div>
</section>

<!-- 9. Campaign Section -->
<section class="experience-campaign">
<a href="<?php echo esc_url($lookbook_url); ?>">
<img src="<?php echo esc_url(madar_storefront_image('city-edit.jpg')); ?>" alt="إطلالة رجالية في المدينة" loading="lazy" width="1100" height="1557" />
</a>
<div>
<span class="experience-eyebrow" dir="ltr">THE CITY EDIT / CHAPTER 01</span>
<h2>من أول مشوار،<br /><em>لآخر حكاية.</em></h2>
<p>إطلالات تُجمع بهدوء، وتعيش معك على مدار اليوم. اكتشف الدفتر، ثم اختر القطع التي تشبهك.</p>
<a class="quiet-cta" href="<?php echo esc_url($lookbook_url); ?>">تسوّق الإطلالة <span>←</span></a>
<span class="experience-campaign-number" dir="ltr">01 — 03 / MADAR EDITIONS</span>
</div>
</section>

<!-- 10. Journal / Stories Home -->
<section class="experience-journal-home">
<div class="experience-section-heading">
<span class="experience-eyebrow" dir="ltr">NOT JUST WHAT YOU WEAR</span>
<h2>من دفتر مدار.</h2>
<a href="<?php echo esc_url($journal_url); ?>">كل الحكايات ↗</a>
</div>
<div class="experience-story-grid">
<a href="<?php echo esc_url($journal_url); ?>">
<img src="<?php echo esc_url(madar_storefront_image('story-wardrobe.jpg')); ?>" alt="خزانة أقل. احتمالات أكثر." loading="lazy" width="800" height="1000" />
<span class="experience-eyebrow" dir="ltr">THE EVERYDAY WARDROBE</span>
<h3>خزانة أقل. احتمالات أكثر. ↗</h3>
</a>
<a href="<?php echo esc_url($journal_url); ?>">
<img src="<?php echo esc_url(madar_storefront_image('kids-adventure.jpg')); ?>" alt="مساحة صغيرة للنمو." loading="lazy" width="800" height="1000" />
<span class="experience-eyebrow" dir="ltr">LITTLE EXPLORERS</span>
<h3>مساحة صغيرة للنمو. ↗</h3>
</a>
<a href="<?php echo esc_url($journal_url); ?>">
<img src="<?php echo esc_url(madar_storefront_image('city-edit.jpg')); ?>" alt="المدينة، طبقة بعد طبقة." loading="lazy" width="800" height="1000" />
<span class="experience-eyebrow" dir="ltr">THE CITY EDIT</span>
<h3>المدينة، طبقة بعد طبقة. ↗</h3>
</a>
</div>
</section>

<!-- 11. Customer Services & Experience -->
<section class="experience-services">
<a href="<?php echo esc_url($shop_url); ?>">
<span dir="ltr">01 /</span>
<h3>مقاس أقرب ليك</h3>
<p>دليل واضح للقياس، قبل اختيار القطعة.</p>
<b>↗</b>
</a>
<a href="<?php echo esc_url($shop_url); ?>">
<span dir="ltr">02 /</span>
<h3>اختيارات على ذوقك</h3>
<p>نرتّب لك التشكيلة حسب اهتماماتك.</p>
<b>↗</b>
</a>
<a href="<?php echo esc_url($shop_url); ?>">
<span dir="ltr">03 /</span>
<h3>التفاصيل من البداية</h3>
<p>الشحن والسياسات واضحة قبل الطلب.</p>
<b>↗</b>
</a>
</section>

<!-- 12. VIP Newsletter -->
<section class="experience-newsletter">
<div>
<span class="experience-eyebrow" dir="ltr">LET GOOD THINGS FIND YOU</span>
<h2>على مدار الجديد.</h2>
<p>اشترك في نشرتنا لتصلك أحدث الإطلاقات والتشكيلات الحصرية.</p>
</div>
<form onsubmit="event.preventDefault(); this.querySelector('[role=status]').textContent = 'شكرًا لاشتراكك ✓ سنبقيك على اطلاع دائم.'; this.reset();">
<label>
البريد الإلكتروني
<div>
<input type="email" required placeholder="you@example.com" />
<button type="submit" aria-label="اشتراك">←</button>
</div>
</label>
<label class="experience-consent">
<input type="checkbox" required />
أوافق على استلام تحديثات ورسائل مدار الحصرية.
</label>
<p role="status"></p>
</form>
</section>

<!-- 13. Trust Strip -->
<?php echo madar_trust_strip('home'); ?>

</main>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_storefront_home', 'madar_storefront_home');

function madar_storefront_footer() {
    $shop_url = madar_storefront_shop_url();
    $men_url  = madar_category_url(['men', 'mens', 'rjal']);
    $kids_url = madar_category_url(['kids', 'children', 'atfal']);
    ob_start();
    ?>
<footer class="store-footer">
    <div>
        <a class="quiet-brand" href="<?php echo esc_url(home_url('/')); ?>">
            مدار
        </a>
        <p>للرجال والأطفال. هوية هادئة، تفاصيل تعيش معك.</p>
    </div>
    <div>
        <h3>اكتشف</h3>
        <a href="<?php echo esc_url($men_url); ?>">الرجال</a>
        <a href="<?php echo esc_url($kids_url); ?>">الأطفال</a>
        <a href="<?php echo esc_url($shop_url); ?>">المفضلة</a>
    </div>
    <div>
        <h3>نحن هنا</h3>
        <a href="<?php echo esc_url(madar_page_url('help')); ?>">المقاسات والشحن والأسئلة</a>
        <a href="<?php echo esc_url(madar_whatsapp_url('أهلًا مدار')); ?>" target="_blank" rel="noopener">تواصل معنا</a>
        <a href="<?php echo esc_url(madar_page_url('size-guide')); ?>">دليل المقاسات</a>
        <a href="<?php echo esc_url(madar_page_url('policies')); ?>">الخصوصية والسياسات</a>
    </div>
    <div>
        <h3>حسابك</h3>
        <a href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/my-account/')); ?>">الحساب والطلبات</a>
        <a href="<?php echo esc_url(function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/cart/')); ?>">سلة المشتريات</a>
        <a href="<?php echo esc_url(madar_page_url('about')); ?>">عن مدار</a>
        <a href="<?php echo esc_url(madar_page_url('journal')); ?>">دفتر مدار</a>
        <a href="<?php echo esc_url(madar_page_url('style-finder')); ?>">اكتشف أسلوبك</a>
    </div>
    <p class="store-footer-note">نسخة عرض: صور وأسعار ومخزون توضيحي. السلة والطلبات محفوظة في الذاكرة خلال الجلسة فقط، ولا نرسل بيانات إلى خادم.</p>
</footer>
    <?php
    return ob_get_clean();
}
add_shortcode('madar_storefront_footer', 'madar_storefront_footer');
