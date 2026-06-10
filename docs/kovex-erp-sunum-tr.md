# Kovex ERP Sunum Taslağı

Bu belge, Kovex ERP projesini projeye yabancı olan bir dinleyiciye veya değerlendirme komitesine açık, düzenli ve anlaşılır biçimde anlatmak için hazırlanmıştır. Slayt içerikleri kısa tutulmuştur; her slaydın altında sunum sırasında kullanılabilecek konuşma notları yer almaktadır.

---

## Slayt 1 - Kapak

**Kovex ERP**  
Küçük ve Orta Ölçekli İşletmeler İçin Web Tabanlı ERP Sistemi

**Alt başlık:** Satış, satın alma, envanter, raporlama ve planlama süreçlerini tek sistemde birleştiren iş yönetimi uygulaması.

**Görsel önerisi:** Kovex ERP logosu veya dashboard ekran görüntüsü.

**Konuşma notu:**  
Bu projede küçük ve orta ölçekli işletmelerin günlük operasyonlarını daha düzenli yönetebilmesi için sade, anlaşılır ve modüler bir ERP sistemi geliştirilmiştir. Sistem, farklı araçlarda dağınık şekilde yürütülen satış, stok, satın alma ve raporlama süreçlerini tek bir web uygulamasında toplamayı amaçlamaktadır.

---

## Slayt 2 - Projenin Temel Amacı

- Günlük işletme süreçlerini tek merkezden yönetmek
- Müşteri, tedarikçi, ürün, sipariş, fatura ve stok kayıtlarını bir araya getirmek
- Dağınık veri girişini azaltmak
- İşletme sahibine ve çalışanlara daha net bir operasyon görünümü sunmak
- Akademik olarak uçtan uca bir full-stack sistem geliştirme sürecini göstermek

**Konuşma notu:**  
Kovex ERP'nin temel amacı, küçük işletmelerin sık kullandığı süreçleri karmaşık olmayan bir yapıda birleştirmektir. Bu proje yalnızca ekrandan oluşan bir prototip değildir; frontend, backend, veritabanı, API sözleşmesi, doğrulama, raporlama ve dokümantasyon katmanlarıyla birlikte ele alınmıştır.

---

## Slayt 3 - Problem Tanımı

Küçük işletmelerde sık görülen problemler:

- Satış kayıtlarının Excel, kâğıt veya mesajlaşma uygulamalarında tutulması
- Stok bilgisinin güncel olmaması
- Sipariş, fatura ve satın alma süreçlerinin birbirinden kopuk ilerlemesi
- Aynı verinin birden fazla kez girilmesi
- Raporlama ve karar alma süreçlerinin zorlaşması

**Konuşma notu:**  
KOBİ'lerde en büyük sorunlardan biri verinin tek bir yerde toplanmamasıdır. Örneğin satış ekibi ürün sattığında stoktan düşülmesi gerekir; satın alma yapıldığında ise stok artmalıdır. Bu işlemler manuel takip edildiğinde hata riski yükselir. Kovex ERP bu problemi merkezi bir veri yapısıyla çözmeyi hedeflemektedir.

---

## Slayt 4 - Önerilen Çözüm

Kovex ERP şu modülleri tek uygulamada birleştirir:

- Dashboard
- Satış yönetimi
- Satın alma yönetimi
- Envanter ve stok yönetimi
- Müşteri ve tedarikçi yönetimi
- Raporlar
- Planlama, proje ve görev takibi
- Kullanıcı ve yetki yönetimi

**Konuşma notu:**  
Sistemin çözüm yaklaşımı, işletmenin temel süreçlerini birbirine bağlamaktır. Satış modülü, müşteri ve stok verileriyle ilişkilidir. Satın alma modülü, tedarikçi ve envanter süreçlerini etkiler. Raporlar ise bu modüllerden gelen verileri özetleyerek yönetime karar desteği sağlar.

---

## Slayt 5 - Hedef Kullanıcılar

- 10-50 çalışanı olan küçük ve orta ölçekli işletmeler
- Perakende işletmeleri
- Dağıtım ve satış yapan firmalar
- Hizmet ve ürün operasyonlarını birlikte yürüten şirketler
- Sistemi yönetecek admin ve yetkili çalışanlar

