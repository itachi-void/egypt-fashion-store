# تقرير تركيب واختبار قالب مدار (Madar Theme v2.1.0)

**الموقع المحلي:** `capability-test.local`  
**تاريخ الفحص:** 11 أكتوبر 2026  
**ملف التحديث:** `egypt-fashion-child-2.1.0.zip`  
**SHA-256:** `5059a60b69aa90688c33f0d362f2c126acb542f579715b73923c5703c0cdf60a` (مطابق تماماً)  

---

## 1. التركيب والتحقق من الإصدار

1. **التحقق من التجزئة (Hash):**
   - SHA-256 الفعلي: `5059a60b69aa90688c33f0d362f2c126acb542f579715b73923c5703c0cdf60a` (مطابق).
2. **فحص بناء الجملة (PHP Lint):**
   - `commerce.php`: `No syntax errors detected`
   - `demo.php`: `No syntax errors detected`
   - `functions.php`: `No syntax errors detected`
   - `storefront.php`: `No syntax errors detected`
3. **التحقق من الإصدار:**
   - إصدار الثيم في `style.css` و `functions.php`: `2.1.0`
   - رابط ملف التنسيق المحمّل:  
     `http://capability-test.local/wp-content/themes/egypt-fashion-child/assets/madar.css?ver=2.1.0`

---

## 2. الإعداد: استيراد محتوى العرض

- **الاستيراد الأول:**
  - تم الضغط على زر "استيراد محتوى العرض" في لوحة التحكم (`themes.php?page=madar-settings`).
  - الرسالة الظاهرة: **`"اتستورد محتوى العرض."`** (نجح).
  - عدد المنتجات التي تحمل SKU يبدأ بـ `MDR-DEMO-`: **`10`** منتجات (من `MDR-DEMO-1` حتى `MDR-DEMO-10`).
- **الاستيراد الثاني:**
  - تم الضغط على زر "استيراد محتوى العرض" مرة ثانية.
  - الرسالة الظاهرة: **`"محتوى العرض موجود بالفعل."`** (نجح).
  - عدد المنتجات: ظل **`10`** منتجات دون تكرار أو زيادة.
- **ملاحظة:** تم الإبقاء على محتوى العرض ولم يتم حذفه.

---

## 3. جدول شروط النجاح والقيم الفعلية المقاسة

| البند | الشرط المطلوب | النتيجة | القيمة الفعلية المقاسة |
|---|---|---|---|
| **4.أ** | كل الصفحات الست ترجع 200، وفيها عنصر `.mdr-header` واحد بالضبط، و 0 أخطاء Console | **نجح** | - **`/` (الرئيسية):** HTTP `200`، عدد `.mdr-header`: `1`، أخطاء Console: `0`<br>- **`/shop/` (المتجر):** HTTP `200`، عدد `.mdr-header`: `1`، أخطاء Console: `0`<br>- **`/lookbook/` (لوكبوك):** HTTP `200`، عدد `.mdr-header`: `1`، أخطاء Console: `0`<br>- **`/journal/` (المجلة):** HTTP `200`، عدد `.mdr-header`: `1`، أخطاء Console: `0`<br>- **`/?p=141` (معطف صوف بلون الجمل):** HTTP `200`، عدد `.mdr-header`: `1`، أخطاء Console: `0`<br>- **`/checkout/` (الدفع مع منتج بالسلة):** HTTP `200`، عدد `.mdr-header`: `1`، أخطاء Console: `0` |
| **4.ب** | `/lookbook/` فيها 4 عناصر `section.mdr-look`، و `/journal/` فيها 3 عناصر `article.mdr-story` | **نجح** | - عدد `section.mdr-look` في `/lookbook/`: **`4`** (المطلوب 4 حرفياً)<br>- عدد `article.mdr-story` في `/journal/`: **`3`** (المطلوب 3 حرفياً) |
| **4.ج** | الرئيسية فيها `ul.mdr-trust--home` بـ 4 عناصر `li` | **نجح** | - عنصر `ul.mdr-trust--home`: موجود (`true`)<br>- عدد عناصر `li` داخله: **`4`** (المطلوب 4) |
| **4.د** | صفحة المنتج: `ul.mdr-trust--product` موجودة بعد زر الإضافة للسلة، وشارة `span.onsale` مخفية | **نجح** | - عنصر `ul.mdr-trust--product`: موجود (`true`)<br>- `getBoundingClientRect().top` لشريط الثقة: **`716.80px`**<br>- `getBoundingClientRect().top` لزر الإضافة للسلة: **`585.81px`**<br>- المقارنة: `716.80px > 585.81px` (يقع أسفل الزر مباشرة)<br>- حالة شارة `span.onsale`: مخفية (`display = "none"`) |
| **4.هـ** | زر `a.mdr-wa` ظاهر في الرئيسية، وغير موجود في `/checkout/` | **نجح** | - الرئيسية: الزر موجود وظاهر (`display = "flex"` والرابط `https://wa.me/201000000000...`)<br>- الدفع `/checkout/`: الزر غير موجود (`document.querySelector('a.mdr-wa') === null`) |
| **4.و** | على عرض 375: `scrollWidth = 375` في الصفحات الست | **نجح** | - الرئيسية: `scrollWidth = 375`<br>- المتجر: `scrollWidth = 375`<br>- لوكبوك: `scrollWidth = 375`<br>- المجلة: `scrollWidth = 375`<br>- معطف صوف بلون الجمل: `scrollWidth = 375`<br>- الدفع: `scrollWidth = 375` |
| **4.ز** | إتمام طلب دفع عند الاستلام لمنتج من محتوى العرض، وتسجيل رقم الطلب ولقطة 1440 | **نجح** | - المنتج: "معطف صوف بلون الجمل" (MDR-DEMO-10)<br>- **رقم الطلب (Order ID): `148`**<br>- رابط الاستلام: `/checkout/order-received/148/?key=wc_order_7VA8eOvwPhgYe`<br>- تم أخذ لقطة كاملة: `order_received_1440.png` |

---

## 4. قائمة لقطات الشاشة المرفقة (`review/madar-v210/screenshots/`)

تم التقاط جميع اللقطات كاملة الطول (Full-Length) بدقة عالية:

1. `home_1440.png` & `home_375.png` (الرئيسية)
2. `shop_1440.png` & `shop_375.png` (المتجر)
3. `lookbook_1440.png` & `lookbook_375.png` (لوكبوك)
4. `journal_1440.png` & `journal_375.png` (المجلة)
5. `camel_coat_1440.png` & `camel_coat_375.png` (معطف صوف بلون الجمل)
6. `checkout_1440.png` & `checkout_375.png` (الدفع مع وجود منتج بالسلة)
7. `order_received_1440.png` (تم استلام الطلب - طلب رقم 148 على 1440)
