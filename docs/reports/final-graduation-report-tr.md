# Kovex ERP - Küçük İşletmeler İçin Kurumsal Kaynak Planlama Sistemi

## Kapak Sayfası

**Üniversite Adı:** [Üniversite adını ekleyiniz]

**Fakülte / Bölüm:** [Fakülte ve bölüm bilgisini ekleyiniz]

**Bitirme Projesi Başlığı:** Kovex ERP - Small Business Enterprise Resource Planning System

**Öğrenci Adı / Adları:** [Öğrenci adını/adlarını ekleyiniz]

**Öğrenci Numarası / Numaraları:** [Öğrenci numarasını/numaralarını ekleyiniz]

**Danışman / Öğretim Elemanı:** [Danışman veya öğretim elemanı adını ekleyiniz]

**Akademik Yıl:** [Akademik yılı ekleyiniz]

---

## Özet

Kovex ERP, küçük ve orta ölçekli işletmeler için geliştirilen web tabanlı bir kurumsal kaynak planlama sistemidir. Proje; satış, satın alma, envanter, raporlama, planlama, kullanıcı yönetimi, kimlik doğrulama ve yetkilendirme gibi temel iş süreçlerine odaklanmaktadır. Sistemin temel amacı; elektronik tablolar, kâğıt kayıtlar, mesajlaşma uygulamaları ve birbirinden bağımsız araçlar üzerinden yürütülen dağınık iş akışlarını azaltmaktır.

Sistem; müşteriler, tedarikçiler, ürünler, teklifler, satış siparişleri, faturalar, satın alma siparişleri, stok kayıtları, raporlar, projeler, görevler ve kullanıcıların tek bir uygulama üzerinden yönetilmesini sağlar. Kovex ERP, gereksinim analizi, sistem tasarımı, veritabanı modelleme, backend geliştirme, frontend uygulaması, API dokümantasyonu, test ve proje dokümantasyonu aşamalarını göstermek amacıyla bir bitirme projesi olarak geliştirilmiştir.

Projede React, TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, Drizzle ORM, OpenAPI, Swagger UI, Docker ve Docker Compose gibi modern teknolojiler kullanılmıştır. Arayüzde koyu ve açık tema desteği bulunmaktadır. Ayrıca kullanıcı arayüzü tasarımı, uygulama geliştirme sürecinden önce Stitch üzerinde tam ekran tasarımlar olarak hazırlanmıştır.

---

## İçindekiler

1. Giriş
2. Problem Tanımı
3. Projenin Katma Değeri
4. Gereksinim Analizi
5. Fizibilite Çalışması
6. Mevcut Sistemlerle Karşılaştırma
7. Sistem Tasarımı
8. Veritabanı Tasarımı
9. Sistem Mimarisi
10. Temel Sistem İş Akışları
11. Uygulama Detayları
12. Sprint Planlaması ve Takım Çalışması
13. Kullanıcı Arayüzü ve Ekran Görüntüleri
14. Docker ve Swagger UI
15. Test ve Doğrulama
16. Sonuç

---

## 1. Giriş

Kovex ERP, küçük işletme operasyonları için geliştirilen sadeleştirilmiş bir ERP sistemidir. Küçük ve orta ölçekli işletmeler satış, satın alma, envanter, müşteri, tedarikçi ve rapor süreçlerini yönetmek zorundadır. Ancak bu süreçler çoğu zaman ayrı dosyalar veya manuel yöntemler ile yürütülmektedir. Bu durum, verinin kontrol edilmesini zorlaştırmakta ve hata riskini artırmaktadır.

Proje, en önemli operasyonel modülleri birbirine bağlayan merkezi bir sistem sunmayı amaçlamaktadır. Çok geniş kapsamlı bir kurumsal sistem geliştirmek yerine Kovex ERP, akademik bir proje için uygun olan ve günlük iş kullanımında anlaşılabilir temel ERP işlevlerine odaklanmaktadır.

Proje modüler bir yazılım mimarisiyle geliştirilmiştir. Frontend, backend, veritabanı şeması, API sözleşmesi, doğrulama mantığı ve oluşturulan API istemcisi düzenli paketler halinde ayrılmıştır. Bu yapı sistemin bakımını, test edilmesini ve ileride genişletilmesini kolaylaştırmaktadır.