**Konuşma notu:**  
Kovex ERP, büyük ve karmaşık ERP sistemlerinin yerine geçmeyi hedeflemez. Proje daha çok temel operasyonel süreçlerini düzenlemek isteyen küçük işletmelere odaklanır. Bu nedenle arayüz ve modül kapsamı mümkün olduğunca sade tutulmuştur.

---

## Slayt 6 - Sistem Mimarisi

**Katmanlar:**

- Frontend: React, Vite, TypeScript
- API istemcisi: OpenAPI'den üretilen tipli istemci
- Backend: Node.js ve Express REST API
- Doğrulama: OpenAPI tabanlı validation paketi
- Veri erişimi: Drizzle ORM
- Veritabanı: PostgreSQL

**Görsel önerisi:** `docs/diagrams/Kovex ERP - System Architecture.png`

**Konuşma notu:**  
Proje monorepo yapısıyla geliştirilmiştir. Frontend, backend, veritabanı, API sözleşmesi, API istemcisi ve doğrulama paketleri ayrı klasörlerde tutulur. Bu yapı bakım yapılabilirliği artırır ve frontend ile backend arasındaki veri sözleşmesini daha güvenilir hâle getirir.

---

## Slayt 7 - Kod ve Paket Yapısı

- `packages/front`: Kullanıcı arayüzü
- `packages/back`: Express REST API
- `packages/database`: Drizzle şemaları ve veritabanı katmanı
- `packages/api-contract`: OpenAPI sözleşmesi
- `packages/api-client`: Frontend için üretilen API istemcisi
- `packages/api-validation`: Backend doğrulama tipleri
- `docs`: Raporlar, diyagramlar ve proje dokümantasyonu

**Konuşma notu:**  
Bu ayrım, projeyi yalnızca çalışan bir uygulama olarak değil, düzenli bir yazılım mühendisliği ürünü olarak göstermektedir. Örneğin API sözleşmesi değiştiğinde hem frontend istemcisi hem de backend doğrulama tipleri aynı kaynaktan üretilebilir.

---

## Slayt 8 - Ana Modüller

| Modül | Amaç |
| --- | --- |
| Dashboard | Satış, satın alma, stok ve uyarı özetlerini göstermek |
| Satış | Müşteri, teklif, sipariş ve fatura süreçlerini yönetmek |
| Satın Alma | Tedarikçi, satın alma siparişi ve satın alma faturalarını yönetmek |
| Envanter | Ürün, depo ve stok seviyelerini takip etmek |
| Raporlar | Satış, satın alma ve envanter verilerini analiz etmek |
| Planlama | Proje ve görev süreçlerini takip etmek |
| Ayarlar | Kullanıcı ve yetki yönetimini sağlamak |

**Konuşma notu:**  
Modüller birbirinden bağımsız sayfalar gibi görünse de aslında aynı iş sürecinin parçalarıdır. Örneğin satış faturası oluşturulduğunda stok etkilenir; satın alma faturası kaydedildiğinde stok artar; raporlar ise bu hareketleri özetler.

---

## Slayt 9 - Temel İş Akışı: Satış Süreci

**Satış akışı:**

1. Müşteri kaydı oluşturulur.
2. Müşteri için teklif hazırlanır.
3. Teklif kabul edilirse siparişe dönüştürülür.
4. Sipariş faturaya dönüştürülür.
5. Satılan ürün miktarı stoktan düşer.
6. Dashboard ve satış raporları güncellenir.

**Görsel önerisi:** `docs/diagrams/Kovex ERP - Quotation to Order Activity Diagram.png` veya `docs/diagrams/Kovex ERP - Order to Invoice Activity Diagram.png`

**Konuşma notu:**  
Satış süreci, sistemdeki en önemli uçtan uca iş akışlarından biridir. Kullanıcı önce müşteriyi seçer, teklif oluşturur, sonra bunu siparişe ve faturaya dönüştürür. Bu sırada sistem stok ve rapor tarafında gerekli güncellemeleri yapar.

---

## Slayt 10 - Temel İş Akışı: Satın Alma ve Stok

**Satın alma akışı:**

1. Tedarikçi kaydı oluşturulur.
2. Satın alma siparişi hazırlanır.
3. Ürünler teslim alındığında satın alma faturası kaydedilir.
4. İlgili ürünlerin stok miktarı artar.
5. Satın alma raporu ve dashboard özetleri güncellenir.

