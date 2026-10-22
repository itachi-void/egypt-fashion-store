# حصر مساحات اللمس على الموبايل (Touch Targets < 44px) — التقرير الكامل بدون اقتطاع

> **التأطير المعياري وإطار العمل:**
> - هدف المشروع والمطمح التصميمي هو تحقيق معيار **WCAG 2.1 Success Criterion 2.5.5 (Target Size - Level AAA)** بمساحة نقر لا تقل عن **44×44px**.
> - يتضمن معيار WCAG 2.1 AAA استثناءات صريحة، بحيث **لا يُعد وجود عنصر أقل من 44px فشلاً تلقائياً** في الحالات التالية:
>   1. **العناصر المضمنة (Inline Targets):** الروابط الواقعة داخل فقرات نصية أو جمل مستمرة (مثل روابط سياسة الخصوصية والشروط داخل النصوص).
>   2. **تحكم المتصفح وعناصر الإدخال الأصلية (User Agent Control):** مربعات الاختيار (checkboxes) وأزرار الراديو التي يحدد المتصفح شكلها، خاصة عند اقترانها بعنصر `<label>` كبير وواضح يوسع مساحة النقر فعلياً لتشمل كامل النص المجاور.
>   3. **الضرورة التصميمية (Essential):** عندما يكون العرض بهذا الحجم ضرورياً للغاية لنقل المعلومة دون تشويه بصري.
>   4. **التباعد الكافي (Sufficient Spacing):** عندما يحيط بالعنصر فراغ كافٍ يمنع النقر الخاطئ على عناصر أخرى مجاورة.

