# تقرير تحديث واختبار قالب مدار (Madar Theme v2.0.1)

**الموقع المحلي:** `capability-test.local`  
**تاريخ الفحص:** 11 أكتوبر 2026  
**ملف التحديث:** `egypt-fashion-child-2.0.1.zip`  
**SHA-256:** `aa7ef6198915785344470e6cd0eaac21898910c18df22a6b460bf002263592b8` (مطابق تماماً)  

---

## 1. التجهيز والتركيب

1. **النسخة الاحتياطية (v2.0.0):**
   - تم نسخ مجلد `themes/egypt-fashion-child` إلى:  
     `C:\Users\itachi\Downloads\madar-backups\egypt-fashion-child-v2.0.0`
   - إجمالي عدد الملفات: 14 ملفاً.

2. **التركيب:**
   - فك الأرشيف في `C:\Users\itachi\Downloads\madar-v201-extract`.
   - مسح محتوى `themes/egypt-fashion-child` ونسخ محتويات v2.0.1.
   - عدد الملفات بعد التركيب: **15 ملفاً** (بما فيها الملف الجديد `parts/checkout-header.html`).

3. **فحص الـ PHP Syntax (`php -l`):**
   - `commerce.php`: `No syntax errors detected` (نجح)
   - `functions.php`: `No syntax errors detected` (نجح)
   - `storefront.php`: `No syntax errors detected` (نجح)

4. **التحقق من إصدار CSS (البند 5):**
   - `link#madar-css`: موجود ويحتوي على `ver=2.0.1`  
     (`http://capability-test.local/wp-content/themes/egypt-fashion-child/assets/madar.css?ver=2.0.1`)

---

## 2. ناتج قياس الخطوة 1 (قبل التحديث وبعده)

### قبل التحديث (على v2.0.0، عرض 1440، صفحة `/cart/` بها منتج):
- `[scrollWidth, clientWidth]`: `[1425, 1425]`
- العناصر المتجاوزة للشاشة: `[]`

### بعد التحديث (على v2.0.1، عرض 1440، على الـ 5 صفحات المطلوبة):
1. **`/cart/`**:
   - `[scrollWidth, clientWidth]`: `[1425, 1425]`
   - العناصر المتجاوزة للشاشة: `[]`
2. **`/` (الرئيسية)**:
   - `[scrollWidth, clientWidth]`: `[1425, 1425]`
   - العناصر خارج إطار العرض:
     ```json
     [
       "mdr-marquee__track L=-331 R=1467",
       " L=1326 R=1467",
       " L=-44 R=108",
       " L=-331 R=-116",
       "wc-block-mini-cart__drawer wc-block-components-drawer is-mobile L=-480 R=0",
       "wc-block-components-drawer__content L=-480 R=0",
       "wc-block-mini-cart__template-part L=-480 R=0",
       "wp-block-woocommerce-mini-cart-contents L=-480 R=0"
     ]
     ```
     *(ملاحظة: شريط الأخبار المتحرك marquee ودرج السلة المصغرة موضوع خارج الشاشة جهة اليسار L=-480 لحين فتحه، والصفحة نفسها scrollWidth = clientWidth ولا يوجد أي شريط تمرير أفقي)*
3. **`/shop/` (المتجر)**:
   - `[scrollWidth, clientWidth]`: `[1425, 1425]`
   - العناصر خارج إطار العرض:
     ```json
     [
       "wc-block-mini-cart__drawer wc-block-components-drawer is-mobile L=-480 R=0",
       "wc-block-components-drawer__content L=-480 R=0",
       "wc-block-mini-cart__template-part L=-480 R=0",
       "wp-block-woocommerce-mini-cart-contents L=-480 R=0",
       "wc-block-components-drawer__close-wrapper L=-480 R=0",
       "wc-block-components-button wp-element-button wc-block-components-drawer__close c L=-481 R=-429",
       "[object SVGAnimatedString] L=-467 R=-443",
       "[object SVGAnimatedString] L=-462 R=-447"
     ]
     ```
4. **`/?p=24` (منتج متغير)**:
   - `[scrollWidth, clientWidth]`: `[1425, 1425]`
   - العناصر خارج إطار العرض:
     ```json
     [
       "wc-block-mini-cart__drawer wc-block-components-drawer is-mobile L=-480 R=0",
       "wc-block-components-drawer__content L=-480 R=0",
       "wc-block-mini-cart__template-part L=-480 R=0",
       "wp-block-woocommerce-mini-cart-contents L=-480 R=0",
       "wc-block-components-drawer__close-wrapper L=-480 R=0",
       "wc-block-components-button wp-element-button wc-block-components-drawer__close c L=-481 R=-429",
       "[object SVGAnimatedString] L=-467 R=-443",
       "[object SVGAnimatedString] L=-462 R=-447"
     ]
     ```