**Görsel önerisi:** `docs/diagrams/Kovex ERP - Purchase to Stock Activity Diagram.png`

**Konuşma notu:**  
Satın alma süreci, satışın ters yönünde stok etkisi oluşturur. İşletme ürün satın aldığında sistem stok miktarını artırır. Böylece satış ve satın alma süreçleri aynı envanter verisi üzerinde tutarlı şekilde çalışır.

---

## Slayt 11 - Gerçek Hayat Örneği: Mobilya Üretim Fabrikası

**Senaryo:**  
Küçük ölçekli bir mobilya üretim fabrikası düşünelim. Fabrika; çalışma masası, sandalye ve dolap üretip kurumsal müşterilere satmaktadır. Üretimde MDF levha, metal ayak, vida, menteşe ve ambalaj malzemesi kullanılmaktadır. Bu örnek, gerçek hayatta bir üretim işletmesinin satış, satın alma, stok, raporlama ve planlama süreçlerini nasıl yönettiğini göstermek için hazırlanmıştır.

**İş durumu:**  
Bir okul, fabrikadan 40 adet çalışma masası satın almak ister. Fabrika siparişi karşılamak için mevcut stokları kontrol etmeli, eksik ham madde varsa satın alma yapmalı, üretimi planlamalı, satış faturasını oluşturmalı ve yönetime rapor sunmalıdır.

**Adımlar:**

1. Satış kullanıcısı okulun müşteri kaydını kontrol eder veya yeni müşteri kaydı oluşturur.
2. 40 adet çalışma masası için teklif hazırlanır.
3. Müşteri teklifi onayladığında teklif satış siparişine dönüştürülür.
4. Envanter kullanıcısı çalışma masası ve gerekli malzemelerin stok seviyesini kontrol eder.
5. MDF levha ve metal ayak stokları yetersizse düşük stok uyarısı oluşur.
6. Satın alma kullanıcısı ilgili tedarikçilere satın alma siparişi açar.
7. Malzemeler teslim alınınca satın alma faturası kaydedilir ve stok miktarı artar.
8. Planlama kullanıcısı üretim işini proje/görev olarak takip eder.
9. Ürünler teslim edildiğinde satış faturası oluşturulur ve satılan ürün stoğu azalır.
10. Yönetici dashboard, satış raporu, satın alma raporu ve envanter raporundan sürecin sonucunu izler.

**Konuşma notu:**  
Bu örnek, projenin tüm süreçlerini gerçek hayattaki bir fabrika iş akışı üzerinden açıklar. Bir okuldan gelen masa siparişi yalnızca satış kaydı oluşturmaz; aynı zamanda stok kontrolünü, eksik malzeme satın alımını, üretim planlamasını, faturalandırmayı ve raporlamayı da tetikler. Böylece ERP mantığı tek bir sipariş üzerinden anlaşılır hâle gelir.

---

## Slayt 12 - Fabrika Senaryosunun Modüllere Etkisi

| İşlem | Etkilenen Modül | Sonuç |
| --- | --- | --- |
| Okulun müşteri olarak kaydedilmesi | Satış / Müşteriler | Müşteri bilgisi merkezi sistemde tutulur |
| 40 masa için teklif hazırlanması | Satış / Teklifler | Fiyat, miktar ve ürün bilgileri kayıt altına alınır |
| Teklifin siparişe dönüştürülmesi | Satış / Siparişler | Onaylanmış satış süreci başlar |
| MDF ve metal ayak stokunun kontrol edilmesi | Envanter / Stok | Üretim için yeterli malzeme olup olmadığı görülür |
| Eksik malzeme için satın alma siparişi açılması | Satın Alma / Tedarikçiler | Tedarik süreci başlatılır |
| Malzeme teslimi ve satın alma faturası | Satın Alma / Envanter | Ham madde stoğu artar |
| Üretim işinin görev olarak takip edilmesi | Planlama | Üretim süreci izlenebilir hâle gelir |
| Ürün teslimi ve satış faturası | Satış / Faturalar | Satış resmî kayıt hâline gelir ve ürün stoğu azalır |
| Sonuçların dashboard ve raporlarda izlenmesi | Dashboard / Raporlar | Yönetim satış, satın alma ve stok durumunu görür |