| # | محدد العنصر (CSS Selector) | النوع / الوسم | النص الظاهر / المسمى التوضيحي | الأبعاد الفعلية المقاسة (عرض × ارتفاع) | الصفحة | تصنيف استثناء WCAG 2.1 / الملاحظة |
|---|---|---|---|---|---|---|
| 1 | `#wp-skip-link` | `A` | تخطى إلى المحتوى | **1px × 1px** | `home` | عنصر قارئ الشاشة (مخفي بصرياً) |
| 2 | `header.wp-block-template-part > div.quiet-top:nth-of-type(1) > a` | `A` | التشكيلة ↗ | **40.8px × 17.1px** | `home` | هدف تحسين بيئة لمسية |
| 3 | `header.wp-block-template-part > header.quiet-header.store-header > a.quiet-brand` | `A` | مدار
MEN + KIDS / CAIRO | **295.4px × 33px** | `home` | هدف تحسين بيئة لمسية |
| 4 | `header.wp-block-template-part > header.quiet-header.store-header > button.store-menu-toggle.mdr-menu-toggle` | `BUTTON:button` | ☰ | **33.6px × 34px** | `home` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 5 | `header.quiet-header.store-header > div.quiet-header-tools > button.experience-search-trigger:nth-of-type(1)` | `BUTTON:button` | البحث | **21px × 21px** | `home` | هدف تحسين بيئة لمسية |
| 6 | `header.quiet-header.store-header > div.quiet-header-tools > button:nth-of-type(2)` | `BUTTON:button` | مصر / عربي ⌄ | **55.7px × 19px** | `home` | هدف تحسين بيئة لمسية |
| 7 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(1)` | `A` | 0 | **34.3px × 21px** | `home` | هدف تحسين بيئة لمسية |
| 8 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(2)` | `A` | الحساب | **21px × 21px** | `home` | هدف تحسين بيئة لمسية |
| 9 | `header.quiet-header.store-header > div.quiet-header-tools > a.store-cart-link:nth-of-type(3)` | `A` | 0 | **34.3px × 21px** | `home` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 10 | `#mdr-main > nav.motion-guide > a:nth-of-type(1)` | `A` | مشهد التمرير ↓ | **70.5px × 37.9px** | `home` | هدف تحسين بيئة لمسية |
| 11 | `#mdr-main > nav.motion-guide > a:nth-of-type(2)` | `A` | الصور المرنة ↓ | **64.5px × 37.9px** | `home` | هدف تحسين بيئة لمسية |
| 12 | `#mdr-main > nav.motion-guide > a:nth-of-type(3)` | `A` | أثر المؤشر ↓ | **53.7px × 37.9px** | `home` | هدف تحسين بيئة لمسية |
| 13 | `#mdr-main > nav.motion-guide > a:nth-of-type(4)` | `A` | انتقال المنتج والسلة ↗ | **104.2px × 37.9px** | `home` | هدف تحسين بيئة لمسية |
| 14 | `section.store-section.mdr-picks:nth-of-type(3) > div.store-heading:nth-of-type(1) > a.quiet-line-button` | `A` | كل القطع ↗ | **58.5px × 35.9px** | `home` | هدف تحسين بيئة لمسية |
| 15 | `article.store-product-card.mdr-reveal:nth-of-type(1) > div.store-card-image:nth-of-type(1) > button.store-card-fav:nth-of-type(1)` | `BUTTON:button` | ♡ | **36px × 36px** | `home` | هدف تحسين بيئة لمسية |
| 16 | `article.store-product-card.mdr-reveal:nth-of-type(2) > div.store-card-image:nth-of-type(1) > button.store-card-fav:nth-of-type(1)` | `BUTTON:button` | ♡ | **36px × 36px** | `home` | هدف تحسين بيئة لمسية |
| 17 | `article.store-product-card.mdr-reveal:nth-of-type(2) > div.store-card-meta:nth-of-type(2) > a` | `A` | بدلة إيقاع المدينة الكحلية | **134.6px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 18 | `article.store-product-card.mdr-reveal:nth-of-type(3) > div.store-card-image:nth-of-type(1) > button.store-card-fav:nth-of-type(1)` | `BUTTON:button` | ♡ | **36px × 36px** | `home` | هدف تحسين بيئة لمسية |
| 19 | `article.store-product-card.mdr-reveal:nth-of-type(3) > div.store-card-meta:nth-of-type(2) > a` | `A` | كنزة الكشمير بالياقة العالية | **143.8px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 20 | `article.store-product-card.mdr-reveal:nth-of-type(4) > div.store-card-image:nth-of-type(1) > button.store-card-fav:nth-of-type(1)` | `BUTTON:button` | ♡ | **36px × 36px** | `home` | هدف تحسين بيئة لمسية |
| 21 | `#mdr-main > section.store-manifesto:nth-of-type(4) > a.quiet-line-button` | `A` | اقرأ حكايتنا ↗ | **59.6px × 35.9px** | `home` | هدف تحسين بيئة لمسية |
| 22 | `div.motion-scroll-stage > div.motion-scene-copy:nth-of-type(1) > a.motion-scene-link` | `A` | اكتشف القطع ↗ | **83.4px × 35.8px** | `home` | هدف تحسين بيئة لمسية |
| 23 | `#motion-trail > a.quiet-line-button` | `A` | كل اختيارات مدار ↗ | **86.4px × 35.9px** | `home` | هدف تحسين بيئة لمسية |
| 24 | `section.experience-categories:nth-of-type(8) > div.experience-section-heading:nth-of-type(1) > a` | `A` | خلّينا نختار معاك ↗ | **84.7px × 29.9px** | `home` | هدف تحسين بيئة لمسية |
| 25 | `section.experience-journal-home:nth-of-type(10) > div.experience-section-heading:nth-of-type(1) > a` | `A` | كل الحكايات ↗ | **63.9px × 29.9px** | `home` | هدف تحسين بيئة لمسية |
| 26 | `label:nth-of-type(1) > div > input` | `INPUT:email` | البريد الإلكتروني
← | **177px × 34px** | `home` | هدف تحسين بيئة لمسية |
| 27 | `label:nth-of-type(1) > div > button` | `BUTTON:submit` | ← | **53px × 34px** | `home` | هدف تحسين بيئة لمسية |
| 28 | `form > label.experience-consent:nth-of-type(2) > input` | `INPUT:checkbox` | on | **13px × 13px** | `home` | مقرون بـ Label: "أوافق على استلام تحديثات ورسائل مدار الحصرية." |
| 29 | `span > small > a` | `A` | كلّمنا على واتساب | **82.8px × 14px** | `home` | استثناء Inline Link داخل نص |
| 30 | `footer.store-footer > div:nth-of-type(1) > a.quiet-brand` | `A` | مدار | **59.9px × 38px** | `home` | هدف تحسين بيئة لمسية |
| 31 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(1)` | `A` | الرجال | **28.6px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 32 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(2)` | `A` | الأطفال | **40.4px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 33 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(3)` | `A` | المفضلة | **45.9px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 34 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(1)` | `A` | المقاسات والشحن والأسئلة | **137.7px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 35 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(2)` | `A` | تواصل معنا | **61.3px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 36 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(3)` | `A` | دليل المقاسات | **75.4px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 37 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(4)` | `A` | الخصوصية والسياسات | **112.5px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 38 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(1)` | `A` | الحساب والطلبات | **85.7px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 39 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(2)` | `A` | سلة المشتريات | **74.8px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 40 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(3)` | `A` | عن مدار | **41px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 41 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(4)` | `A` | دفتر مدار | **47px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 42 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(5)` | `A` | اكتشف أسلوبك | **76.9px × 22.8px** | `home` | هدف تحسين بيئة لمسية |
| 43 | `#wp-skip-link` | `A` | تخطى إلى المحتوى | **1px × 1px** | `shop` | عنصر قارئ الشاشة (مخفي بصرياً) |
| 44 | `header.wp-block-template-part > div.quiet-top:nth-of-type(1) > a` | `A` | التشكيلة ↗ | **40.8px × 17.1px** | `shop` | هدف تحسين بيئة لمسية |
| 45 | `header.wp-block-template-part > header.quiet-header.store-header > a.quiet-brand` | `A` | مدار
MEN + KIDS / CAIRO | **295.4px × 33px** | `shop` | هدف تحسين بيئة لمسية |
| 46 | `header.wp-block-template-part > header.quiet-header.store-header > button.store-menu-toggle.mdr-menu-toggle` | `BUTTON:button` | ☰ | **33.6px × 34px** | `shop` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 47 | `header.quiet-header.store-header > div.quiet-header-tools > button.experience-search-trigger:nth-of-type(1)` | `BUTTON:button` | البحث | **21px × 21px** | `shop` | هدف تحسين بيئة لمسية |
| 48 | `header.quiet-header.store-header > div.quiet-header-tools > button:nth-of-type(2)` | `BUTTON:button` | مصر / عربي ⌄ | **55.7px × 19px** | `shop` | هدف تحسين بيئة لمسية |
| 49 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(1)` | `A` | 0 | **34.3px × 21px** | `shop` | هدف تحسين بيئة لمسية |
| 50 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(2)` | `A` | الحساب | **21px × 21px** | `shop` | هدف تحسين بيئة لمسية |
| 51 | `header.quiet-header.store-header > div.quiet-header-tools > a.store-cart-link:nth-of-type(3)` | `A` | 0 | **34.3px × 21px** | `shop` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 52 | `div.woocommerce.wc-block-breadcrumbs:nth-of-type(1) > nav.woocommerce-breadcrumb > a` | `A` | الرئيسية | **36.1px × 14px** | `shop` | استثناء Inline Link داخل نص |
| 53 | `div.mdr-toolbar:nth-of-type(4) > nav.mdr-chips > a:nth-of-type(1)` | `A` | الكل | **53.8px × 40.9px** | `shop` | هدف تحسين بيئة لمسية |
| 54 | `div.mdr-toolbar:nth-of-type(4) > nav.mdr-chips > a:nth-of-type(2)` | `A` | إكسسوارات | **85.7px × 40.9px** | `shop` | هدف تحسين بيئة لمسية |
| 55 | `div.mdr-toolbar:nth-of-type(4) > nav.mdr-chips > a:nth-of-type(3)` | `A` | ملابس | **66.7px × 40.9px** | `shop` | هدف تحسين بيئة لمسية |
| 56 | `div.mdr-toolbar:nth-of-type(4) > nav.mdr-chips > a:nth-of-type(4)` | `A` | أطفال | **63.7px × 40.9px** | `shop` | هدف تحسين بيئة لمسية |
| 57 | `div.mdr-toolbar:nth-of-type(4) > nav.mdr-chips > a:nth-of-type(5)` | `A` | رجالي | **58.5px × 40.9px** | `shop` | هدف تحسين بيئة لمسية |
| 58 | `div.mdr-toolbar:nth-of-type(4) > div.mdr-toolbar__actions:nth-of-type(2) > button.mdr-tool` | `BUTTON:button` | الفلاتر والترتيب | **113px × 34px** | `shop` | هدف تحسين بيئة لمسية |
| 59 | `div.mdr-toolbar__actions:nth-of-type(2) > div.mdr-density > button.mdr-tool:nth-of-type(1)` | `BUTTON:button` | صور أكبر | **34px × 34px** | `shop` | هدف تحسين بيئة لمسية |
| 60 | `div.mdr-toolbar__actions:nth-of-type(2) > div.mdr-density > button.mdr-tool:nth-of-type(2)` | `BUTTON:button` | منتجات أكثر | **34px × 34px** | `shop` | هدف تحسين بيئة لمسية |
| 61 | `li.wc-block-product.post-128:nth-of-type(1) > h2.has-text-align-center.wp-block-post-title > a` | `A` | أوفرشيرت قطن مبروم | **126.3px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 62 | `li.wc-block-product.post-128:nth-of-type(1) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 63 | `li.wc-block-product.post-86:nth-of-type(2) > h2.has-text-align-center.wp-block-post-title > a` | `A` | بلوفر تريكو بدرجات ترابي | **135.3px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 64 | `li.wc-block-product.post-86:nth-of-type(2) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 65 | `li.wc-block-product.post-42:nth-of-type(3) > h2.has-text-align-center.wp-block-post-title > a` | `A` | بنطال جينز كاجوال – تجريبي | **154px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 66 | `li.wc-block-product.post-42:nth-of-type(3) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > button.wp-block-button__link.wp-element-button` | `BUTTON:button` | إضافة إلى السلة | **79.5px × 22.4px** | `shop` | هدف تحسين بيئة لمسية |
| 67 | `li.wc-block-product.post-123:nth-of-type(4) > h2.has-text-align-center.wp-block-post-title > a` | `A` | بولو أطفال مقلّم | **98.6px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 68 | `li.wc-block-product.post-123:nth-of-type(4) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 69 | `li.wc-block-product.post-105:nth-of-type(5) > h2.has-text-align-center.wp-block-post-title > a` | `A` | تيشيرت أطفال مقلّم فاتح | **145.5px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 70 | `li.wc-block-product.post-105:nth-of-type(5) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 71 | `li.wc-block-product.post-24:nth-of-type(6) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 72 | `li.wc-block-product.post-43:nth-of-type(7) > h2.has-text-align-center.wp-block-post-title > a` | `A` | سترة هودي شتوية – تجريبي | **158.8px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 73 | `li.wc-block-product.post-43:nth-of-type(7) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > button.wp-block-button__link.wp-element-button` | `BUTTON:button` | إضافة إلى السلة | **79.5px × 22.4px** | `shop` | هدف تحسين بيئة لمسية |
| 74 | `li.wc-block-product.post-33:nth-of-type(8) > h2.has-text-align-center.wp-block-post-title > a` | `A` | سوار معصم جلدي – تجريبي | **158.6px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 75 | `li.wc-block-product.post-33:nth-of-type(8) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 76 | `li.wc-block-product.post-111:nth-of-type(9) > h2.has-text-align-center.wp-block-post-title > a` | `A` | سويتشيرت أطفال بخطوط | **146.7px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 77 | `li.wc-block-product.post-111:nth-of-type(9) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 78 | `li.wc-block-product.post-98:nth-of-type(10) > h2.has-text-align-center.wp-block-post-title > a` | `A` | طقم بدلة سادة | **90.2px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 79 | `li.wc-block-product.post-98:nth-of-type(10) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 80 | `li.wc-block-product.post-134:nth-of-type(11) > h2.has-text-align-center.wp-block-post-title > a` | `A` | قميص أطفال بني | **106.4px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 81 | `li.wc-block-product.post-134:nth-of-type(11) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 82 | `li.wc-block-product.post-118:nth-of-type(12) > h2.has-text-align-center.wp-block-post-title > a` | `A` | قميص مقلّم بقصّة واسعة | **158.4px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 83 | `li.wc-block-product.post-118:nth-of-type(12) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 84 | `li.wc-block-product.post-45:nth-of-type(13) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > button.wp-block-button__link.wp-element-button` | `BUTTON:button` | إضافة إلى السلة | **79.5px × 22.4px** | `shop` | هدف تحسين بيئة لمسية |
| 85 | `li.wc-block-product.post-141:nth-of-type(14) > h2.has-text-align-center.wp-block-post-title > a` | `A` | معطف صوف بلون الجمل | **151.8px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 86 | `li.wc-block-product.post-141:nth-of-type(14) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 87 | `li.wc-block-product.post-93:nth-of-type(15) > h2.has-text-align-center.wp-block-post-title > a` | `A` | معطف طويل أسود | **115.2px × 22.1px** | `shop` | استثناء Inline Link داخل نص |
| 88 | `li.wc-block-product.post-93:nth-of-type(15) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `shop` | استثناء Inline Link داخل نص |
| 89 | `li.wc-block-product.post-44:nth-of-type(16) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > button.wp-block-button__link.wp-element-button` | `BUTTON:button` | إضافة إلى السلة | **79.5px × 22.4px** | `shop` | هدف تحسين بيئة لمسية |
| 90 | `footer.store-footer > div:nth-of-type(1) > a.quiet-brand` | `A` | مدار | **59.9px × 38px** | `shop` | هدف تحسين بيئة لمسية |
| 91 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(1)` | `A` | الرجال | **28.6px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 92 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(2)` | `A` | الأطفال | **40.4px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 93 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(3)` | `A` | المفضلة | **45.9px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 94 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(1)` | `A` | المقاسات والشحن والأسئلة | **137.7px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 95 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(2)` | `A` | تواصل معنا | **61.3px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 96 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(3)` | `A` | دليل المقاسات | **75.4px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 97 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(4)` | `A` | الخصوصية والسياسات | **112.5px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 98 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(1)` | `A` | الحساب والطلبات | **85.7px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 99 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(2)` | `A` | سلة المشتريات | **74.8px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 100 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(3)` | `A` | عن مدار | **41px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 101 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(4)` | `A` | دفتر مدار | **47px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 102 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(5)` | `A` | اكتشف أسلوبك | **76.9px × 22.8px** | `shop` | هدف تحسين بيئة لمسية |
| 103 | `a.mdr-wa:nth-of-type(2)` | `A` | تواصل معنا على واتساب | **42px × 42px** | `shop` | هدف تحسين بيئة لمسية |
| 104 | `#wp-skip-link` | `A` | تخطى إلى المحتوى | **1px × 1px** | `product_simple` | عنصر قارئ الشاشة (مخفي بصرياً) |
| 105 | `header.wp-block-template-part > div.quiet-top:nth-of-type(1) > a` | `A` | التشكيلة ↗ | **40.8px × 17.1px** | `product_simple` | هدف تحسين بيئة لمسية |
| 106 | `header.wp-block-template-part > header.quiet-header.store-header > a.quiet-brand` | `A` | مدار
MEN + KIDS / CAIRO | **295.4px × 33px** | `product_simple` | هدف تحسين بيئة لمسية |
| 107 | `header.wp-block-template-part > header.quiet-header.store-header > button.store-menu-toggle.mdr-menu-toggle` | `BUTTON:button` | ☰ | **33.6px × 34px** | `product_simple` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 108 | `header.quiet-header.store-header > div.quiet-header-tools > button.experience-search-trigger:nth-of-type(1)` | `BUTTON:button` | البحث | **21px × 21px** | `product_simple` | هدف تحسين بيئة لمسية |
| 109 | `header.quiet-header.store-header > div.quiet-header-tools > button:nth-of-type(2)` | `BUTTON:button` | مصر / عربي ⌄ | **55.7px × 19px** | `product_simple` | هدف تحسين بيئة لمسية |
| 110 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(1)` | `A` | 0 | **34.3px × 21px** | `product_simple` | هدف تحسين بيئة لمسية |
| 111 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(2)` | `A` | الحساب | **21px × 21px** | `product_simple` | هدف تحسين بيئة لمسية |
| 112 | `header.quiet-header.store-header > div.quiet-header-tools > a.store-cart-link:nth-of-type(3)` | `A` | 0 | **34.3px × 21px** | `product_simple` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 113 | `div.woocommerce.wc-block-breadcrumbs:nth-of-type(1) > nav.woocommerce-breadcrumb > a:nth-of-type(1)` | `A` | الرئيسية | **36.1px × 14px** | `product_simple` | استثناء Inline Link داخل نص |
| 114 | `div.woocommerce.wc-block-breadcrumbs:nth-of-type(1) > nav.woocommerce-breadcrumb > a:nth-of-type(2)` | `A` | إكسسوارات | **51.7px × 14px** | `product_simple` | استثناء Inline Link داخل نص |
| 115 | `div.wp-block-woocommerce-product-image-gallery > div.woocommerce-product-gallery.woocommerce-product-gallery--with-images > a.woocommerce-product-gallery__trigger` | `A` | عرض معرض الصورة بشاشة كاملة | **40px × 40px** | `product_simple` | هدف تحسين بيئة لمسية |
| 116 | `span > small > a` | `A` | كلّمنا على واتساب | **82.8px × 14px** | `product_simple` | استثناء Inline Link داخل نص |
| 117 | `div.wp-block-column.is-layout-flow:nth-of-type(2) > div.mdr-extras:nth-of-type(4) > button.mdr-size-link` | `BUTTON:button` | دليل المقاسات | **105.8px × 17px** | `product_simple` | هدف تحسين بيئة لمسية |
| 118 | `div.wp-block-group.is-nowrap > div.taxonomy-product_cat.wp-block-post-terms:nth-of-type(2) > a` | `A` | إكسسوارات | **51.7px × 14px** | `product_simple` | استثناء Inline Link داخل نص |
| 119 | `#tab-title-description > a` | `A` | الوصف | **41.8px × 44px** | `product_simple` | استثناء Inline Link داخل نص |
| 120 | `li.wc-block-product.post-33:nth-of-type(1) > h3.has-text-align-center.wp-block-post-title > a` | `A` | سوار معصم جلدي – تجريبي | **158.6px × 22.1px** | `product_simple` | استثناء Inline Link داخل نص |
| 121 | `li.wc-block-product.post-33:nth-of-type(1) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > a.wp-block-button__link.wp-element-button` | `A` | تحديد أحد الخيارات | **86.6px × 22.4px** | `product_simple` | استثناء Inline Link داخل نص |
| 122 | `li.wc-block-product.post-45:nth-of-type(2) > div.wp-block-button.wc-block-components-product-button:nth-of-type(3) > button.wp-block-button__link.wp-element-button` | `BUTTON:button` | إضافة إلى السلة | **79.5px × 22.4px** | `product_simple` | هدف تحسين بيئة لمسية |
| 123 | `footer.store-footer > div:nth-of-type(1) > a.quiet-brand` | `A` | مدار | **59.9px × 38px** | `product_simple` | هدف تحسين بيئة لمسية |
| 124 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(1)` | `A` | الرجال | **28.6px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 125 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(2)` | `A` | الأطفال | **40.4px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 126 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(3)` | `A` | المفضلة | **45.9px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 127 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(1)` | `A` | المقاسات والشحن والأسئلة | **137.7px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 128 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(2)` | `A` | تواصل معنا | **61.3px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 129 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(3)` | `A` | دليل المقاسات | **75.4px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 130 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(4)` | `A` | الخصوصية والسياسات | **112.5px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 131 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(1)` | `A` | الحساب والطلبات | **85.7px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 132 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(2)` | `A` | سلة المشتريات | **74.8px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 133 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(3)` | `A` | عن مدار | **41px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 134 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(4)` | `A` | دفتر مدار | **47px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 135 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(5)` | `A` | اكتشف أسلوبك | **76.9px × 22.8px** | `product_simple` | هدف تحسين بيئة لمسية |
| 136 | `a.mdr-wa:nth-of-type(2)` | `A` | تواصل معنا على واتساب | **42px × 42px** | `product_simple` | هدف تحسين بيئة لمسية |
| 137 | `#wp-skip-link` | `A` | تخطى إلى المحتوى | **1px × 1px** | `cart` | عنصر قارئ الشاشة (مخفي بصرياً) |
| 138 | `header.wp-block-template-part > div.quiet-top:nth-of-type(1) > a` | `A` | التشكيلة ↗ | **40.8px × 17.1px** | `cart` | هدف تحسين بيئة لمسية |
| 139 | `header.wp-block-template-part > header.quiet-header.store-header > a.quiet-brand` | `A` | مدار
MEN + KIDS / CAIRO | **295.4px × 33px** | `cart` | هدف تحسين بيئة لمسية |
| 140 | `header.wp-block-template-part > header.quiet-header.store-header > button.store-menu-toggle.mdr-menu-toggle` | `BUTTON:button` | ☰ | **33.6px × 34px** | `cart` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 141 | `header.quiet-header.store-header > div.quiet-header-tools > button.experience-search-trigger:nth-of-type(1)` | `BUTTON:button` | البحث | **21px × 21px** | `cart` | هدف تحسين بيئة لمسية |
| 142 | `header.quiet-header.store-header > div.quiet-header-tools > button:nth-of-type(2)` | `BUTTON:button` | مصر / عربي ⌄ | **55.7px × 19px** | `cart` | هدف تحسين بيئة لمسية |
| 143 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(1)` | `A` | 0 | **34.3px × 21px** | `cart` | هدف تحسين بيئة لمسية |
| 144 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(2)` | `A` | الحساب | **21px × 21px** | `cart` | هدف تحسين بيئة لمسية |
| 145 | `header.quiet-header.store-header > div.quiet-header-tools > a.store-cart-link:nth-of-type(3)` | `A` | 0 | **34.3px × 21px** | `cart` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 146 | `div.woocommerce > p.return-to-shop > a.button.wc-backward` | `A` | العودة إلى المتجر | **147.1px × 17px** | `cart` | استثناء Inline Link داخل نص |
| 147 | `footer.store-footer > div:nth-of-type(1) > a.quiet-brand` | `A` | مدار | **59.9px × 38px** | `cart` | هدف تحسين بيئة لمسية |
| 148 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(1)` | `A` | الرجال | **28.6px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 149 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(2)` | `A` | الأطفال | **40.4px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 150 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(3)` | `A` | المفضلة | **45.9px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 151 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(1)` | `A` | المقاسات والشحن والأسئلة | **137.7px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 152 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(2)` | `A` | تواصل معنا | **61.3px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 153 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(3)` | `A` | دليل المقاسات | **75.4px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 154 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(4)` | `A` | الخصوصية والسياسات | **112.5px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 155 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(1)` | `A` | الحساب والطلبات | **85.7px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 156 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(2)` | `A` | سلة المشتريات | **74.8px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 157 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(3)` | `A` | عن مدار | **41px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 158 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(4)` | `A` | دفتر مدار | **47px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 159 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(5)` | `A` | اكتشف أسلوبك | **76.9px × 22.8px** | `cart` | هدف تحسين بيئة لمسية |
| 160 | `a.mdr-wa:nth-of-type(2)` | `A` | تواصل معنا على واتساب | **42px × 42px** | `cart` | هدف تحسين بيئة لمسية |
| 161 | `#wp-skip-link` | `A` | تخطى إلى المحتوى | **1px × 1px** | `checkout` | عنصر قارئ الشاشة (مخفي بصرياً) |
| 162 | `header.wp-block-template-part > div.quiet-top:nth-of-type(1) > a` | `A` | التشكيلة ↗ | **40.8px × 17.1px** | `checkout` | هدف تحسين بيئة لمسية |
| 163 | `header.wp-block-template-part > header.quiet-header.store-header > a.quiet-brand` | `A` | مدار
MEN + KIDS / CAIRO | **295.4px × 33px** | `checkout` | هدف تحسين بيئة لمسية |
| 164 | `header.wp-block-template-part > header.quiet-header.store-header > button.store-menu-toggle.mdr-menu-toggle` | `BUTTON:button` | ☰ | **33.6px × 34px** | `checkout` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 165 | `header.quiet-header.store-header > div.quiet-header-tools > button.experience-search-trigger:nth-of-type(1)` | `BUTTON:button` | البحث | **21px × 21px** | `checkout` | هدف تحسين بيئة لمسية |
| 166 | `header.quiet-header.store-header > div.quiet-header-tools > button:nth-of-type(2)` | `BUTTON:button` | مصر / عربي ⌄ | **55.7px × 19px** | `checkout` | هدف تحسين بيئة لمسية |
| 167 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(1)` | `A` | 0 | **34.3px × 21px** | `checkout` | هدف تحسين بيئة لمسية |
| 168 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(2)` | `A` | الحساب | **21px × 21px** | `checkout` | هدف تحسين بيئة لمسية |
| 169 | `header.quiet-header.store-header > div.quiet-header-tools > a.store-cart-link:nth-of-type(3)` | `A` | 0 | **34.3px × 21px** | `checkout` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 170 | `div.woocommerce > p.return-to-shop > a.button.wc-backward` | `A` | العودة إلى المتجر | **147.1px × 17px** | `checkout` | استثناء Inline Link داخل نص |
| 171 | `footer.store-footer > div:nth-of-type(1) > a.quiet-brand` | `A` | مدار | **59.9px × 38px** | `checkout` | هدف تحسين بيئة لمسية |
| 172 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(1)` | `A` | الرجال | **28.6px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 173 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(2)` | `A` | الأطفال | **40.4px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 174 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(3)` | `A` | المفضلة | **45.9px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 175 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(1)` | `A` | المقاسات والشحن والأسئلة | **137.7px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 176 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(2)` | `A` | تواصل معنا | **61.3px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 177 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(3)` | `A` | دليل المقاسات | **75.4px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 178 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(4)` | `A` | الخصوصية والسياسات | **112.5px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 179 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(1)` | `A` | الحساب والطلبات | **85.7px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 180 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(2)` | `A` | سلة المشتريات | **74.8px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 181 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(3)` | `A` | عن مدار | **41px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 182 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(4)` | `A` | دفتر مدار | **47px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 183 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(5)` | `A` | اكتشف أسلوبك | **76.9px × 22.8px** | `checkout` | هدف تحسين بيئة لمسية |
| 184 | `a.mdr-wa:nth-of-type(2)` | `A` | تواصل معنا على واتساب | **42px × 42px** | `checkout` | هدف تحسين بيئة لمسية |
| 185 | `#wp-skip-link` | `A` | تخطى إلى المحتوى | **1px × 1px** | `my_account_logged_out` | عنصر قارئ الشاشة (مخفي بصرياً) |
| 186 | `header.wp-block-template-part > div.quiet-top:nth-of-type(1) > a` | `A` | التشكيلة ↗ | **40.8px × 17.1px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 187 | `header.wp-block-template-part > header.quiet-header.store-header > a.quiet-brand` | `A` | مدار
MEN + KIDS / CAIRO | **295.4px × 33px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 188 | `header.wp-block-template-part > header.quiet-header.store-header > button.store-menu-toggle.mdr-menu-toggle` | `BUTTON:button` | ☰ | **33.6px × 34px** | `my_account_logged_out` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 189 | `header.quiet-header.store-header > div.quiet-header-tools > button.experience-search-trigger:nth-of-type(1)` | `BUTTON:button` | البحث | **21px × 21px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 190 | `header.quiet-header.store-header > div.quiet-header-tools > button:nth-of-type(2)` | `BUTTON:button` | مصر / عربي ⌄ | **55.7px × 19px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 191 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(1)` | `A` | 0 | **34.3px × 21px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 192 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(2)` | `A` | الحساب | **21px × 21px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 193 | `header.quiet-header.store-header > div.quiet-header-tools > a.store-cart-link:nth-of-type(3)` | `A` | 0 | **34.3px × 21px** | `my_account_logged_out` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 194 | `p.woocommerce-form-row.woocommerce-form-row--wide:nth-of-type(2) > span.password-input > button.show-password-input` | `BUTTON:button` | عرض كلمة المرور | **22px × 22px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 195 | `#rememberme` | `INPUT:checkbox` | forever | **13px × 13px** | `my_account_logged_out` | مقرون بـ Label: "تذكرني" |
| 196 | `form.woocommerce-form.woocommerce-form-login > p.woocommerce-LostPassword.lost_password:nth-of-type(4) > a` | `A` | نسيت كلمة مرورك؟ | **149.5px × 23px** | `my_account_logged_out` | استثناء Inline Link داخل نص |
| 197 | `div.woocommerce-privacy-policy-text > p > a.woocommerce-privacy-policy-link` | `A` | سياسة الخصوصية | **140.6px × 23px** | `my_account_logged_out` | استثناء Inline Link داخل نص |
| 198 | `footer.store-footer > div:nth-of-type(1) > a.quiet-brand` | `A` | مدار | **59.9px × 38px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 199 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(1)` | `A` | الرجال | **28.6px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 200 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(2)` | `A` | الأطفال | **40.4px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 201 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(3)` | `A` | المفضلة | **45.9px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 202 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(1)` | `A` | المقاسات والشحن والأسئلة | **137.7px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 203 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(2)` | `A` | تواصل معنا | **61.3px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 204 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(3)` | `A` | دليل المقاسات | **75.4px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 205 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(4)` | `A` | الخصوصية والسياسات | **112.5px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 206 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(1)` | `A` | الحساب والطلبات | **85.7px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 207 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(2)` | `A` | سلة المشتريات | **74.8px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 208 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(3)` | `A` | عن مدار | **41px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 209 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(4)` | `A` | دفتر مدار | **47px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 210 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(5)` | `A` | اكتشف أسلوبك | **76.9px × 22.8px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 211 | `a.mdr-wa:nth-of-type(2)` | `A` | تواصل معنا على واتساب | **42px × 42px** | `my_account_logged_out` | هدف تحسين بيئة لمسية |
| 212 | `#wp-skip-link` | `A` | تخطى إلى المحتوى | **1px × 1px** | `lost_password` | عنصر قارئ الشاشة (مخفي بصرياً) |
| 213 | `header.wp-block-template-part > div.quiet-top:nth-of-type(1) > a` | `A` | التشكيلة ↗ | **40.8px × 17.1px** | `lost_password` | هدف تحسين بيئة لمسية |
| 214 | `header.wp-block-template-part > header.quiet-header.store-header > a.quiet-brand` | `A` | مدار
MEN + KIDS / CAIRO | **295.4px × 33px** | `lost_password` | هدف تحسين بيئة لمسية |
| 215 | `header.wp-block-template-part > header.quiet-header.store-header > button.store-menu-toggle.mdr-menu-toggle` | `BUTTON:button` | ☰ | **33.6px × 34px** | `lost_password` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 216 | `header.quiet-header.store-header > div.quiet-header-tools > button.experience-search-trigger:nth-of-type(1)` | `BUTTON:button` | البحث | **21px × 21px** | `lost_password` | هدف تحسين بيئة لمسية |
| 217 | `header.quiet-header.store-header > div.quiet-header-tools > button:nth-of-type(2)` | `BUTTON:button` | مصر / عربي ⌄ | **55.7px × 19px** | `lost_password` | هدف تحسين بيئة لمسية |
| 218 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(1)` | `A` | 0 | **34.3px × 21px** | `lost_password` | هدف تحسين بيئة لمسية |
| 219 | `header.quiet-header.store-header > div.quiet-header-tools > a:nth-of-type(2)` | `A` | الحساب | **21px × 21px** | `lost_password` | هدف تحسين بيئة لمسية |
| 220 | `header.quiet-header.store-header > div.quiet-header-tools > a.store-cart-link:nth-of-type(3)` | `A` | 0 | **34.3px × 21px** | `lost_password` | أيقونة ترويسة تفاعلية (أولوية ترقية المساحة الشفافة) |
| 221 | `footer.store-footer > div:nth-of-type(1) > a.quiet-brand` | `A` | مدار | **59.9px × 38px** | `lost_password` | هدف تحسين بيئة لمسية |
| 222 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(1)` | `A` | الرجال | **28.6px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 223 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(2)` | `A` | الأطفال | **40.4px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 224 | `footer.store-footer > div:nth-of-type(2) > a:nth-of-type(3)` | `A` | المفضلة | **45.9px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 225 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(1)` | `A` | المقاسات والشحن والأسئلة | **137.7px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 226 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(2)` | `A` | تواصل معنا | **61.3px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 227 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(3)` | `A` | دليل المقاسات | **75.4px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 228 | `footer.store-footer > div:nth-of-type(3) > a:nth-of-type(4)` | `A` | الخصوصية والسياسات | **112.5px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 229 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(1)` | `A` | الحساب والطلبات | **85.7px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 230 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(2)` | `A` | سلة المشتريات | **74.8px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 231 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(3)` | `A` | عن مدار | **41px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 232 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(4)` | `A` | دفتر مدار | **47px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 233 | `footer.store-footer > div:nth-of-type(4) > a:nth-of-type(5)` | `A` | اكتشف أسلوبك | **76.9px × 22.8px** | `lost_password` | هدف تحسين بيئة لمسية |
| 234 | `a.mdr-wa:nth-of-type(2)` | `A` | تواصل معنا على واتساب | **42px × 42px** | `lost_password` | هدف تحسين بيئة لمسية |

**إجمالي العناصر المرصودة:** **234 عنصراً تفاعلياً** عبر جميع الصفحات المختبرة دون أي اقتطاع.
