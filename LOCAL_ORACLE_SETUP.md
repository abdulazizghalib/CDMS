# تشغيل منصة معرض السيارات محليًا مع Oracle ORCL

هذا الوضع مخصص للتطوير والتشغيل داخل جهاز المستخدم الذي توجد عليه قاعدة Oracle. يستخدم التطبيق اتصالًا من الخادم إلى `127.0.0.1:1521/ORCL`، ولا يعرّض قاعدة Oracle للمتصفح. يجب أن يستخدم التطوير المحلي متغيرات `LOCAL_ORACLE_*` فقط؛ لا تستخدم أسرار `ORACLE_*` المُدارة أو السحابية للتطوير المحلي، ولا توجه أسرار الإنتاج إلى `127.0.0.1` مطلقًا.

## المتطلبات

يجب أن تكون Oracle Database وخدمة Oracle Listener قيد التشغيل، وأن يكون اسم الخدمة `ORCL` متاحًا محليًا. كما يجب أن يكون مستخدم التطبيق مخصصًا للمنصة. يفضّل استخدام `OPAL` بصلاحية قراءة فقط أثناء اكتشاف المخطط بدل استخدام حساب `SYSTEM`.

## الإعداد

انسخ `.env.local.example` إلى إعدادات البيئة المحلية، ثم عيّن كلمة المرور خارج الكود. لا تضف كلمة المرور إلى Git أو إلى ملفات الواجهة. الإعدادات الأساسية هي:

| الإعداد | القيمة المحلية |
|---|---|
| المضيف | `127.0.0.1` |
| المنفذ | `1521` |
| الخدمة | `ORCL` |
| المستخدم | `OPAL` عبر `LOCAL_ORACLE_USER` |

## التحقق من Oracle

من جهاز Oracle، تحقق من أن الاتصال يعمل عبر أداة الإدارة كما فعلت سابقًا عند تنفيذ استعلام `SYSDATE`. بعد تشغيل المنصة محليًا، شغّل فحص الاتصال المستقل من نفس جهاز Oracle:

```bash
LOCAL_ORACLE_USER=OPAL LOCAL_ORACLE_PASSWORD='ضعها محليًا' node scripts/check-oracle-local.mjs
```

ويمكن تشغيل اختبار Vitest من نفس الجهاز بعد تحميل متغيرات `LOCAL_ORACLE_*`:

```bash
RUN_ORACLE_CONNECTIVITY_TEST=true pnpm vitest run server/oracle.test.ts
```

الاختبار ينفذ استعلامًا غير تعديلي على `DUAL` ويغلق الاتصال بعد الانتهاء. إذا ظهر `ECONNREFUSED` فالمشكلة في Listener أو المنفذ أو أن التطبيق لا يعمل على نفس الجهاز. إذا ظهر خطأ خدمة، راجع اسم `ORCL` في `tnsnames.ora`. في TOAD افتح TNSNames Editor أو ابحث عن ملف `tnsnames.ora`، ثم راجع كتلة `ORCL` لاستخراج `HOST` و`PORT` و`SERVICE_NAME` أو `SID` دون مشاركة كلمة المرور.

## تشغيل المنصة

على Linux/macOS:

```bash
pnpm install
pnpm dev
```

على Windows PowerShell استخدم `pnpm.cmd` لتجاوز مشكلة حظر `pnpm.ps1`، ثم عرّف متغيرات Oracle بصيغة PowerShell:

```powershell
pnpm.cmd install
$env:LOCAL_ORACLE_HOST = "127.0.0.1"
$env:LOCAL_ORACLE_PORT = "1521"
$env:LOCAL_ORACLE_SERVICE_NAME = "ORCL"
$env:LOCAL_ORACLE_USER = "OPAL"
$env:LOCAL_ORACLE_PASSWORD = "ضع كلمة المرور الصحيحة محليًا"
node scripts/check-oracle-local.mjs
pnpm.cmd dev
```

إذا أردت استخدام الأمر `pnpm` مباشرة في PowerShell، شغّل مرة واحدة للمستخدم الحالي:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

لا تحفظ كلمة المرور في Git أو داخل ملفات المشروع.

بعد التشغيل، افتح عنوان المنصة المحلي الذي يظهر في الطرفية. لا تستخدم عنوان النسخة المنشورة للوصول إلى Oracle على جهازك؛ فـ `localhost` في النسخة المنشورة يشير إلى خادم النشر وليس إلى جهازك.

## تسجيل الدخول محليًا

يستطيع الخادم البدء بدون إعداد OAuth. عند غياب قيم Manus OAuth المحلية (`OAUTH_SERVER_URL` و`VITE_OAUTH_PORTAL_URL` و`VITE_APP_ID`) لا تُحجب الواجهة خلف شاشة دخول لا يمكن إتمامها؛ تنتقل الواجهة مباشرة إلى مساحة عمل المعرض، التي تسجّل الدخول عبر نموذج عمليات Oracle المحلي. عند توفير قيم OAuth تظهر شاشة تسجيل الدخول أولاً قبل مساحة العمل. جهّز إعداد OAuth محليًا قبل اختبار صلاحيات Manus.

## خطة إدخال النسخة القديمة

لا يتم استيراد ملف `opal2026_08_18.dmp` تلقائيًا. يجب أولًا إنشاء قاعدة اختبار، ثم استخدام Oracle Data Pump لاستخراج DDL عبر `SQLFILE`، ومراجعة الجداول والعلاقات والمشغلات، ثم اختبار القراءة من جداول مثل `CAR_ENTRY` و`CAR_PURCHASE` و`CAR_SALES` و`ACCOUNT_LEDGER`. بعد اعتماد المطابقة، تُبنى عمليات القراءة والكتابة تدريجيًا مع سجل تدقيق وخطة رجوع.