---

## 2. Problem Tanımı

Küçük ve orta ölçekli işletmeler günlük operasyonlarını çoğu zaman elektronik tablolar, kâğıt belgeler, mesajlaşma uygulamaları ve temel muhasebe yazılımları gibi birbirinden kopuk araçlarla yönetmektedir. Veriler farklı yerlerde tutulduğu için işletmeler her zaman tek ve güvenilir bir bilgi kaynağına sahip olamamaktadır.

Bu parçalı çalışma yapısı; stok takibi, sipariş yönetimi, fatura takibi, satın alma ve raporlama süreçlerinde sorunlara yol açabilir. Aynı bilgi birden fazla kez girilebilir, kayıtlar güncelliğini kaybedebilir ve önemli operasyonel detaylar gözden kaçabilir. Bu durum zaman kaybına, insan hatasına, karar alma süreçlerinde gecikmeye ve operasyonel verimliliğin azalmasına neden olabilir.

KOBİ'ler için doğru ve izlenebilir iş süreçleri büyüme açısından önemlidir. Hatalı stok bilgisi fazla stok veya ürün eksikliği oluşturabilir. Satış ve satın alma verilerinin zayıf takip edilmesi gelir, gider ve performans analizini zorlaştırır. Kovex ERP bu problemi merkezi ve kullanıcı dostu bir ERP modeliyle ele almaktadır.

---

## 3. Projenin Katma Değeri

Kovex ERP; satış, satın alma, envanter, raporlar, planlama ve kullanıcı yönetimini tek bir sistemde birleştirerek pratik değer üretmektedir. Bu yapı mükerrer veri girişini azaltır ve kullanıcılara işletme operasyonları hakkında daha net bir görünüm sağlar.

Proje akademik açıdan da değer taşımaktadır. Çünkü gereksinim analizi, veritabanı tasarımı, sistem mimarisi, REST API geliştirme, frontend uygulaması, kimlik doğrulama, yetkilendirme, raporlama, Docker tabanlı kurulum, Swagger UI dokümantasyonu, manuel testler ve bitirme projesi dokümantasyonu gibi birçok yazılım mühendisliği aşamasını içermektedir.

Dağınık araçlarla karşılaştırıldığında Kovex ERP veri organizasyonunu ve süreç görünürlüğünü artırır. Büyük ERP sistemleriyle karşılaştırıldığında ise daha küçük ve anlaşılır bir kapsama sahiptir. Bu nedenle hem KOBİ'ler hem de bitirme projesi bağlamı için uygun bir model sunmaktadır.

---

## 4. Gereksinim Analizi

### 4.1 Fonksiyonel Gereksinimler

| No | Gereksinim | İlgili Modül |
| --- | --- | --- |
| FR-01 | Kullanıcılar sisteme giriş yapabilmelidir. | Kimlik Doğrulama |
| FR-02 | Kullanıcılar rollerine göre sayfalara erişebilmelidir. | Kimlik Doğrulama, Yetkilendirme, Ayarlar |
| FR-03 | Yöneticiler kullanıcıları yönetebilmelidir. | Ayarlar |
| FR-04 | Müşteriler oluşturulabilmeli, listelenebilmeli, güncellenebilmeli ve silinebilmelidir. | Satış, Müşteriler |
| FR-05 | Tedarikçiler oluşturulabilmeli, listelenebilmeli, güncellenebilmeli ve silinebilmelidir. | Satın Alma, Tedarikçiler |
| FR-06 | Ürünler ve ürün detayları yönetilebilmelidir. | Envanter, Ürünler |
| FR-07 | Depolar yönetilebilmelidir. | Envanter, Depolar |
| FR-08 | Teklifler oluşturulabilmeli ve siparişe dönüştürülebilmelidir. | Satış |
| FR-09 | Siparişler oluşturulabilmeli, güncellenebilmeli ve faturaya dönüştürülebilmelidir. | Satış, Faturalar |
| FR-10 | Satış işlemleri stok miktarını azaltmalıdır. | Satış, Envanter |
| FR-11 | Satın alma kabul işlemleri stok miktarını artırmalıdır. | Satın Alma, Envanter |
| FR-12 | Satın alma faturaları kaydedilebilmeli ve takip edilebilmelidir. | Satın Alma |
| FR-13 | Satış, satın alma ve envanter raporları görüntülenebilmelidir. | Raporlar |
| FR-14 | Raporlar filtreleme desteğine sahip olmalıdır. | Raporlar |
| FR-15 | Raporlar PDF veya Excel formatında dışa aktarılabilmelidir. | Raporlar |
| FR-16 | Projeler ve görevler oluşturulabilmeli ve takip edilebilmelidir. | Planlama |
| FR-17 | Listeler arama, sıralama ve limit kontrollerini desteklemelidir. | Ortak Bileşenler |
| FR-18 | Kullanıcı işlemleri başarı veya hata geri bildirimi göstermelidir. | Frontend |