**Konuşma notu:**  
Bu tablo, fabrikanın farklı departmanlarının aynı veri üzerinden nasıl çalıştığını gösterir. Satış ekibi müşteri ve teklif sürecini yönetirken, envanter ekibi stok durumunu kontrol eder, satın alma ekibi eksik malzemeyi tedarik eder, planlama ekibi üretimi takip eder ve yönetici tüm süreci raporlar üzerinden izler.

---

## Slayt 13 - Raporlama ve Dashboard

Dashboard ve raporlar şu bilgileri özetler:

- Toplam satış ve satın alma durumu
- Envanter ve düşük stok uyarıları
- En çok satılan ürünler
- Öne çıkan müşteriler ve tedarikçiler
- Tarih aralığına göre satış, satın alma ve envanter raporları
- PDF veya Excel formatında dışa aktarma desteği

**Görsel önerisi:** Dashboard ve envanter raporu ekran görüntüleri.

**Konuşma notu:**  
Raporlama modülü, sistemdeki operasyonel veriyi karar destek bilgisine dönüştürür. Kullanıcı yalnızca tek tek kayıtları görmekle kalmaz; işletmenin genel durumunu özet olarak da izleyebilir.

---

## Slayt 14 - Güvenlik, Yetkilendirme ve Kullanılabilirlik

- Kullanıcı girişi ve oturum yönetimi
- Rol tabanlı erişim kontrolü
- Yetkisiz sayfalara erişimin engellenmesi
- Form doğrulama ve kullanıcı geri bildirimleri
- Türkçe ve İngilizce dil desteği
- Açık ve koyu tema desteği
- Arama, sıralama, filtreleme ve liste limit kontrolleri

**Konuşma notu:**  
Bir ERP sisteminde güvenlik ve kullanılabilirlik önemlidir. Her kullanıcının tüm bilgilere erişmesi doğru değildir. Bu nedenle sistemde kullanıcı rolleri ve yetki kontrolleri vardır. Ayrıca arayüz, günlük kullanımda anlaşılır olacak şekilde tasarlanmıştır.

---

## Slayt 15 - Test ve Doğrulama

Doğrulanan temel alanlar:

- Geçerli kullanıcı ile giriş
- Dashboard verilerinin yüklenmesi
- Müşteri listesinde arama ve filtreleme
- Ürün formu doğrulaması
- Satış raporu tarih filtresi
- Envanter raporu dışa aktarma
- Dil ve tema değiştirme
- Yetkisiz rota koruması
- Üretim build doğrulaması

**Konuşma notu:**  
Projenin temel işlevleri manuel test senaryolarıyla doğrulanmıştır. Bu testler, sistemin yalnızca geliştirildiğini değil, temel kullanıcı akışlarının kontrol edildiğini de göstermektedir.

---

## Slayt 16 - Teknolojik Katkılar

- TypeScript ile tip güvenliği
- Monorepo ile düzenli proje yapısı
- OpenAPI ile API sözleşmesi
- Orval ile API istemcisi ve doğrulama tiplerinin üretilmesi
- Drizzle ORM ile tipli veritabanı katmanı
- Swagger UI ile API dokümantasyonu
- Docker ve Docker Compose ile kurulum desteği
- Render ve Supabase ile canlı dağıtım yaklaşımı

**Konuşma notu:**  
Bu proje, yazılım mühendisliği açısından birçok modern uygulamayı bir araya getirir. Özellikle API sözleşmesinden istemci ve doğrulama paketlerinin üretilmesi, frontend ile backend arasındaki uyumu güçlendirir.

---

## Slayt 17 - Sınırlılıklar

Bu proje şu alanları kapsam dışı bırakmıştır:

- Gelişmiş muhasebe yönetimi
- İnsan kaynakları süreçleri
- Yapay zekâ tabanlı tahminleme
- Gelişmiş finansal analiz
- Mobil uygulama
- Çok şubeli karmaşık kurumsal yapı

**Konuşma notu:**  
Projenin kapsamı bilinçli olarak sınırlı tutulmuştur. Amaç, çok büyük bir ERP sisteminin tamamını yapmak değil; temel ERP mantığını çalışan, anlaşılır ve genişletilebilir bir sistem üzerinden göstermektir.

---

## Slayt 18 - Gelecek Geliştirmeler

