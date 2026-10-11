# تقرير ترقية catalog.css v3 والتحقق من المنتجات ذات الصلة والتبويبات ومصدر Category

تاريخ التنفيذ: 2026-10-11
البيئة: local capability-test (WordPress 7.1.3, WooCommerce 11.1.2, PHP 8.2.29)

---

## أ) catalog.css v3

1. **SHA-256 قبل الإضافة:**
   `ab43152697966c0c608eebf86bd384306f7e02081c9fd259618ec10e700c42fe`
   (مطابق تماماً).

2. **النسخة الاحتياطية:**
   تم حفظ الملف باسم: `wp-content/themes/egypt-fashion-child/assets/catalog.css.bak-v2`.

3. **إضافة بلوك v3:**
   تمت إضافة البلوك في نهاية الملف بعد سطر فارغ واحد من `}` الأخيرة، بنهايات أسطر LF وبمسافات بادئة 4 spaces، وينتهي بسطر جديد واحد.

4. **التحقق من مواصفات الملف:**
   - عدد الأسطر: **204 سطر**.
   - نهايات الأسطر: **LF**.
   - **SHA-256 المحسوب:** `028a3b2af2ad8bb5b6ad567666444d5a904bb155f2e8c0ba89abf40f1c1a8ab7`
   (مطابق 100% للقيمة المستهدفة).

5. **تعديل `functions.php` وفحص الصياغة:**
   - تم تعديل رقم الإصدار في سطر تسجيل `madar-catalog` من `'0.2.0'` إلى `'0.3.0'`.
   - السطر بعد التعديل:
     `wp_enqueue_style( 'madar-catalog', get_stylesheet_directory_uri() . '/assets/catalog.css', [ 'madar-storefront' ], '0.3.0' );`
   - ناتج `php -l`:
     `No syntax errors detected in wp-content\themes\egypt-fashion-child\functions.php`

6. **التحقق من رابط CSS بعد Hard Reload:**
   - تم فحص عنصر `link#madar-catalog-css` في صفحة المنتج:
     - `linkFound`: `true`
     - `href`: `http://capability-test.local/wp-content/themes/egypt-fashion-child/assets/catalog.css?ver=0.3.0`
     - يتضمن `ver=0.3.0`.

---

## ب) تحقق صفحة المنتج `/?p=24` على 375 و 1440

### 7. المنتجات ذات الصلة (Related Products)
- **على عرض 1440:**
  - `gridTemplateColumns`: `308.75px 308.75px 308.75px 308.75px` (4 أعمدة).
  - صورة أول منتج:
    - `aspectRatio`: `3 / 4`
    - `objectFit`: `contain`
- **على عرض 375:**
  - `gridTemplateColumns`: `142.5px 142.5px` (عمودان).
  - صورة أول منتج:
    - `aspectRatio`: `3 / 4`
    - `objectFit`: `contain`

### 8. التبويبات (Product Tabs)
- **outerHTML لأول 300 حرف من `ul.tabs`:**
```html
<ul class="tabs wc-tabs" role="tablist">
							<li role="presentation" class="description_tab active" id="tab-title-description">
					<a href="#tab-description" role="tab" aria-controls="tab-description" aria-selected="true" tabindex="0">
						الوصف					</a>
				</li>
							<li role="presentatio
```
- **خاصية `display` لـ `ul.tabs`:**
  `flex`
- **هل التبويبات في سطر واحد على عرض 375؟**
  - إحداثيات `top` لكل `li`:
    `[1241.234375, 1241.234375, 1317.90625]`
  - النتيجة: أول تبويبين ("الوصف" و "معلومات إضافية") يقعان في سطر واحد على نفس خط الارتفاع `1241.23px`، بينما التبويب الثالث ("مراجعات (0)") يلتف إلى السطر التالي (`1317.91px`) لتطبيق `flex-wrap: wrap` وضيق عرض شاشة الجوال (375px) عن استيعاب النصوص الثلاثة والمسافات البينية.