### 4.2 Fonksiyonel Olmayan Gereksinimler

| No | Gereksinim | Açıklama |
| --- | --- | --- |
| NFR-01 | Kullanılabilirlik | Arayüz açık, anlaşılır ve günlük iş akışlarına uygun olmalıdır. |
| NFR-02 | Güvenlik | Giriş, rol tabanlı erişim ve parola koruması desteklenmelidir. |
| NFR-03 | Veri Bütünlüğü | Satış, satın alma ve stok işlemleri tutarlı kalmalıdır. |
| NFR-04 | Bakım Kolaylığı | Kod tabanı frontend, backend, veritabanı, API ve doğrulama katmanlarına ayrılmalıdır. |
| NFR-05 | Genişletilebilirlik | Gelecekte yeni modüller eklenebilir olmalıdır. |
| NFR-06 | Performans | Listeler, filtreler ve raporlar verimli şekilde yanıt vermelidir. |
| NFR-07 | Uyumluluk | Sistem modern tarayıcılarda çalışmalıdır. |
| NFR-08 | Test Edilebilirlik | Temel iş akışları manuel testler ve API testleriyle doğrulanabilir olmalıdır. |
| NFR-09 | Dokümantasyon | Kurulum, API, diyagramlar ve final raporu dokümantasyonu bulunmalıdır. |

---

## 5. Fizibilite Çalışması

### 5.1 Teknik Fizibilite

Kovex ERP teknik açıdan uygulanabilir bir projedir. React, Vite, TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, Drizzle ORM, OpenAPI ve pnpm workspace gibi modern ve yaygın teknolojiler web tabanlı bir ERP sistemi geliştirmek için uygun altyapı sağlamaktadır.

Monorepo yapısı frontend, backend, veritabanı, API sözleşmesi, API istemcisi ve doğrulama katmanlarını ayırmaktadır. PostgreSQL; müşteriler, tedarikçiler, ürünler, siparişler, faturalar, stok kayıtları, projeler ve görevler gibi ERP verileri için uygun ilişkisel veritabanı modelini sağlamaktadır.

### 5.2 Ekonomik Fizibilite

Proje açık kaynaklı veya ücretsiz olarak kullanılabilen teknolojilerle geliştirildiği için ekonomik açıdan uygulanabilirdir. Bu durum lisans maliyetlerini azaltmakta ve projeyi akademik geliştirme ile KOBİ odaklı değerlendirme için uygun hale getirmektedir.

### 5.3 Zaman Fizibilitesi

Proje sprint tabanlı planlama ile yürütülmüştür. Önceki sprintlerde proje kurulumu, backend entegrasyonu, CRUD işlemleri, güvenlik, raporlar, testler ve final dokümantasyonu ele alınmıştır. Bu yaklaşım çalışmayı yönetilebilir ve takip edilebilir hale getirmiştir.

### 5.4 Pratik Fizibilite

Proje yaygın KOBİ iş akışlarıyla uyumludur. Kullanıcılar müşterileri, tedarikçileri, ürünleri, teklifleri, siparişleri, faturaları, stokları, satın almaları, raporları, projeleri ve görevleri tek sistem üzerinden yönetebilmektedir.

---

## 6. Mevcut Sistemlerle Karşılaştırma

