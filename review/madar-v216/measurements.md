# قياسات قالب مدار (Madar v2.1.6) — جدول القياسات الفعلية الدقيقة

**تاريخ القياس:** 12 أكتوبر 2026  
**أداة القياس:** Chrome DevTools Protocol (`getComputedStyle` و `getBoundingClientRect`)  
**العروض المقاسة:** 375px (موبايل) و 1440px (ديسكتوب)  

## 1. الترويسة والخطوط (Header & Typography)

| العنصر | مقاس 375px (موبايل) | مقاس 1440px (ديسكتوب) |
|---|---|---|
| **ارتفاع الترويسة (Header Height)** | `148.09375px` | `195.359375px` |
| **العنوان الرئيسي (H1 / Hero Title)** | حجم: `52px`، سطر: `71.76px` | حجم: `83.52px`، سطر: `115.258px` |
| **العنوان الفرعي (H2 / Section Title)** | حجم: `32px`، سطر: `41.6px` | حجم: `56px`، سطر: `72.8px` |
| **نص الفقرة (Body Text)** | حجم: `18.1964px`، سطر: `34.5731px` | حجم: `21.9984px`، سطر: `41.797px` |
| **أزرار الإجراء (Buttons)** | حجم: `24px`، سطر: `normal` | حجم: `13.3333px`، سطر: `normal` |

## 2. كروت المنتجات وشبكة المتجر (Cards & Grid)

| البند | مقاس 375px (موبايل) | مقاس 1440px (ديسكتوب) |
|---|---|---|
| **أبعاد كارت المنتج (Card Dimensions)** | `161.5px` × `329px` | `305.625px` × `497.09375px` |
| **نسبة أبعاد الصورة (Image Aspect Ratio)** | `0.750` | `0.750` |
| **المسافة بين الكروت (Grid Gap)** | `26px 12px` | `34px 20px` |
| **عدد أعمدة المتجر (/shop/ Columns)** | **2 عمود** | **4 أعمدة** |

## 3. فحص التمرير الأفقي الزائد (Horizontal Overflow: scrollWidth > innerWidth)

| الصفحة | 375px (موبايل) | 1440px (ديسكتوب) | النتيجة |
|---|---|---|---|
| **home** | ✅ 0 (scrollWidth = 375px) | ✅ 0 (scrollWidth = 1425px) | **PASS** |
| **shop** | ✅ 0 (scrollWidth = 375px) | ✅ 0 (scrollWidth = 1425px) | **PASS** |
| **category_men** | ✅ 0 (scrollWidth = 375px) | ✅ 0 (scrollWidth = 1425px) | **PASS** |
| **category_kids** | ✅ 0 (scrollWidth = 375px) | ✅ 0 (scrollWidth = 1425px) | **PASS** |
| **product_simple** | ✅ 0 (scrollWidth = 375px) | ✅ 0 (scrollWidth = 1425px) | **PASS** |
| **product_variable** | ✅ 0 (scrollWidth = 375px) | ✅ 0 (scrollWidth = 1425px) | **PASS** |
| **cart** | ✅ 0 (scrollWidth = 375px) | ✅ 0 (scrollWidth = 1425px) | **PASS** |
| **checkout** | ✅ 0 (scrollWidth = 375px) | ✅ 0 (scrollWidth = 1425px) | **PASS** |
| **my_account** | ✅ 0 (scrollWidth = 385px) | ✅ 0 (scrollWidth = 1425px) | **PASS** |
| **lost_password** | ✅ 0 (scrollWidth = 385px) | ✅ 0 (scrollWidth = 1425px) | **PASS** |
| **search** | ✅ 0 (scrollWidth = 375px) | ✅ 0 (scrollWidth = 1425px) | **PASS** |

## 4. تباين الألوان (WCAG AA Contrast Ratios)

| العنصر | نسبة التباين المقاسة | الحد الأدنى المطلوب | التوافق |
|---|---|---|---|
| **نص الفقرات (Body Text)** | `13.21:1` | 4.5:1 | ✅ PASS |
| **العناوين الرئيسية (H1 / Headings)** | `13.21:1` | 3.0:1 | ✅ PASS |
| **الأزرار (Buttons)** | `18.88:1` | 4.5:1 | ✅ PASS |

## 5. مساحات اللمس على الموبايل (Touch Targets >= 44x44px)

| العنصر | الأبعاد المقاسة (عرض × ارتفاع) | المساحة (Area) | المطابقة (>= 44px) |
|---|---|---|---|
| **A** (`تخطى إلى المحتوى`) | `1px` × `1px` | `1px²` | ⚠️ < 44px |
| **A** (`التشكيلة ↗`) | `40.8px` × `17.1px` | `696.8px²` | ⚠️ < 44px |
| **A** (`مدار
MEN + KIDS / CAIRO`) | `295.4px` × `33px` | `9749.4px²` | ⚠️ < 44px |
| **BUTTON** (`☰`) | `33.6px` × `34px` | `1141.1px²` | ⚠️ < 44px |
| **BUTTON** (`البحث`) | `21px` × `21px` | `441px²` | ⚠️ < 44px |
| **BUTTON** (`مصر / عربي ⌄`) | `55.7px` × `19px` | `1059px²` | ⚠️ < 44px |
| **A** (`0`) | `34.3px` × `21px` | `720.2px²` | ⚠️ < 44px |
| **A** (`الحساب`) | `21px` × `21px` | `441px²` | ⚠️ < 44px |
| **A** (`0`) | `34.3px` × `21px` | `720.2px²` | ⚠️ < 44px |
| **A** (`اكتشف التشكيلة
←`) | `159.1px` × `51px` | `8113.8px²` | ✅ PASS |
