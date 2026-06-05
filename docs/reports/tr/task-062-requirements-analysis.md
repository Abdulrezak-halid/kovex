# TASK-062 - Gereksinim Analizi

## Amaç

Bu belge, Kovex ERP projesinin işlevsel ve işlevsel olmayan gereksinimlerini akademik bir düzen içinde açıklamak amacıyla hazırlanmıştır. Gereksinimler, projede geliştirilen modüllerle ilişkilendirilerek sistemin hangi ihtiyaçlara cevap verdiği gösterilmiştir.

## İşlevsel Gereksinimler

| No | Gereksinim | İlgili Modül |
| --- | --- | --- |
| FR-01 | Kullanıcı sisteme giriş yapabilmelidir. | Kimlik Doğrulama |
| FR-02 | Kullanıcı, yetkisine uygun sayfalara erişebilmelidir. | Kimlik Doğrulama, Yetkilendirme, Ayarlar |
| FR-03 | Yönetici kullanıcı oluşturabilmeli, düzenleyebilmeli ve silebilmelidir. | Ayarlar, Kullanıcı Yönetimi |
| FR-04 | Müşteri kayıtları eklenebilmeli, listelenebilmeli, düzenlenebilmeli ve silinebilmelidir. | Satış, Müşteriler |
| FR-05 | Tedarikçi kayıtları eklenebilmeli, listelenebilmeli, düzenlenebilmeli ve silinebilmelidir. | Satın Alma, Tedarikçiler |
| FR-06 | Ürün kayıtları ve ürün bilgileri yönetilebilmelidir. | Envanter, Ürünler |
| FR-07 | Depo kayıtları yönetilebilmelidir. | Envanter, Depolar |
| FR-08 | Teklif oluşturulabilmeli ve teklif siparişe dönüştürülebilmelidir. | Satış, Teklifler, Siparişler |
| FR-09 | Sipariş oluşturulabilmeli, güncellenebilmeli ve faturaya dönüştürülebilmelidir. | Satış, Siparişler, Faturalar |
| FR-10 | Satış işlemleri stok miktarlarını azaltmalıdır. | Satış, Envanter, Stok |
| FR-11 | Satın alma siparişleri oluşturulabilmeli ve teslim alma işlemi stok miktarlarını artırmalıdır. | Satın Alma, Envanter, Stok |
| FR-12 | Satın alma faturaları kaydedilebilmeli ve takip edilebilmelidir. | Satın Alma, Faturalar |
| FR-13 | Satış, satın alma ve envanter raporları görüntülenebilmelidir. | Raporlar |
| FR-14 | Raporlar tarih, müşteri, tedarikçi veya ürün gibi alanlarla filtrelenebilmelidir. | Raporlar |
| FR-15 | Raporlar PDF veya Excel olarak dışa aktarılabilmelidir. | Raporlar |
| FR-16 | Proje ve görev kayıtları oluşturulup takip edilebilmelidir. | Planlama |
| FR-17 | Listelerde arama, sıralama ve kayıt limiti gibi kontroller bulunmalıdır. | Ortak Liste Bileşenleri |
| FR-18 | Kullanıcı işlemlerinde başarılı veya hatalı durumlar anlaşılır mesajlarla gösterilmelidir. | Tüm Arayüz Modülleri |

## İşlevsel Olmayan Gereksinimler

| No | Gereksinim | Açıklama |
| --- | --- | --- |
| NFR-01 | Kullanılabilirlik | Arayüz sade, anlaşılır ve günlük iş akışlarına uygun olmalıdır. |
| NFR-02 | Güvenlik | Kullanıcı girişi, rol tabanlı erişim ve parola güvenliği desteklenmelidir. |
| NFR-03 | Veri bütünlüğü | Satış, satın alma ve stok işlemleri birbiriyle tutarlı çalışmalıdır. |
| NFR-04 | Bakım yapılabilirlik | Kod yapısı modüler olmalı ve frontend, backend, veritabanı, API sözleşmesi gibi katmanlar ayrılmalıdır. |
| NFR-05 | Genişletilebilirlik | Gelecekte muhasebe, bildirim, mobil destek veya gelişmiş raporlar gibi modüller eklenebilmelidir. |
| NFR-06 | Performans | Listeleme, filtreleme ve raporlama işlemleri kullanıcıyı bekletmeden çalışacak şekilde tasarlanmalıdır. |
| NFR-07 | Uyumluluk | Sistem modern tarayıcılarda çalışmalı ve farklı ekran boyutlarına uyum sağlamalıdır. |
| NFR-08 | Test edilebilirlik | API uç noktaları, iş akışları ve manuel test senaryoları doğrulanabilir olmalıdır. |
| NFR-09 | Dokümantasyon | Kurulum, API, test ve final raporu için düzenli dokümantasyon bulunmalıdır. |

## Modüllerle İlişki

Gereksinimler, sistemin ana modülleriyle doğrudan ilişkilidir. Satış modülü müşteri, teklif, sipariş ve fatura süreçlerini karşılar. Satın alma modülü tedarikçi, satın alma siparişi ve satın alma faturası ihtiyaçlarını karşılar. Envanter modülü ürün, depo ve stok takibini sağlar. Raporlar modülü karar destek amacıyla satış, satın alma ve stok verilerini özetler. Planlama modülü proje ve görev yönetimini destekler. Ayarlar modülü ise kullanıcı ve rol yönetimiyle sistem güvenliğini destekler.

Bu yapı, Kovex ERP'nin yalnızca tekil sayfalardan oluşmadığını; iş süreçleri arasında veri ilişkisi kuran bütünleşik bir ERP yaklaşımı sunduğunu göstermektedir.
