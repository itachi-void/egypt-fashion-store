TASK_ID: MADAR-AG-003A
REPOSITORY: itachi-void/egypt-fashion-store
PHASE: INSPECT_ONLY / HOME_VISUAL_ANOMALY_DIAGNOSIS / PROTOCOL_VERSION: 2

الهدف: تشخيص ثلاث ملاحظات في الرئيسية على capability-test copy (FYikxAbbt) فقط. قراءة وقياس.
لا إصلاح ولا تعديل لأي ملف أو خيار أو قالب أو cache، ولا Git غير الخطوة 0.

الملاحظات:
A. موبايل 375: عنوان الحملة ضيق جدًا (أسطر قصيرة).
B. موبايل 375: بداية الصفحة/الهيدر تبدو مكررة أسفل الحملة في اللقطة الكاملة.
C. كمبيوتر 1440: بعض صور الحملة وقسم «دفتر مدار» غير ظاهرة.
فرضيات للاختبار لا للتسليم بها:
B: هيدر sticky/fixed واللقطة الكاملة مجمّعة من شرائح (تكرار في اللقطة فقط لا في DOM).
C: lazy-load أو reveal عبر IntersectionObserver لم يُفعَّل لعدم التمرير.
A: عرض الحاوية أو padding/gap/grid أو max-width بالـ ch يضيّق العنوان.

الصلاحيات: فتح الرئيسية كزائر (GET) بمتصفح headless؛ قراءة ملفات القالب على النسخة؛
WP-CLI قراءة فقط على النسخة؛ قراءة أدلة commit 421a7bbf6b31865fda6b133eaab5d99a4176766e.
ممنوع: أي كتابة، تسجيل دخول، حسابات/طلبات/بريد، الموقع الأصلي، v1، capability-test-restored،
مشروع Downloads\woocommerce، طباعة wp-config/env/cookies/بيانات عملاء، تثبيت أدوات.

1) أكد الهوية: Local ID FYikxAbbt، الحارس 000-madar-review-safety.php فعّال، القالب الابن 2.1.6.
   اختلاف = BLOCKED.
2) لكل من 375x812 و1440x900:
A) selector عنوان الحملة، clientWidth/scrollWidth، computed: font-size، line-height،
   letter-spacing، word-break، overflow-wrap، white-space، max-width، width، padding، margin؛
   سلسلة الآباء حتى main (display، grid-template-columns/flex-basis/gap، العرض)؛
   القاعدة المسؤولة (ملف:سطر، selector)؛ هل المصدر block/pattern أم PHP (المسار في القالب الابن).
B) عدد header وnav وwp-block-template-part وتكرار id/class في DOM؛ position وtop المحسوبان
   للهيدر؛ القياس بعد تمرير تدريجي: هل توجد نسخة ثانية فعلًا؟ الحكم: تكرار حقيقي أم أثر التقاط.
   لا تلتقط ولا ترفع صورًا.
C) لكل img وخلفية CSS في الحملة و«دفتر مدار»: selector، src، currentSrc، loading/decoding/
   fetchpriority، complete، naturalWidth/Height، الأبعاد المعروضة، opacity/visibility/display،
   transform، class الـ reveal/lazy؛ HTTP status وContent-Type وحجم (GET محلي)؛ القياس قبل
   وبعد تمرير الصفحة بدفعات 400px وانتظار 500ms؛ وجود الملف في uploads وحجمه فقط؛ أخطاء
   console وطلبات status>=400.
3) لا تحفظ أي تغيير CSS. تجارب devtools المؤقتة فقط. عند أول فشل أو طلب كتابة توقف.
