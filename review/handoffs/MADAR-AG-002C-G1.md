TASK_ID: MADAR-AG-002C-G1
PHASE: APPLY_REVIEW
SUBPHASE: GITHUB_EVIDENCE_HANDOFF_ONLY
PROTOCOL_VERSION: 2

## الهدف والسلطة

هذا الملف المنشور على GitHub هو تعليمات المهمة، ويلغي طلب E1 لرفع الصور يدويًا.
المستخدم ينقل رسائل التنسيق فقط. الملفات في الاتجاهين تتنقل عبر GitHub.
المطلوب نقل صور baseline الموجودة من المهمة 002C إلى فرع أدلة منفصل.
المهمة تجيز commit/push المحددين فقط؛ لا تجيز أي تعديل أو نشر على WordPress.

## المراجع والمسارات

المستودع الوحيد: itachi-void/egypt-fashion-store على github.com.
المستودع المحلي الأساسي: استنساخ scratch الذي تحقق منه تقرير MADAR-AG-001،
وليس الاستنساخ الأقدم في Downloads. حل مساره من سجلك المحلي؛ لا تخمّن مسارًا.
الفرع المتوقع: review/local-snapshot.
BASE_COMMIT: 69bf80a72dfd014bfe2cf8c2ab360c3ee8e1aecd

مصدر الصور: مجلد الأدلة الخاص الموجود والمسجل في تقريرك MADAR-AG-002C،
واسمه MADAR-AG-002C-20261023-204928-myacb1.
لا تنشر مساره المطلق أو بقية محتوياته.

فرع الإخراج الجديد: evidence/madar-ag-002c-baseline.
worktree جديد: مجلد شقيق للمستودع الأساسي باسم egypt-fashion-evidence-002c،
خارج Local وGit worktrees الموجودة. يجب أن يكون الاسم والمسار غير مستخدمين.

قائمة ملفات commit الوحيدة:
- review/evidence/MADAR-AG-002C/baseline-desktop-1440.png
- review/evidence/MADAR-AG-002C/baseline-mobile-375.png
- review/evidence/MADAR-AG-002C/metadata.json

## الصلاحيات

- قراءة الصور الموجودة وGit المحلي: YES.
- قراءة ملف المهمة عبر GitHub API، أو fetch لفرع handoff/madar-ag-002c-g1 فقط: YES.
- git ls-remote على origin لهذا المستودع للتحقق من فرع الأدلة: YES.
- إنشاء worktree وفرع الأدلة المحددين من BASE_COMMIT: YES.
- commit: YES، الملفات الثلاثة فقط في فرع الأدلة.
- push: YES، فرع الأدلة الجديد فقط إلى origin.
- pull/merge/PR/force/amend/تغيير إعدادات Git أو تجاوز hooks: NO.
- تعديل ملفات/فرع worktree الأساسي: NO، عدا metadata Git اللازمة لإضافة worktree.
- WordPress/React/database/guard changes أو تشغيل الموقع أو إعادة التصوير: NO.
- رفع SQL/backups/logs/config/credentials أو تقرير محلي خام أو بيانات عملاء: NO.
- أي نقل ملفات يدويًا بواسطة المستخدم أو fallback خارج GitHub: NO.

## 1. تحقق قبل أي كتابة

تحقق من remote identity دون إظهار بيانات اعتماد.
افحص status وdiff وstaged diff وgit log --oneline -10 والفرع وHEAD.
يجب أن يطابق HEAD والفرع المرجعين أعلاه وأن تكون شجرة العمل نظيفة.
إذا اختلفت الحالة، توقف دون checkout أو reset أو stash أو معالجة تلقائية.

تحقق من عدم وجود فرع الإخراج محليًا ومسار worktree، ثم نفذ:
git ls-remote --heads origin refs/heads/evidence/madar-ag-002c-baseline
المطلوب exit 0 ومخرجات فارغة. فشل الاتصال ليس دليل غياب الفرع.
إذا كان الفرع أو المسار موجودًا، أو تعذر التحقق، توقف دون استبدال.
إذا احتاج GitHub صلاحية غير متاحة، أعد BLOCKED؛ لا تطبع أو تطلب token/password.

