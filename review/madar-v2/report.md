# تقرير تركيب واختبار قالب مدار (Madar Theme v2.0.0)

**الموقع المحلي:** `capability-test.local`  
**تاريخ الفحص:** 11 أكتوبر 2026  
**ملف التحديث:** `egypt-fashion-child-2.0.0.zip`  
**SHA-256:** `4b69b48c2ec219fdcaca75e3203cb7548ec0c1e641f447705f0051bd549b15a3`  

---

## 1. ملخص خطوات التجهيز والتركيب

1. **النسخة الاحتياطية:**
   - تم نسخ مجلد `themes/egypt-fashion-child` بالكامل إلى:  
     `C:\Users\itachi\Downloads\madar-backups\egypt-fashion-child-v1`
   - إجمالي عدد الملفات في النسخة الاحتياطية: **19 ملفًا**.

2. **التركيب:**
   - تم فك أرشيف `egypt-fashion-child-2.0.0.zip` إلى مجلد مؤقت `C:\Users\itachi\Downloads\madar-v2-extract`.
   - تم مسح محتويات `themes/egypt-fashion-child` فقط، ونسخ محتويات v2.0.0 بدلاً منها.
   - إجمالي عدد الملفات بعد التركيب: **14 ملفًا** بالتمام:
     - `commerce.php`
     - `functions.php`
     - `storefront.php`
     - `style.css`
     - `theme.json`
     - `parts/header.html`
     - `parts/footer.html`
     - `templates/front-page.html`
     - `assets/madar.css`
     - `assets/madar.js`
     - `assets/images/campaign.jpg`
     - `assets/images/city-edit.jpg`
     - `assets/images/coat.jpg`
     - `assets/images/kids.jpg`

3. **فحص الـ PHP Syntax (`php -l`):**
   - `commerce.php`: `No syntax errors detected in commerce.php` (نجح)
   - `functions.php`: `No syntax errors detected in functions.php` (نجح)
   - `storefront.php`: `No syntax errors detected in storefront.php` (نجح)

4. **تفعيل سجل الأخطاء:**
   - تم تفعيل `WP_DEBUG_LOG` و `WP_DEBUG` مع تعطيل `WP_DEBUG_DISPLAY` في `wp-config.php`.
   - تم مسح الكاش بالكامل وعمل Hard Reload.

---

## 2. جدول الفحص السريع (البنود 8 و 9)

| # | الصفحة / الفحص | كود HTTP | أخطاء Console | سطور جديدة في debug.log | النتيجة |
|---|---|---|---|---|---|
| 8.1 | الرئيسية `/` | 200 OK | 0 | 0 | نجح |
| 8.2 | المتجر `/shop/` | 200 OK | 0 | 0 | نجح |
| 8.3 | القسم `/product-category/clothing/` | 200 OK | 0 | 0 | نجح |
| 8.4 | منتج متغير `/?p=24` | 200 OK | 0 | 0 | نجح |
| 8.5 | منتج بسيط `/?p=42` | 200 OK | 0 | 0 | نجح |
| 8.6 | السلة `/cart/` (بعد إضافة منتج) | 200 OK | 0 | 0 | نجح |
| 8.7 | الدفع `/checkout/` | 200 OK | 0 | 0 | نجح |
| 8.8 | حسابي (مسجل خروج) `/my-account/` | 200 OK | 0 | 0 | نجح |
| 8.9 | البحث `/?s=تيشيرت&post_type=product` | 200 OK | 0 | 0 | نجح |
| 9 | فحص عناصر CSS (`link#madar-css` ver=2.0.0، وغياب `madar-storefront-css` و `madar-catalog-css`) | - | - | - | نجح |

**القيم الخام للبند 9:**
- `link#madar-css`: موجود بقيمة `http://capability-test.local/wp-content/themes/egypt-fashion-child/assets/madar.css?ver=2.0.0`
- `link#madar-storefront-css`: غير موجود (`null`)
- `link#madar-catalog-css`: غير موجود (`null`)

---

## 3. جدول فحص الوظائف والقيم الخام (البنود 10 إلى 15)

