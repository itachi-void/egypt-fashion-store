# تقرير إصلاح wpautop على الموقع المحلي capability-test

تاريخ التنفيذ والتحقق: 2026-10-11
البيئة: local capability-test (WordPress 7.1.3, WooCommerce 11.1.2, PHP 8.2.29)

---

## أ) تأكيد التشخيص قبل أي تعديل

### 1. فحص أبناء شبكة أقسام الرجال والأطفال (`#madar-worlds .madar:grid`) على عرض 1440
- **الكود المنفذ في Console:**
```javascript
const g = document.querySelector('#madar-worlds .madar\\:grid');
[...g.children].map(c => c.tagName)
```
- **الناتج الخام:**
```json
["A", "P", "A", "P"]
```
- **التشخيص:** وجود وسوم `<p>` و `<br>` طفيلية بين بطاقات الروابط `<a>` تكسر شبكة الـ CSS Grid.

### 2. فحص وسوم BR والفقرات الفارغة في الهيدر والفوتر
- **الكود المنفذ في Console:**
```javascript
document.querySelectorAll('header br, header p:empty, footer br').length
```
- **الناتج الخام:**
```text
17
```
- **ارتفاع الترويسة على 375 قبل التعديل:**
```text
311.171875 px
```

---

## ب) النسخ الاحتياطية

3. تم إنشاء نسخ احتياطية للملفات الثلاثة بإضافة `.bak-autop`:
- `wp-content/themes/egypt-fashion-child/templates/front-page.html.bak-autop`
- `wp-content/themes/egypt-fashion-child/parts/header.html.bak-autop`
- `wp-content/themes/egypt-fashion-child/parts/footer.html.bak-autop`

---

## ج) التعديل (استبدال محتوى 3 ملفات)

### 4. `templates/front-page.html`:
```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:html -->
[madar_storefront_home]
<!-- /wp:html -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

### 5. `parts/header.html`:
```html
<!-- wp:html -->
[madar_storefront_header]
<!-- /wp:html -->
```

### 6. `parts/footer.html`:
```html
<!-- wp:html -->
[madar_storefront_footer]
<!-- /wp:html -->
```

### 7. التأكد من عدم وجود نسخ مخزنة في قاعدة البيانات:
- **استعلام SQL:**
```sql
SELECT COUNT(*) FROM wp_posts WHERE post_type IN ('wp_template', 'wp_template_part');
```
- **الناتج الخام:**
```text
COUNT: 0
```

---

## د) التحقق بعد التعديل

### 8. Hard reload للرئيسية والتحقق من الشورت كود
- **الفحص:**
```javascript
(() => {
    const text = document.body.innerText;
    const html = document.body.innerHTML;
    return {
        hasHome: text.includes('[madar_storefront_home]') || html.includes('[madar_storefront_home]'),
        hasHeader: text.includes('[madar_storefront_header]') || html.includes('[madar_storefront_header]'),
        hasFooter: text.includes('[madar_storefront_footer]') || html.includes('[madar_storefront_footer]')
    };
})()
```
- **الناتج الخام:**
```json
{"hasHome": false, "hasHeader": false, "hasFooter": false}
```
- **النتيجة:** لم يظهر أي نص شورت كود حرفي، وفُسرت جميعها إلى HTML سليم.

### 9. إعادة تشغيل خطوة 1 و 2
- **أبناء الشبكة:**
```javascript
const g = document.querySelector('#madar-worlds .madar\\:grid');
[...g.children].map(c => c.tagName)
```
  - **الناتج الخام:** `["A", "A"]` (المطلوب: `[A, A]`)
- **العناصر غير المرغوبة:**
```javascript
document.querySelectorAll('header br, header p:empty, footer br').length
```
  - **الناتج الخام:** `0` (المطلوب: `0`)

### 10. التحقق من التنسيق على 1440
- **هل "للرجال" و"للأطفال" جنب بعض؟** نعم (`sideBySide: true`).
  - موضع `menRect.top`: `1229.46875 px`
  - موضع `kidsRect.top`: `1229.46875 px`
  - عرض كل بطاقة: `625.25 px`
- **قيمة `gridTemplateColumns`:**
```text
625.25px 625.25px
```

### 11. ارتفاع الترويسة على 375
- **قبل التعديل:** `311.171875 px`
- **بعد التعديل:** `249.390625 px`
- **الفرق:** انخفاض بمقدار `61.78 px` بعد إزالة الفقرات والفواصل الفارغة.

---

## هـ) الصور المصغّرة

### 12. تشغيل `wp media regenerate --yes`
- **الناتج الخام:**
```text
Found 8 images to regenerate.
1/8 Regenerated thumbnails for "Sunglasses Classic (Test)" (ID 22).
2/8 Regenerated thumbnails for "Card Wallet (Test)" (ID 23).
3/8 Regenerated thumbnails for "Leather Bracelet (Test)" (ID 19).
4/8 Regenerated thumbnails for "Casual Jeans (Test)" (ID 20).
5/8 Regenerated thumbnails for "Winter Hoodie (Test)" (ID 21).
6/8 Regenerated thumbnails for "T-Shirt Cotton (Test)" (ID 18).
7/8 Regenerated thumbnails for "woocommerce-placeholder" (ID 8).
8/8 Regenerated thumbnails for "Integration Test Media" (ID 5).
Success: Regenerated 8 of 8 images.
```

### 13. فحص الصور المكسورة (`naturalWidth === 0`) بعد Scroll بطيء
- **على 1440:** `[]` (0 صور مكسورة)
- **على 375:** `[]` (0 صور مكسورة)

### 14. فحص صورة `city-edit.jpg` تحديداً بعد الـ Scroll
- **الناتج الخام:**
```json
{
  "found": true,
  "src": "http://capability-test.local/wp-content/themes/egypt-fashion-child/assets/images/city-edit.jpg",
  "naturalWidth": 1100,
  "naturalHeight": 1557,
  "complete": true,
  "displayedWidth_1440": 712.5,
  "displayedHeight_1440": 540,
  "displayedWidth_375": 375,
  "displayedHeight_375": 540,
  "isVisible": true
}
```

---

## و) التفاعلات واللقطات

### 16. التفاعلات والكونسول
- **السلة المصغرة في الترويسة:** تفتح بسلاسة ودرج السلة يظهر كاملاً (`cartBtnFound: true, cartOpens: true`).
- **روابط الترويسة والحساب:** جميعها تعمل وسليمة (`/`, `/shop/`, `/#madar-worlds`, `/my-account/`).
- **أخطاء Console:** `0` أخطاء (صفر أخطاء عبر جميع الصفحات).

### 15. اللقطات المأخوذة بعد الـ Scroll الكامل
جميع اللقطات محفوظة في `review/screenshots-after-autop-fix/`:
1. `home_1440.png` (2,309,166 bytes, 1440x4631 px)
2. `home_375.png` (3,719,507 bytes, 375x7094 px)
3. `shop_1440.png` (87,646 bytes, 1440x2218 px)
4. `shop_375.png` (158,022 bytes, 375x2275 px)
5. `variable-product_1440.png` (107,012 bytes, 1440x2040 px)
6. `variable-product_375.png` (213,829 bytes, 375x3072 px)
7. `cart_1440.png` (64,707 bytes, 1440x1491 px)
8. `cart_375.png` (138,524 bytes, 375x1639 px)
