# مراجعة التصميم وفق الكتيب

تم تطبيق ألوان الكحلي والذهبي، الشريط الجانبي الأيمن وترتيب الأقسام الثمانية، لوحة مؤشرات مع عمود جانبي، بطاقات المخزون وتفاصيل السيارة، لوحات المبيعات والمشتريات، التقارير والإعدادات، وتصميم الجوال مع شريط تنقل سفلي.

المرجع: CAR_DEALER_COMPLETE_UI_BROCHURE (1).pdf. التطبيق يتبع الشكل والترتيب، مع إبقاء الوظائف والأرقام مرتبطة ببيانات Oracle المتوفرة. لا توجد أرقام ربح أو حجوزات وهمية. حالة الترحيل ليست حالة بيع السيارة.

## التحقق

- TypeScript والبناء ناجحان.
- 52 اختباراً ناجحاً واختبار واحد متجاوز قبل إضافة اختبارات الفلاتر.
- 20 فحصاً فعلياً لقراءة Oracle وربط تفاصيل الفواتير.
- فحص خمس صفحات بعرضي 1440 و390، تحميل الصور، عدم تجاوز عرض الشاشة، وفتح تفاصيل السيارة في المقاسين. لا استثناءات تشغيل في المتصفح.
- الحساب المؤقت وجلساته أزيلا بعد الاختبار.
- نتائج المتصفح: brochure-browser-verification.json؛ أداة الفحص: scripts/verify-brochure-browser.mjs (تحتاج معاينة محلية ومنفذ CDP 9225).

## القيود القائمة

هناك 13 مشغلاً معطلاً أو غير صالح و115 كائناً غير صالح في القاعدة القديمة. العمليات المالية المتأثرة ما زالت محجوبة؛ راجع DATABASE_REVIEW.md وTRIGGER_REVIEW.md. تحديث التصميم لا يعني إصلاح هذه المشغلات.

## الصور

تم إنشاء الصور بأداة imagegen المدمجة (built-in)، وهي توضيحية وليست صور سيارات المخزون الفعلية. تستخدم الواجهة صورة حسب نوع السيارة، مع شارة توضح ذلك. المسارات والطلبات المستخدمة:

### suv

المسار: client/public/images/cars/studio-suv.png

Photorealistic automotive catalog photograph for an Arabic car dealership management dashboard. A pearl white contemporary large SUV, front three-quarter view, nose pointing left, entire vehicle visible including all wheels, centered with 12 percent clean margins. Soft light gray seamless studio background and floor with subtle grounded shadow, polished paint, realistic glass and wheels, premium commercial photography. Wide landscape 16:10 composition. Generic unbranded design, no logos, no text, no people, no visible license plate numbers. This is an illustrative stock vehicle image, not a specific real inventory item.

### sedan

المسار: client/public/images/cars/studio-sedan.png

Photorealistic automotive catalog photograph for an Arabic car dealership dashboard. A deep graphite metallic contemporary midsize luxury sedan, front three-quarter view, nose pointing left, full car visible with 12 percent clean margins. Soft light gray seamless studio background and floor, subtle contact shadow, realistic wheels, refined commercial car photography, consistent studio lighting. Wide landscape 16:10 composition. Generic unbranded design, no logos, no text, no people, no visible license plate numbers. Illustrative catalog asset.

### pickup

المسار: client/public/images/cars/studio-pickup.png

Photorealistic automotive catalog photograph for an Arabic car dealership dashboard. A silver metallic modern double-cab pickup truck, front three-quarter view, nose pointing left, full vehicle including all wheels visible with 12 percent clean margins. Light gray seamless studio backdrop and floor with subtle contact shadow, natural reflections, premium commercial car photography. Wide landscape 16:10 composition. Generic unbranded design, no logos, no text, no people, no visible license plate numbers. Illustrative catalog asset.


## استكمال الشاشات الداخلية

تمت إضافة ملف العميل الجانبي حسب صفحة العملاء في الكتيب، وتحديد الصف المختار وعرض بياناته الفعلية، وزر اتصال عند توفر رقم صالح. أضيفت صور رمزية للعملاء والموردين ومؤشرات الأدوار في شاشة المستخدمين، ووُحّد تصميم نماذج المستخدمين وسجل العمليات ونوافذ التفاصيل والحفظ والتعديل.

تم فحص العملاء والمستخدمين والتقرير والعقود بعرضي 1440 و390، بما يشمل تبديل ملف العميل وفتح تفاصيل العقد، دون تجاوز عرض الشاشة أو استثناءات تشغيل. النتائج في brochure-secondary-verification.json.
