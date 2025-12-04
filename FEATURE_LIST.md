# Feature List

## Tamamlanan
- [x] Tekrarlayan özelliği maaşda da olmalı
- [x] Kredi Kartına Ata var ama kredi kartı nerden oluşturuluyor kısmı eksik
    - burası sanırım user yaratıldığında otomatik olarak yaratılıyor bu özellik kalsın
    - ama bir userın birden fazla kredi kartı olabilir
    - o yüzden kredi kartlarım diye bir ekran olmalı ve ordan kart eklenip çıkartılabilmeli
    - kredi kartlarım ekranına ayarlardan gitsin
- [x] Kredi kartının hesap kesim tarihi olmalı. Default olarak ayın 1 i gelmeli ama değiştirilebilmeli.
    - hesap kesim tarihinden 10 gün sonrası kredi kartının son ödeme günü olmalı.
    - ✅ DateTimePicker ile tarih seçimi eklendi (iOS spinner, Android native picker)
- [x] Raporlar ekranında kişiye göre dediğimde tutarlar 0 geliyor. düzelt
- [x] Dark modea geçince hala beyaz olan yerler var. bu içerik tüm sayfayı kaplamadığında gözleniyor. düzelt
- [x] Kredi kartı son ödeme günü için push notification (bir gün önce ve son ödeme gününde)
    - ✅ expo-notifications paketi eklendi
    - ✅ Notification servisi oluşturuldu (src/services/notification.service.ts)
    - ✅ Kart oluşturma/güncelleme sırasında bildirimler schedule ediliyor
    - ✅ Kart silindiğinde bildirimler iptal ediliyor
    - ✅ Son ödeme günü ve 1 gün önce bildirim gönderiliyor (saat 10:00)

- [x] Kredilerim ekranı
    - ✅ Backend'de Loan modeli oluşturuldu (taksit takibi, faiz oranı)
    - ✅ CRUD API endpoint'leri (/api/loans)
    - ✅ Taksit ödeme endpoint'i (/api/loans/:id/pay)
    - ✅ Kredilerim ekranı (liste, ekleme, düzenleme, silme)
    - ✅ Taksit ilerleme çubuğu
    - ✅ Taksit ödeme butonu
    - ✅ Ayarlar ekranından erişim
    - ✅ İlk ve son ödeme tarihi date picker ile seçiliyor
    - ✅ Toplam taksit sayısı tarih aralığından otomatik hesaplanıyor
    - ✅ Faiz oranı çekilen ve toplam tutardan otomatik hesaplanıyor
    - ✅ Taksit ödendiğinde otomatik gider transaction'ı oluşuyor
    - ✅ "Kredi Taksiti" kategorisi ile işlemler listesinde görünüyor
    - ✅ Kategori ekle, düzenle, sil eksik
    - ✅ Kategorilerin yanında hem türkçe hem ingilizce isim gösterilmemeli, seçili dile göre gösterilmeli

## Yapılacak
- [ ] İşlemler ekranında o işlemi kimin yaptığı belli değil !!
- [ ] Ana ekrandaki gelir ve giderlerde user bazlı bir kırılıma ihtiyaç var. yani 2 kişi var diyelim. bunlardan biri 4x kazanmış ama 2x harcamış. diğeri de 2x kazanmış ama x harcamış. bunları kırılım olarak göstermeliyiz. Fakat burda eğer bir harcama ortak olarak işaretlendiyse her iki tarafa da yansımalı bunu unutma!
- [ ] Aynı sessiondaki kişiler arasında para transferi yapılabilmeli. Bunu işlemlerde göstermeliyiz, raporlara yansımalı aynı zamanda gelir gider tablolarına da yansımalı. Aslında total para değişmiyor ama aynı ev içindeki kişiler bunu ui'a baktığında kolayca anlayabilmeli.
- [ ] Raporlarda datepicker olmalı. Range seçilmeli ve o seçili range içindeki alan göz önünde bulundurulmalı.
    - initial range mevcut ayın ilk ve son gününü kapsamalı
- [ ] Raporlarda şu an piechart yok? ekle
- [ ] Üyeler sayfasında o evdeki tüm üyeler gözükmeli. ilk sırada login olan kullanıcı olmalı
- [ ] İşlem update ekranında tekrarlayan ve ortak harcamanın solunda iconu eksik
- [ ] Para birimi değiştirilebilmeli. eur, usd, try
- [ ] Kategori eklerken simgelerde son simge + olmalı ve tıklayınca emojiler açılmalı
- [ ] Bu uygulamaya bir de todo listesi ekle. Checklist şeklinde olsun. Aynı ev içinde 2 kişi var diyelim mesela. Ben yeni bir item eklediğimde (sadece ekleme yapıldığında) karşı tarafa notification gitsin. {userName} {itemName}'i {listName} e ekledi. şeklinde. Yani liste birden fazla olabilir liste eklerken önce liste adı eklemeli sonra içinde her alt satıra geçtiğinde checklist item olmalı. 
- [ ] Maaşa brüt net hesaplama özelliği eklememiz lazım
    - onun için bir api service bulmamız lazım context 7 ile, bulamazsak custom backend'e kendimiz eklemeliyiz

