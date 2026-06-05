# TASK-063 - Fizibilite Çalışması

## Amaç

Bu belge, Kovex ERP projesinin teknik, ekonomik, zamansal ve pratik açıdan uygulanabilirliğini değerlendirmek amacıyla hazırlanmıştır.

## Teknik Fizibilite

Kovex ERP teknik açıdan uygulanabilir bir projedir. Projede kullanılan React, Vite, TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, Drizzle ORM, OpenAPI ve pnpm workspace gibi teknolojiler güncel, yaygın kullanılan ve güçlü topluluk desteğine sahip araçlardır. Bu teknolojiler web tabanlı bir ERP sistemi geliştirmek için yeterli altyapıyı sağlamaktadır.

Projenin monorepo yapısı, frontend, backend, veritabanı, API sözleşmesi, API istemcisi ve validasyon katmanlarını ayrı paketler hâlinde düzenlemektedir. Bu yapı, projenin bakımını ve geliştirilmesini kolaylaştırır. PostgreSQL ilişkisel veri modeli sayesinde müşteri, tedarikçi, ürün, sipariş, fatura ve stok gibi ERP verileri tutarlı biçimde saklanabilir.

Teknik olarak en önemli riskler; veritabanı bağlantısı, rol tabanlı yetkilendirme, stok hareketlerinin tutarlılığı ve raporların doğru veri üretmesidir. Bu riskler, API testleri, manuel test senaryoları, validasyon kontrolleri ve düzenli dokümantasyon ile azaltılmıştır.

## Ekonomik Fizibilite

Proje ekonomik açıdan da uygulanabilirdir. Geliştirme sürecinde açık kaynaklı veya ücretsiz kullanılabilen teknolojiler tercih edilmiştir. React, Node.js, Express, PostgreSQL, TypeScript ve Tailwind CSS gibi araçlar lisans maliyeti oluşturmadan kullanılabilir. Bu durum, mezuniyet projesi kapsamında geliştirme maliyetini düşük tutar.

Kovex ERP'nin hedef kitlesi olan KOBİ'ler için maliyet önemli bir faktördür. Büyük ERP sistemleri kurulum, lisans, eğitim ve danışmanlık maliyetleri nedeniyle küçük işletmeler için ağır olabilir. Kovex ERP ise temel iş süreçlerine odaklanan daha sade bir çözüm modeli sunduğu için düşük maliyetli bir alternatif olarak değerlendirilebilir.

## Zaman Fizibilitesi

Proje sprint yapısıyla planlandığı için zaman açısından yönetilebilir bir süreç izlenmiştir. İlk sprintlerde proje yapısı, gerçek backend bağlantısı, CRUD işlemleri, güvenlik, raporlar ve test süreçleri tamamlanmıştır. Sprint 6 ise dokümantasyon ve mezuniyet materyallerine ayrılmıştır.

Bu aşamalı yaklaşım, projenin tek seferde büyük bir bütün olarak ele alınması yerine daha küçük ve takip edilebilir görevlere bölünmesini sağlamıştır. Böylece her sprint sonunda somut bir çıktı elde edilmiş, eksikler görev listesi üzerinden izlenebilmiştir.

## Pratik Fizibilite

Kovex ERP pratik açıdan uygulanabilir ve anlaşılır bir kullanım senaryosuna sahiptir. Küçük ve orta ölçekli işletmelerin satış, satın alma, stok ve raporlama gibi temel ihtiyaçları gerçek iş süreçleriyle uyumludur. Kullanıcılar müşteri, tedarikçi, ürün, sipariş ve fatura kayıtlarını sistem üzerinden takip edebilir.

Sistemin modüler yapısı, kullanıcının yalnızca ihtiyaç duyduğu bölümlere odaklanmasını kolaylaştırır. Ayrıca raporlar, filtreler, dışa aktarma seçenekleri ve kullanıcı geri bildirim mesajları günlük kullanımda karar alma ve takip süreçlerini destekler.

Sonuç olarak Kovex ERP; kullanılan teknolojiler, düşük geliştirme maliyeti, sprint tabanlı planlama ve gerçek KOBİ ihtiyaçlarına uygun modülleri sayesinde uygulanabilir bir mezuniyet projesidir.