Kovex ERP; Odoo, Zoho One ve Microsoft Dynamics 365 Business Central gibi mevcut iş yönetim sistemleriyle karşılaştırılmıştır.

| Kriter | Odoo | Zoho One | Business Central | Kovex ERP |
| --- | --- | --- | --- | --- |
| Hedef Kullanıcı | KOBİ'ler ve daha büyük işletmeler | Büyüyen işletmeler | KOBİ'ler | KOBİ odaklı bitirme projesi |
| Kapsam | Çok geniş ve modüler | Çok sayıda bulut uygulaması | Kapsamlı ERP | Temel ERP modülleri |
| Maliyet | Kullanıma bağlı | Abonelik tabanlı | Lisans/abonelik tabanlı | Düşük geliştirme maliyeti |
| Öğrenme Eğrisi | Orta/yüksek | Orta | Orta/yüksek | Daha sade |
| Akademik Görünürlük | Son kullanıcı ürünü | Son kullanıcı ürünü | Son kullanıcı ürünü | Kod, mimari ve veritabanı görülebilir |

Kovex ERP'nin amacı profesyonel ERP platformlarıyla doğrudan rekabet etmek değildir. Projenin değeri, temel ERP mantığını uygulanabilir, incelenebilir ve genişletilebilir bir akademik proje olarak göstermesidir.

---

## 7. Sistem Tasarımı

Sistem aşağıdaki ana modüller etrafında düzenlenmiştir:

- Dashboard
- Kimlik doğrulama ve yetkilendirme
- Müşteriler
- Tedarikçiler
- Ürünler
- Depolar
- Stok
- Teklifler
- Satış siparişleri
- Satış faturaları
- Satın alma siparişleri
- Satın alma faturaları
- Raporlar
- Planlama projeleri ve görevler
- Kullanıcılar ve izinler

Desteklenen roller aşağıdaki gibidir:

| Rol | Açıklama |
| --- | --- |
| Admin | Tam sistem erişimi ve yönetim yetkileri. |
| SysAdmin | Sistem yönetimi ve yapılandırma yetkileri. |
| Sales | Satış işlemlerine erişim. |
| Purchasing | Tedarikçi ve satın alma işlemlerine erişim. |
| Inventory | Ürün, depo ve stok işlemlerine erişim. |
| Accountant | Fatura ve finansal/raporlama alanlarına erişim. |
| Planner | Proje ve görev işlemlerine erişim. |
| User | Atanan izinlere göre temel erişim. |

---

## 8. Veritabanı Tasarımı

Veritabanı, varlık-ilişki modeli kullanılarak tasarlanmıştır. Temel varlıklar arasında kullanıcılar, müşteriler, tedarikçiler, ürünler, depolar, stok, teklifler, teklif kalemleri, siparişler, sipariş kalemleri, faturalar, fatura kalemleri, satın alma siparişleri, satın alma sipariş kalemleri, satın alma faturaları, projeler ve görevler bulunmaktadır.

ERD, iş kayıtlarının birbiriyle nasıl ilişkili olduğunu göstermektedir. Örneğin teklifler müşterilerle ilişkilidir, siparişler tekliflerden oluşturulabilir, faturalar siparişlerden oluşturulabilir, satın alma siparişleri tedarikçilerle bağlantılıdır ve stok kayıtları ürünleri depolarla ilişkilendirir.

**Şekil 1. ERD Veritabanı Diyagramı**

![ERD Veritabanı Diyagramı](../../diagrams/Kovex%20ERP%20-%20ERD%20Diagram.png)

---

## 9. Sistem Mimarisi

Kovex ERP katmanlı bir web uygulaması mimarisi kullanmaktadır:

| Katman | Teknolojiler / Bileşenler |
| --- | --- |
| Sunum Katmanı | React, Vite, TypeScript, Tailwind CSS |
| API İstemci Katmanı | Oluşturulan API istemcisi, tipli hook'lar, özel fetch wrapper |
| Backend Katmanı | Node.js, Express REST API |
| Sözleşme ve Doğrulama Katmanı | OpenAPI YAML, Orval, API validation package |
| Veri Erişim Katmanı | Drizzle ORM |
| Veritabanı Katmanı | PostgreSQL |
| Geliştirme Araçları | Docker, Docker Compose, Swagger UI, pnpm workspace |