5. **`/checkout/` (صفحة الدفع)**:
   - `[scrollWidth, clientWidth]`: `[1425, 1425]`
   - العناصر المتجاوزة للشاشة: `[]`

---

## 3. جدول فحص البنود من 6 إلى 11 والقيم الخام

| البند | الفحص | النتيجة | القيم والبيانات الخام المقاسة |
|---|---|---|---|
| **6** | فحص الإزاحة وتطابق `scrollWidth = clientWidth` على الـ 5 صفحات | **نجح** | - `scrollWidth === clientWidth` (`1425px`) على كافة الصفحات الـ 5 بدون أي شريط تمرير أفقي.<br>- القائمة الثانية فارغة تماماً في `/cart/` و `/checkout/`، وتحتوي فقط على عناصر خارج الشاشة (الدرج المغلق L=-480 وشريط الـ marquee) في الصفحات الأخرى. |
| **7** | فحص صفحة `/checkout/` (الترويسة، سياسة الخصوصية، تخطيط الشبكة) | **نجح** | - **الترويسة:** ترويسة مدار كاملة تحتوي على `.mdr-brand` (`<a class="mdr-brand" ...>مدار<span>MADAR</span></a>`) وليست اسم الموقع.<br>- **نص الخصوصية:** `"بنستخدم بياناتك عشان نجهّز طلبك ونحسّن تجربتك على الموقع، وللأغراض الموضّحة في سياسة الخصوصية."` (يبدأ بـ "بنستخدم بياناتك").<br>- **أعمدة الشبكة على 1440:** `gridTemplateColumns = "541.328px 386.656px"`. |
| **8** | إتمام طلب تجريبي بالدفع عند الاستلام (COD) | **نجح** | - تم الطلب بنجاح والتوجيه إلى `/checkout/order-received/82/?key=wc_order_c7i5gwPWUPTMK`<br>- **رقم الطلب (Order ID): `82`** |
| **9** | عنوان قسم المنتجات المقترحة في `/?p=24` | **نجح** | - نص العنوان المقاس: **`"كمّل اللوك"`** (`h2.wp-block-heading`) |
| **10** | رابط "عرض السلة" في رسالة الإضافة إلى السلة | **نجح** | - `outerHTML` (أول 200 حرف):<br>`<a href="http://capability-test.local/cart/" class="added_to_cart wc_forward" title="عرض السلة">\n\t\t\t\t\tعرض السلة\n\t\t\t\t</a>` |
| **11** | فتح وإغلاق السلة المصغّرة من الترويسة على 1440 و375 | **نجح** | - **على 1440:** فُتح الدرج بنجاح (`opened: true`، الأبعاد: `480x900`) وأُغلق بنجاح (`closed: true`).<br>- **على 375:** فُتح الدرج بنجاح (`opened: true`، الأبعاد: `375x667`) وأُغلق بنجاح (`closed: true`). |

---

## 4. فحص لقطات الشاشة (البند 12) والإزاحة الأفقية

- **حالة الإزاحة الأفقية على 1440 (Full Page):**
  - الرئيسية (`home_1440_full.png`): `scrollWidth = 1440`, `clientWidth = 1440` -> **لا توجد أي إزاحة أفقية**.
  - الدفع (`checkout_1440_full.png`): `scrollWidth = 1440`, `clientWidth = 1440` -> **لا توجد أي إزاحة أفقية**.

- **ملفات اللقطات في المجلد `review/madar-v201/screenshots/`:**
  1. `home_1440_vp.png` (الرئيسية - Viewport 1440)
  2. `shop_1440_vp.png` (المتجر - Viewport 1440)
  3. `p24_top_1440_vp.png` (المنتج المتغير أعلى الصفحة - Viewport 1440)
  4. `p24_related_1440_vp.png` (المنتج المتغير بعد التمرير لقسم كمّل اللوك - Viewport 1440)
  5. `cart_1440_vp.png` (السلة - Viewport 1440)
  6. `checkout_1440_vp.png` (الدفع - Viewport 1440)
  7. `checkout_375.png` (الدفع - Full Page 375)
  8. `cart_375.png` (السلة - Full Page 375)
  9. `p24_375.png` (المنتج المتغير - Full Page 375)
  10. `home_1440_full.png` (الرئيسية - Full Page 1440)
  11. `checkout_1440_full.png` (الدفع - Full Page 1440)
