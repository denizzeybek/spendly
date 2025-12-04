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
    - ✅ Backend'de Loan modeli oluşturuldu (taksit takibi, faiz oranı, notlar)
    - ✅ CRUD API endpoint'leri (/api/loans)
    - ✅ Taksit ödeme endpoint'i (/api/loans/:id/pay)
    - ✅ Kredilerim ekranı (liste, ekleme, düzenleme, silme)
    - ✅ Taksit ilerleme çubuğu
    - ✅ Taksit ödeme butonu
    - ✅ Ayarlar ekranından erişim

## Yapılacak
- [ ] Kategori ekle, düzenle, sil eksik
- [ ] Kategorilerin yanında hem türkçe hem ingilizce isim gösterilmemeli, seçili dile göre gösterilmeli
- [ ] Raporlarda datepicker olmalı. Range seçilmeli ve o seçili range içindeki alan göz önünde bulundurulmalı.
    - initial range mevcut ayın ilk ve son gününü kapsamalı
- [ ] Raporlarda şu an piechart yok? ekle
- [ ] Maaşa brüt net hesaplama özelliği eklememiz lazım
    - onun için bir api service bulmamız lazım context 7 ile, bulamazsak custom backend'e kendimiz eklemeliyiz