**Şekil 2. Sistem Mimarisi Diyagramı**

![Sistem Mimarisi Diyagramı](../../diagrams/Kovex%20ERP%20-%20System%20Architecture.png)

---

## 10. Temel Sistem İş Akışları

### 10.1 Veri Akışı

Veri akış diyagramı satış, satın alma, envanter ve raporlar arasında bilginin nasıl hareket ettiğini göstermektedir. Satış işlemleri teklif, sipariş ve fatura oluşturur. Satın alma işlemleri satın alma siparişleri ve mal kabul kayıtları oluşturur. Envanter, satış ve satın alma işlemlerinden etkilenir. Raporlar bu modüllerden özet veriler toplar.

**Şekil 3. Veri Akış Diyagramı**

![Veri Akış Diyagramı](../../diagrams/Kovex%20ERP%20-%20Data%20Flow%20Diagram.png)

### 10.2 Kullanım Senaryosu Diyagramı

Kullanım senaryosu diyagramı temel aktörleri ve sistem işlevlerini göstermektedir. Admin kullanıcıları tam erişime sahipken çalışanlar atanmış izinlerine göre modüllere erişir.

**Şekil 4. Kullanım Senaryosu Diyagramı**

![Kullanım Senaryosu Diyagramı](../../diagrams/Kovex%20ERP%20-%20Use%20Case%20Diagram.png)

### 10.3 Sequence ve Activity Diyagramları

Projede önemli iş akışları için sequence ve activity diyagramları bulunmaktadır:

| İş Akışı | Diyagram Dosyaları |
| --- | --- |
| Tekliften Siparişe | `Kovex ERP - Quotation to Order Sequence Diagram.png`, `Kovex ERP - Quotation to Order Activity Diagram.png` |
| Siparişten Faturaya | `Kovex ERP - Order to Invoice Sequence Diagram.png`, `Kovex ERP - Order to Invoice Activity Diagram.png` |
| Satın Almadan Stoğa | `Kovex ERP - Purchase to Stock Sequence Diagram.png`, `Kovex ERP - Purchase to Stock Activity Diagram.png` |
| Giriş İşlemi | `Kovex ERP - Login Sequence Diagram.png`, `Kovex ERP - Login Activity Diagram.png` |

**Şekil 5. Tekliften Siparişe Sequence Diyagramı**

![Tekliften Siparişe Sequence Diyagramı](../../diagrams/Kovex%20ERP%20-%20Quotation%20to%20Order%20Sequence%20Diagram.png)

**Şekil 6. Siparişten Faturaya Sequence Diyagramı**

![Siparişten Faturaya Sequence Diyagramı](../../diagrams/Kovex%20ERP%20-%20Order%20to%20Invoice%20Sequence%20Diagram.png)

**Şekil 7. Satın Almadan Stoğa Sequence Diyagramı**

![Satın Almadan Stoğa Sequence Diyagramı](../../diagrams/Kovex%20ERP%20-%20Purchase%20to%20Stock%20Sequence%20Diagram.png)

**Şekil 8. Giriş Sequence Diyagramı**

![Giriş Sequence Diyagramı](../../diagrams/Kovex%20ERP%20-%20Login%20Sequence%20Diagram.png)

**Şekil 9. Tekliften Siparişe Activity Diyagramı**

![Tekliften Siparişe Activity Diyagramı](../../diagrams/Kovex%20ERP%20-%20Quotation%20to%20Order%20Activity%20Diagram.png)

**Şekil 10. Siparişten Faturaya Activity Diyagramı**

![Siparişten Faturaya Activity Diyagramı](../../diagrams/Kovex%20ERP%20-%20Order%20to%20Invoice%20Activity%20Diagram.png)

**Şekil 11. Satın Almadan Stoğa Activity Diyagramı**

![Satın Almadan Stoğa Activity Diyagramı](../../diagrams/Kovex%20ERP%20-%20Purchase%20to%20Stock%20Activity%20Diagram.png)