### 9. اختبار الضغط على كل تبويب وتغيير المحتوى
- تبويب **"الوصف"**:
  - العنصر النشط: `الوصف`
  - الـ Panel الظاهر: `#tab-description`
  - محتوى الـ Panel: "الوصف: تيشيرت قطني تجريبي مخصص لاختبار قدرات متجر WooCommerce..."
- تبويب **"معلومات إضافية"**:
  - العنصر النشط: `معلومات إضافية`
  - الـ Panel الظاهر: `#tab-additional_information`
  - محتوى الـ Panel: "معلومات إضافية: المقاس: L, M, S, XL | اللون: أبيض, أسود"
- تبويب **"مراجعات (0)"**:
  - العنصر النشط: `مراجعات (0)`
  - الـ Panel الظاهر: `#tab-reviews`
  - محتوى الـ Panel: "المراجعات: لا توجد مراجعات بعد. كن أول من يقيم..."
- **النتيجة:** التبديل يعمل بسلاسة كاملة ويتغير المحتوى مع كل نقرة.

### 10. التحقق من صفحة المتجر `/shop/` (عدم كسر v2)
- على عرض 1440:
  `gridTemplateColumns`: `312.5px 312.5px 312.5px 312.5px` (4 أعمدة).
- على عرض 375:
  `gridTemplateColumns`: `142.5px 142.5px` (عمودان).
- **النتيجة:** قواعد v3 المطبقة على `body.single-product` لم تؤثر على صفحات الأرشيف والمتجر.

---

## ج) فحص مصدر كلمة "Category:"

### 11. outerHTML لأول 300 حرف للعنصر الحاوي للكلمة:
```html
<div class="taxonomy-product_cat wp-block-post-terms"><span class="wp-block-post-terms__prefix">Category: </span><a href="http://capability-test.local/product-category/clothing/" rel="tag">ملابس</a></div>
```

### 12. ناتج تشغيل البحث `rg -n "Category:"`:
- **مجلد القالب الابن (`egypt-fashion-child`):** لا توجد أي نتائج (0 مطابقة).
- **مجلد القالب الأب (`twentytwentyfive`):** لا توجد أي نتائج (0 مطابقة).
- **مجلدات WooCommerce (`templates`, `patterns`, `src`):**
  1. `wp-content/plugins/woocommerce/templates/templates/blockified/single-product.html:34: <!-- wp:post-terms {"term":"product_cat","prefix":"Category: "} /-->`
  2. `wp-content/plugins/woocommerce/templates/single-product/meta.php:36: <?php echo wc_get_product_category_list( $product->get_id(), ', ', '<span class="posted_in">' . _n( 'Category:', 'Categories:', count( $product->get_category_ids() ), 'woocommerce' ) . ' ', '</span>' ); ?>`
- **التشخيص الدقيق للمصدر:**
  الكلمة غير مترجمة لأنها قادمة من قالب الكتل المكتل الافتراضي لـ WooCommerce في `templates/blockified/single-product.html` السطر 34، حيث تم وضع البادئة `"prefix":"Category: "` كخاصية نصية صريحة (Block Attribute) داخل تعريف الكتلة `wp:post-terms`، والسمات النصية للكتل في قوالب HTML لا تمر عبر دوال الترجمة القياسية `__()` أو `_n()`.

### 13. قيم اللغات ومجال الترجمة:
- `get_locale()`: **`ar`**
- `get_user_locale()`: **`ar`**
- `is_textdomain_loaded('woocommerce')`: **`yes`**

---

## د) اللقطات المأخوذة

جميع اللقطات محفوظة في `review/screenshots-catalog-v3/`:
1. `product_1440.png` (104,732 bytes, 1440x2190 px) - صفحة المنتج كاملة على عرض 1440.
2. `product_375.png` (245,570 bytes, 375x3128 px) - صفحة المنتج كاملة على عرض 375.
3. `shop_375.png` (148,953 bytes, 375x2275 px) - صفحة المتجر كاملة على عرض 375 بعد scroll.
4. `tabs_magnified_375.png` (22,618 bytes, 335x154 px @ 2x) - لقطة مكبرة للتبويبات على عرض 375.