- Muhasebe modülünün eklenmesi
- Bildirim sistemi
- Mobil uyumun geliştirilmesi veya mobil uygulama
- Daha gelişmiş grafik ve analiz ekranları
- Barkod veya QR kod destekli stok işlemleri
- Daha ayrıntılı rol ve izin yönetimi

**Konuşma notu:**  
Kovex ERP modüler bir yapıya sahip olduğu için gelecekte yeni modüller eklenebilir. Özellikle muhasebe, bildirim ve mobil kullanım gibi alanlar sistemi gerçek işletme kullanımına daha da yaklaştırabilir.

---

## Slayt 19 - Sonuç

Kovex ERP:

- KOBİ'lerin dağınık iş süreçleri problemine odaklanır.
- Satış, satın alma, envanter, raporlama ve planlama süreçlerini tek sistemde toplar.
- Modern full-stack teknolojilerle geliştirilmiştir.
- API, veritabanı, arayüz, doğrulama, dokümantasyon ve test süreçlerini kapsar.
- Akademik olarak uçtan uca bir yazılım geliştirme sürecini göstermektedir.

**Konuşma notu:**  
Sonuç olarak Kovex ERP, küçük işletmeler için sadeleştirilmiş bir ERP yaklaşımı sunmaktadır. Proje; analizden tasarıma, veritabanından API'ye, arayüzden raporlamaya kadar bütünlüklü bir yazılım geliştirme sürecinin uygulanmış örneğidir.

---

## Komiteye Anlatım İçin Kısa Demo Akışı

Sunumdan sonra uygulama gösterilecekse şu sıra izlenebilir:

1. Giriş ekranı açılır ve kullanıcı sisteme giriş yapar.
2. Dashboard ekranında genel özetler gösterilir.
3. Müşteriler sayfasında örnek bir müşteri kaydı gösterilir.
4. Teklifler sayfasında müşteri için teklif oluşturma mantığı anlatılır.
5. Sipariş ve fatura adımları üzerinden satışın tamamlandığı açıklanır.
6. Stok sayfasında satış sonrası stok azalması vurgulanır.
7. Satın alma tarafında tedarikçi ve satın alma siparişi akışı gösterilir.
8. Satın alma sonrası stok artışı açıklanır.
9. Raporlar ekranında satış, satın alma ve envanter özetleri gösterilir.
10. Swagger UI üzerinden API'nin dokümante edildiği belirtilir.

**Demo anlatım cümlesi:**  
"Bu örnekte küçük bir mobilya fabrikasına gelen 40 adet çalışma masası siparişini takip ediyoruz. Sistem önce müşteriyi ve teklifi kaydediyor, sonra siparişi ve faturayı oluşturuyor. Aynı süreçte stok kontrol ediliyor, eksik MDF levha ve metal ayak için satın alma yapılıyor, malzemeler teslim alındığında stok artıyor ve üretim görevi planlama modülünden izleniyor. Son aşamada yönetici satış, satın alma, envanter ve dashboard ekranlarından tüm süreci tek veri kaynağı üzerinden takip edebiliyor."

---

## Sunumda Kullanılabilecek Kısa Açılış Metni

Merhaba, bugün sizlere Kovex ERP projesini sunacağım. Kovex ERP, küçük ve orta ölçekli işletmelerin günlük satış, satın alma, envanter, raporlama ve planlama süreçlerini tek bir web uygulaması üzerinden yönetmesini amaçlayan bir kurumsal kaynak planlama sistemidir. Projede temel amaç, Excel, kâğıt kayıtlar ve birbirinden kopuk araçlar yerine merkezi, izlenebilir ve kullanıcı dostu bir yapı sunmaktır.

---

## Sunumda Kullanılabilecek Kısa Kapanış Metni

Özetle Kovex ERP, küçük işletmelerin temel operasyonlarını daha düzenli yönetebilmesi için geliştirilen modüler bir ERP sistemidir. Proje; problem analizi, sistem tasarımı, veritabanı modelleme, API geliştirme, frontend uygulaması, raporlama, test ve dokümantasyon aşamalarını bir araya getirmektedir. Bu yönüyle hem gerçek bir işletme ihtiyacına çözüm sunmakta hem de yazılım mühendisliği sürecini uçtan uca göstermektedir. Teşekkür ederim.
