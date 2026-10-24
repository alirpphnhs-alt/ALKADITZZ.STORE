/* ============================================================
   APPALKADITZ — script.js
   Fitur:
   1. Jam & tanggal real-time
   2. Pemilihan durasi + update harga
   3. Kirim pesan order ke WhatsApp
   4. Toast notifikasi
   5. Animasi muncul saat scroll
   6. Tahun otomatis di footer
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     KONFIGURASI UTAMA
     Ubah nomor WhatsApp di sini jika sewaktu-waktu berubah.
     Format: kode negara tanpa "+" dan tanpa spasi/tanda hubung.
     ---------------------------------------------------------- */
  var WA_NUMBER = '6285142276587';

  /* ==========================================================
     1. JAM & TANGGAL REAL-TIME
     ========================================================== */
  var elTime = document.getElementById('clockTime');
  var elDate = document.getElementById('clockDate');

  var NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var NAMA_BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  function duaDigit(angka) {
    return angka < 10 ? '0' + angka : String(angka);
  }

  function perbaruiWaktu() {
    var sekarang = new Date();

    if (elTime) {
      elTime.textContent =
        duaDigit(sekarang.getHours()) + ':' +
        duaDigit(sekarang.getMinutes()) + ':' +
        duaDigit(sekarang.getSeconds());
    }

    if (elDate) {
      elDate.textContent =
        NAMA_HARI[sekarang.getDay()] + ', ' +
        sekarang.getDate() + ' ' +
        NAMA_BULAN[sekarang.getMonth()] + ' ' +
        sekarang.getFullYear();
    }
  }

  perbaruiWaktu();
  setInterval(perbaruiWaktu, 1000);

  /* ==========================================================
     2. FORMAT RUPIAH
     ========================================================== */
  function rupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  }

  /* ==========================================================
     3. TOAST NOTIFIKASI
     ========================================================== */
  var elToast = document.getElementById('toast');
  var timerToast = null;

  function tampilkanToast(pesan) {
    if (!elToast) return;

    elToast.textContent = pesan;
    elToast.classList.add('show');

    clearTimeout(timerToast);
    timerToast = setTimeout(function () {
      elToast.classList.remove('show');
    }, 2600);
  }

  /* ==========================================================
     4. PEMILIHAN DURASI PADA SETIAP KARTU
     ========================================================== */
  var semuaKartu = document.querySelectorAll('.card');

  semuaKartu.forEach(function (kartu) {
    var daftarChip = kartu.querySelectorAll('.chip');
    var elTotal = kartu.querySelector('.card-total');

    daftarChip.forEach(function (chip) {
      chip.addEventListener('click', function () {
        // Hapus status aktif dari semua chip di kartu ini
        daftarChip.forEach(function (c) {
          c.classList.remove('is-active');
          c.setAttribute('aria-pressed', 'false');
        });

        // Tandai chip yang dipilih
        chip.classList.add('is-active');
        chip.setAttribute('aria-pressed', 'true');

        // Perbarui tampilan total harga
        if (elTotal) {
          elTotal.textContent = rupiah(chip.dataset.price);
        }
      });

      // Set status awal untuk aksesibilitas
      chip.setAttribute('aria-pressed', chip.classList.contains('is-active') ? 'true' : 'false');
    });
  });

  /* ==========================================================
     5. TOMBOL PESAN → WHATSAPP
     Format pesan:
     "Halo Kak, Saya sudah order [Nama Barang] — [Durasi] seharga Rp [Harga]"
     ========================================================== */
  var semuaTombolPesan = document.querySelectorAll('.btn-order');

  semuaTombolPesan.forEach(function (tombol) {
    tombol.addEventListener('click', function () {
      var kartu = tombol.closest('.card');
      if (!kartu) return;

      var namaProduk = kartu.dataset.product || 'Produk';
      var chipAktif = kartu.querySelector('.chip.is-active');

      if (!chipAktif) {
        tampilkanToast('Silakan pilih durasi terlebih dahulu.');
        return;
      }

      var durasi = chipAktif.dataset.duration;
      var harga = rupiah(chipAktif.dataset.price);

      // Susun pesan sesuai format yang diminta
      var pesan =
        'Halo Kak, Saya sudah order ' + namaProduk +
        ' — ' + durasi +
        ' seharga ' + harga;

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(pesan);

      // Buka WhatsApp di tab baru
      window.open(url, '_blank', 'noopener');

      tampilkanToast('Membuka WhatsApp… ' + namaProduk + ' — ' + durasi);
    });
  });

  /* ==========================================================
     6. ANIMASI MUNCUL SAAT SCROLL (ringan, pakai IntersectionObserver)
     ========================================================== */
  var elemenAnimasi = document.querySelectorAll(
    '.card, .step, .pay-card, .section-head'
  );

  if ('IntersectionObserver' in window && elemenAnimasi.length) {
    // Tambahkan class .reveal lewat JS agar konten tetap tampil jika JS mati
    elemenAnimasi.forEach(function (el) {
      el.classList.add('reveal');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elemenAnimasi.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================
     7. TAHUN OTOMATIS DI FOOTER
     ========================================================== */
  var elYear = document.getElementById('year');
  if (elYear) {
    elYear.textContent = new Date().getFullYear();
  }

  /* ==========================================================
     8. SOROT MENU NAVIGASI SESUAI SECTION YANG DILIHAT
     ========================================================== */
  var tautanNav = document.querySelectorAll('.nav a');
  var semuaSection = document.querySelectorAll('section[id]');

  if ('IntersectionObserver' in window && tautanNav.length && semuaSection.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tautanNav.forEach(function (link) {
            var cocok = link.getAttribute('href') === '#' + entry.target.id;
            link.style.color = cocok ? 'var(--primary)' : '';
            link.style.background = cocok ? 'var(--primary-soft)' : '';
          });
        }
      });
    }, {
      threshold: 0.35
    });

    semuaSection.forEach(function (sec) {
      navObserver.observe(sec);
    });
  }

})();