**Şekil 12. Giriş Activity Diyagramı**

![Giriş Activity Diyagramı](../../diagrams/Kovex%20ERP%20-%20Login%20Activity%20Diagram.png)

---

## 11. Uygulama Detayları

### 11.1 Teknoloji Yığını

| Alan | Teknoloji |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Stil | Tailwind CSS, UI bileşenleri |
| Backend | Node.js, Express |
| Veritabanı | PostgreSQL |
| ORM | Drizzle ORM |
| API Sözleşmesi | OpenAPI |
| API Dokümantasyonu | Swagger UI |
| API İstemci Üretimi | Orval |
| Geliştirme Çalışma Alanı | pnpm workspace |
| Konteynerleştirme | Docker, Docker Compose |

### 11.2 Frontend Uygulaması

Frontend React ve TypeScript kullanılarak geliştirilmiştir. Arayüzde yan menü, üst başlık, sayfa düzenleri, yeniden kullanılabilir veri tabloları, liste kontrolleri, formlar, diyalog pencereleri, durum etiketleri ve bildirim mesajları bulunmaktadır. Sistem, kullanıcı tercihini ve görsel erişilebilirliği desteklemek amacıyla koyu ve açık tema desteği sunmaktadır.

Kullanıcı arayüzü tasarımı, geliştirme sürecinden önce Stitch üzerinde tam UI ekranları olarak hazırlanmıştır. Bu çalışma görsel yönün, sayfa yapısının, boşlukların ve genel kullanıcı deneyiminin belirlenmesine katkı sağlamıştır.

### 11.3 Backend Uygulaması

Backend Node.js ve Express kullanılarak geliştirilmiştir. API; kimlik doğrulama, dashboard, müşteriler, tedarikçiler, ürünler, satış, satın alma, depolar, stok, raporlar, planlama ve kullanıcılar gibi route modüllerine ayrılmıştır.

### 11.4 API Sözleşmesi ve Doğrulama

Projede API sözleşmesini dokümante etmek için OpenAPI kullanılmaktadır. Swagger UI, API endpoint'lerini görüntülemek ve test etmek için kullanılabilir durumdadır. Oluşturulan API istemcisi ve doğrulama tipleri frontend ile backend arasındaki tutarlılığı korumaya yardımcı olur.

---

## 12. Sprint Planlaması ve Takım Çalışması

Kovex ERP'nin geliştirme süreci sprint tabanlı planlama yöntemiyle organize edilmiştir. Proje görevleri; dokümantasyon, analiz, diyagramlar, uygulama geliştirme, test ve bitirme projesi materyalleri gibi açık sprint bölümlerine ayrılmıştır. Bu yaklaşım, ekip çalışmasının düzenli şekilde takip edilmesine ve ilerlemenin daha kolay değerlendirilmesine katkı sağlamıştır.

Sprint görevlerinin kullanılması profesyonel proje yönetimini de desteklemiştir. Her görev belirli bir hedefe ve kabul kriterlerine sahip olacak şekilde tanımlanmıştır. Böylece bir sonraki aşamaya geçmeden önce tamamlanması gereken çalışmalar açıkça belirlenmiştir. Bu yöntem, projenin plansız bir geliştirme süreci yerine düzenli bir yazılım mühendisliği yaklaşımıyla yürütüldüğünü göstermektedir.

Sprint görev panosu, raporda ekip çalışması, planlama ve proje sürecindeki sürekli ilerlemenin kanıtı olarak sunulabilir.

**Şekil 13. Sprint Görev Panosu / Takım Çalışması Kanıtı**

> [GÖRSEL YER TUTUCU - Sprint görevleri veya görev panosu ekran görüntüsünü buraya ekleyiniz.]

---

## 13. Kullanıcı Arayüzü ve Ekran Görüntüleri

Aşağıdaki ekran görüntüleri final Word/PDF raporuna eklenmelidir.

### 13.1 Giriş Sayfası

> [GÖRSEL YER TUTUCU - Giriş sayfası ekran görüntüsünü buraya ekleyiniz.]

### 13.2 Dashboard

> [GÖRSEL YER TUTUCU - Dashboard ekran görüntüsünü buraya ekleyiniz.]