## 2. تحقق من الصور وصلاحية النشر

افتح ملفي PNG الموجودين محليًا فقط، دون زيارة الموقع أو إعادة التصوير.
تأكد أنهما الصفحة العامة كزائر، ولا يحتويان admin bar أو بيانات عملاء أو أسرار.
افحص metadata للصورتين دون طباعة بيانات حساسة.
عامل المستودع كأنه Public ما لم تثبت غير ذلك؛ Private لا يجيز رفع أسرار.
إذا كانت الصور غير آمنة أو مفقودة أو كان مسار المصدر ملتبسًا، توقف.
لا تستبدل الصور بلقطات قديمة، ولا تنشر مجلد النسخ الخاص كاملًا.

## 3. أنشئ worktree وأعد الملفات الثلاثة

استخدم git worktree add لإنشاء الفرع الجديد من BASE_COMMIT في المجلد الشقيق المحدد.
لا تبدل الفرع في الاستنساخ الأساسي، ولا تنشئ worktree داخل موقع.
أنشئ مجلد review/evidence/MADAR-AG-002C في worktree الجديد فقط.
انسخ الصورتين إليه دون تعديل بايتاتهما، ثم قارن SHA-256 للمصدر والنسخة.

أنشئ metadata.json باستخدام JSON parser/writer. يضم فقط:
- taskId وsourceCommit الكامل وguardVersion=1.0.0.
- أسماء ملفات الأدلة وأحجامها وأبعاد PNG الفعلية وSHA-256.
- viewport وclientWidth/scrollWidth/scrollHeight وحالة الخط من تقرير الالتقاط الموجود،
  مع وسم هذه القيم reported_capture_measurements.
- capturedAt إن كان مسجلًا فعلًا؛ وإلا null، لا وقت رفع الملفات.

لا تضع مسارات الجهاز أو username/email أو Site IDs أو بيانات اتصال/cookies/tokens.
لا تنسخ التقرير المحلي الخام. لا تدّع أن القياسات أعيد تنفيذها.

## 4. راجع وcommit/push

افحص git check-ignore وgit check-attr للملفات الثلاثة.
إذا كانت ignored أو احتاجت LFS/أداة غير متاحة، توقف؛ لا git add -f أو تثبيت أدوات
أو تغيير .gitignore/.gitattributes.

راجع status وdiff. Stage المسارات الثلاثة حرفيًا فقط، لا git add .
راجع staged name-status وstat وmetadata.json:
يجب أن تكون الإضافات الثلاثة فقط، دون تغيير أي ملف آخر.

رسالة commit: review: add 002C baseline screenshots
عند فشل commit أو hook توقف دون amend أو تجاوز الحماية.
ادفع فرع evidence/madar-ag-002c-baseline فقط إلى origin.
تحقق بـgit ls-remote أن SHA البعيد يساوي commit المحلي الكامل.
لا PR أو merge أو نشر. اترك worktree موجودًا ولا تنظف ملفات المستخدم.

## 5. الرد ثم التوقف

TASK_ID: MADAR-AG-002C-G1
STATUS: PUSHED / BLOCKED
REPOSITORY:
BRANCH:
BASE_COMMIT:
COMMIT_SHA: full SHA الفعلي
REMOTE_REF_VERIFIED: SHA من ls-remote وexit code
FILES: المسارات الثلاثة، SHA-256 للصور، أبعادها وأحجامها
GITHUB_URLS: روابط الملفات عند commit الكامل، دون tokens أو روابط جهاز
STAGED_DIFF_SCOPE:
REFERENCE_WORKTREE_HEAD_AND_STATUS:
WORDPRESS_CHANGES: NONE
PRIVATE_FILES_UPLOADED: NONE
COMMANDS: الفعلية مع exit codes دون أسرار
FIRST_FAILURE_OR_BLOCKER:
UNEXECUTED_STEPS:

المستخدم ينقل هذا الرد النصي فقط. Figma يقرأ الملفات من GitHub بنفسه.
عند أول فشل توقف ولا تنفذ الخطوات اللاحقة.
لا تطلب رفع ملفات يدويًا ولا تبدأ تعديل التصميم أو التطبيق على الأصل.
