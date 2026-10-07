# CDMS — نظام إدارة معارض السيارات

React + TypeScript + Node.js/tRPC + Oracle.

## التشغيل المحلي

يتطلب Node.js 22 وقاعدة Oracle متاحة من الجهاز.

```powershell
npm.cmd install
Copy-Item .env.local.example .env.local
# اضبط إعدادات Oracle وكلمة المرور في .env.local على الجهاز
npm.cmd run dev
```

إذا كان ملف .env.local موجودًا، عدّل إعداداته دون استبداله. افتح http://localhost:3000 بعد تشغيل الخادم.

## الفحص والبناء

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
```

ملفات التثبيت والفحص الحقيقي لقاعدة Oracle في scripts/ وdatabase/. النسخ الاحتياطية تُنشأ باستخدام scripts/backup-oracle.ts بعد ضبط الاتصال.
