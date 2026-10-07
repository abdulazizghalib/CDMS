# CDMS — نظام إدارة معارض السيارات

React + TypeScript + Node.js/tRPC + Oracle.

المستودع المستهدف: https://github.com/abdulazizghalib/CDMS

## التشغيل على جهاز المعرض

يتطلب Node.js 22 وOracle متاحة من الجهاز.

```powershell
corepack pnpm install --frozen-lockfile
Copy-Item .env.local.example .env.local
# عدّل .env.local وأضف كلمة مرور Oracle على جهازك فقط
corepack pnpm dev
```

افتح http://localhost:3000. ملف .env.local لا يُرفع للمستودع.
حسابات الدخول والجداول التطبيقية يجب أن تكون مهيأة في Oracle؛ قاعدة البيانات لا تُنقل إلى GitHub.

## التشغيل من GitHub Codespaces

افتح المستودع ثم Code → Codespaces → Create codespace on main.
تُثبت الاعتماديات بإعداد .devcontainer تلقائيًا. ضع متغيرات LOCAL_ORACLE_HOST وLOCAL_ORACLE_PORT وLOCAL_ORACLE_SERVICE_NAME وLOCAL_ORACLE_USER وLOCAL_ORACLE_PASSWORD في Codespaces Secrets أو ملف .env.local داخل البيئة، ثم:

```sh
corepack pnpm dev
```

افتح المنفذ 3000 من تبويب Ports. يجب أن يكون خادم Oracle قابلًا للوصول من Codespaces عبر شبكة آمنة؛ 127.0.0.1 داخل Codespaces يشير إلى البيئة نفسها وليس جهاز المعرض. لا تفتح منفذ Oracle للعامة لتوصيله.

Codespaces بيئة تطوير ومعاينة وليست تشغيلًا دائمًا للمعرض. GitHub Pages لا يشغّل خادم Node.js وقاعدة Oracle.

## التشغيل على استضافة

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm build
# جهز .env من .env.production.example على الخادم
corepack pnpm start
```

في وضع production تُستخدم متغيرات ORACLE\_\*، ويجب أن يكون ORACLE_HOST عنوان خادم Oracle قابلًا للوصول وليس localhost حسب سياسة المشروع الحالية. ضع التطبيق خلف HTTPS لتسجيل الحضور بالموقع من الهاتف. استخدم مدير خدمات لتشغيل الخادم باستمرار.

## الفحص عبر GitHub Actions

ملف .github/workflows/ci.yml ينفذ فحص TypeScript والاختبارات والبناء عند رفع تغييرات أو فتح طلب دمج، ويوفر ملف البناء كـartifact. لا يُجري تغييرات على Oracle ولا ينشر خدمة تشغيل تلقائيًا.

```sh
corepack pnpm check
corepack pnpm test
corepack pnpm build
```

ملفات التثبيت والفحص الحقيقي لـOracle في scripts/ وdatabase/. لا تشغّل عمليات التثبيت على قاعدة فعلية قبل مراجعة إعداد اتصالها.

تفاصيل تجهيز الرفع والتشغيل: [docs/github-setup.md](docs/github-setup.md).
