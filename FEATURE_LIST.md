# Feature List

## Tamamlanan
- [x] Tekrarlayan özelliği maaşda da olmalı
- [x] Kredi Kartına Ata var ama kredi kartı nerden oluşturuluyor kısmı eksik
    - burası sanırım user yaratıldığında otomatik olarak yaratılıyor bu özellik kalsın
    - ama bir userın birden fazla kredi kartı olabilir
    - o yüzden kredi kartlarım diye bir ekran olmalı ve ordan kart eklenip çıkartılabilmeli
    - kredi kartlarım ekranına ayarlardan gitsin

## Yapılacak
- [ ] Kredi kartının hesap kesim tarihi olmalı. Default olarak ayın 1 i gelmeli ama değiştirilebilmeli.
    - hesap kesim tarihinden 10 gün sonrası kredi kartının son ödeme günü olmalı. Bir gün önce ve son ödeme gününde notification yollamalı.
- [ ] Kredilerim ekranı. Burda gider olarak kategori kredi seçildiyse o gözükmeli. Bu düzenli bir kredi olabilir. Kredi yaratılırken        başlangıç, bitiş tarihi olmalı. Mesela ocak 1 de kredi başladı. ilk ödemesi şubat 1, son ödemesi temmuz 1. biz mart ayında ödemeyi yaptıysak 2/6 şeklinde bir gösterime sahip olmalı ki kaç taksitimiz kaldığını bilelim. Ayrıca kredi öderken ne kadar çektiğimizi, ne kadar geriye ödeyeceğimizi de sormalı.
- [ ] Kategori ekle, düzenle, sil eksik
- [ ] Kategorilerin yanında hem türkçe hem ingilizce isim gösterilmemeli, seçili dile göre gösterilmeli
- [ ] Raporlarda datepicker olmalı. Range seçilmeli ve o seçili range içindeki alan göz önünde bulundurulmalı.
    - initial range mevcut ayın ilk ve son gününü kapsamalı
- [ ] Raporlarda şu an piechart yok? ekle
- [ ] Raporlar ekranında kişiye göre dediğimde tutarlar 0 geliyor. düzelt
- [ ] Dark modea geçince hala beyaz olan yerler var. bu içerik tüm sayfayı kaplamadığında gözleniyor. düzelt
- [ ] Maaşa brüt net hesaplama özelliği eklememiz lazım
    - onun için bir api service bulmamız lazım context 7 ile, bulamazsak custom backend'e kendimiz eklemeliyiz