| البند | الوصف | النتيجة | القيم الخام المقاسة |
|---|---|---|---|
| **10** | الترويسة على عرض 375: ظهور `#mdr-nav`، ارتفاع الترويسة، ظهور `#mdr-search`، تجربة بحث فعلي | **نجح** | - كلاس القائمة: `is-open`<br>- ارتفاع الترويسة الأولي: `102px`، بعد فتح القائمة: `194px`<br>- `#mdr-search`: `hidden = false`<br>- البحث: تم بنجاح وتوجيه المستخدم إلى صفحة النتائج `/?s=%D8%AA%D9%8A%D8%B4%D9%8A%D8%B1%D8%AA&post_type=product` |
| **11** | فتح السلة المصغّرة من الترويسة | **نجح** | `drawerOpened: true`، فتحت السلة المصغّرة (`#mdr-drawer-cart`) مع `aria-expanded = true` وعرض العناصر الحالية |
| **12** | المتجر: أعمدة الشبكة، الفلاتر والترتيب، كثافة العرض | **نجح** | - `gridTemplateColumns` على 1440: `302.97px 302.97px 302.97px 302.97px` (4 أعمدة)<br>- `gridTemplateColumns` على 375: `162.5px 162.5px` (عمودان)<br>- فتح درج الفلاتر: `dialog#mdr-filters` مفتوح (`open: true`)<br>- إعادة الترتيب (السعر: من الأقل): تم التوجيه إلى `orderby=price`<br>- زر "صور أكبر": إضافة كلاس `mdr-density-large`، وتحول الشبكة إلى عمود واحد `335px` |
| **13** | المنتج المتغير `/?p=24`: الأزرار، التبديل، المخزون، دليل المقاسات، بادئة التصنيف | **نجح** | - عدد أزرار المقاس: 4 أزرار (`L`, `M`, `S`, `XL`)<br>- عدد أزرار اللون: زرّان (`أبيض`, `أسود`)<br>- اختيار S ثم أبيض: السعر `250.00 ج.م`، المخزون `"متوفر في المخزون"`، `disabled = false`<br>- اختيار XL ثم أسود: المخزون `"غير متوفر في المخزون"`، `disabled = true`، الزر عليه كلاس `is-soldout: true`<br>- إضافة منتج متوفر: تحديث عداد السلة من 1 إلى 2 بنجاح<br>- دليل المقاسات: فتح وإغلاق `dialog#mdr-size-guide` بنجاح (`open: true` ثم `open: false`)<br>- بادئة التصنيف: `"التصنيف: "` (`.wp-block-post-terms__prefix`)<br>- سطر SKU: `"رمز المنتج: TEST-TSHIRT-VAR"` |
| **14** | إتمام طلب تجريبي بالدفع عند الاستلام (COD) | **نجح** | - تم الدفع عند الاستلام والتوجيه لصفحة تم استلام الطلب<br>- **رقم الطلب (Order ID): 81**<br>- رابط الطلب: `/checkout/order-received/81/?key=wc_order_HbEo5SSB71O6L` |
| **15** | لوحة الحساب: تسجيل الدخول وظهور القوائم والطلبات | **نجح** | - تسجيل الدخول بحساب الفحص التجريبي (`storefront-tester`) بنجاح<br>- قائمة الحساب تحتوي على 6 عناصر: `لوحة التحكم`، `الطلبات`، `التنزيلات`، `العنوان`، `تفاصيل الحساب`، `تسجيل الخروج`<br>- رابط وقسم الطلبات متاح ويعمل بنجاح |

---

## 4. قائمة لقطات الشاشة المرفقة (`review/madar-v2/screenshots/`)

تم التقاط 24 لقطة شاشة بدقة متناهية (Full Page و Dialogs) على أبعاد 1440px و 375px:

1. `home_1440.png` & `home_375.png` (الرئيسية)
2. `shop_1440.png` & `shop_375.png` (المتجر)
3. `category_1440.png` & `category_375.png` (القسم)
4. `variable-product_1440.png` & `variable-product_375.png` (المنتج المتغير `/?p=24`)
5. `cart_1440.png` & `cart_375.png` (السلة)
6. `checkout_1440.png` & `checkout_375.png` (الدفع)
7. `order_received_1440.png` & `order_received_375.png` (تم استلام الطلب - طلب رقم 81)
8. `account_logged_out_1440.png` & `account_logged_out_375.png` (حسابي - مسجل خروج)
9. `account_logged_in_1440.png` & `account_logged_in_375.png` (حسابي - مسجل دخول)
10. `search_1440.png` & `search_375.png` (نتائج البحث)
11. `header_menu_open_375.png` (القائمة مفتوحة على عرض 375)
12. `filters_drawer_open.png` (درج الفلاتر والترتيب مفتوح)
13. `size_guide_dialog_open.png` (دليل المقاسات مفتوح)
14. `mini_cart_drawer_open.png` (السلة المصغّرة مفتوحة)