### 13.3 Müşteriler Sayfası

> [GÖRSEL YER TUTUCU - Müşteriler sayfası ekran görüntüsünü buraya ekleyiniz.]

### 13.4 Raporlar Sayfası

> [GÖRSEL YER TUTUCU - Raporlar sayfası ekran görüntüsünü buraya ekleyiniz.]

### 13.5 Swagger UI

> [GÖRSEL YER TUTUCU - Swagger UI ekran görüntüsünü buraya ekleyiniz.]

### 13.6 Docker Çalışan Konteynerler

> [GÖRSEL YER TUTUCU - Docker çalışan konteynerler ekran görüntüsünü buraya ekleyiniz.]

---

## 14. Docker ve Swagger UI

Docker ve Docker Compose, düzenli bir geliştirme ortamını desteklemek için projeye dahil edilmiştir. Docker, PostgreSQL gibi destekleyici servislerin tutarlı bir şekilde çalıştırılmasını sağlar. Bu durum farklı makineler arasındaki kurulum farklılıklarını azaltır ve projenin gösterimini kolaylaştırır.

Swagger UI, REST API endpoint'lerini dokümante etmek ve incelemek için kullanılmıştır. Geliştiriciler, değerlendiriciler ve komite üyeleri bu arayüz üzerinden mevcut endpoint'leri, istek parametrelerini, yanıt şemalarını ve API davranışını görebilir.

---

## 15. Test ve Doğrulama

Temel iş akışlarını ve kalite kontrollerini doğrulamak için manuel test senaryoları hazırlanmıştır.

| Test Adı | Beklenen Sonuç | Durum |
| --- | --- | --- |
| Geçerli kullanıcı ile giriş | Kullanıcı dashboard sayfasına başarıyla ulaşır. | PASS |
| Dashboard özetinin yüklenmesi | Dashboard özet içeriği görüntülenir. | PASS |
| Müşteri listesinde arama ve filtreleme | Müşteri tablosu arama metnine göre yanıt verir. | PASS |
| Ürün oluşturma doğrulaması | Zorunlu alan doğrulaması gösterilir. | PASS |
| Satış raporu tarih filtresi | Rapor seçilen filtrelere göre güncellenir. | PASS |
| Envanter raporu dışa aktarma | İstenen rapor dosyası oluşturulur. | PASS |
| Dil değiştirme | Arayüz etiketleri seçilen dile göre değişir. | PASS |
| Tema değiştirme | Açık/koyu tema sayfa durumu kaybolmadan değişir. | PASS |
| Yetkisiz rota koruması | Kısıtlı erişim engellenir. | PASS |
| Üretim build doğrulaması | Build doğrulaması başarıyla tamamlanır. | PASS |

Testler; kimlik doğrulama, dashboard görünürlüğü, liste kontrolleri, form doğrulama, raporlar, dışa aktarma, yerelleştirme, tema davranışı, yetkilendirme ve build hazırlığını kapsamaktadır.

---

## 16. Sonuç

Kovex ERP; satış, satın alma, envanter, raporlama, planlama, kimlik doğrulama, yetkilendirme ve kullanıcı yönetimi modüllerini içeren küçük işletme odaklı bir ERP sistemini başarıyla ortaya koymaktadır. Proje, KOBİ'lerin karşılaştığı gerçek bir problemi, yani dağınık iş verileri ve kopuk günlük iş akışlarını ele almaktadır.

Sistem; akademik dokümantasyon, gereksinim analizi, fizibilite çalışması, mevcut sistemlerle karşılaştırma, ERD diyagramı, sistem mimarisi diyagramı, veri akış diyagramı, kullanım senaryosu diyagramı, sequence diyagramları, activity diyagramları, Docker desteği, Swagger UI, koyu/açık tema ve Stitch üzerinde hazırlanmış UI tasarımını içermektedir.

Bir bitirme projesi olarak Kovex ERP; bir iş problemini analiz etme, uygun bir yazılım çözümü tasarlama, full-stack bir sistemi uygulama, mimariyi dokümante etme ve temel iş akışlarını testlerle doğrulama yeteneğini göstermektedir.
