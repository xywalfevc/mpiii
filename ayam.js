const message = "Piixiie,\n" +
"Hari itu, di sebuah map rusuh bernama Salon de Fiesta, takdir kita bertemu tanpa rencana walaupun ada emot T_T. Aku masih ingat kata-katamu — kalau bukan karena pertemuan itu, mungkin Roblox sudah kau tinggalkan. Tapi ternyata semesta punya cara lucu untuk mempertemukan dua jiwa yapper dan kocak.\n\n" +

"Sejak hari itu, sudah 32 hari kita saling kenal. Dari sekadar mabar Roblox, sampai kini suara kita saling menyapa lewat Discord di malam-malam panjang. Kita tertawa bersama, kadang diam saat sedih, kadang marah pada dunia, kadang bahagia berlebihan. Hidupmu, Piixiie, adalah campuran nada senang, sedih, tawa, dan tangis — seperti suara ayam yang tak pernah bosan kudengar.\n\n" +

"Dan aku, Luxxalf, hanya ingin bilang:\n" +
"jangan pernah benci pada dirimu sendiri. Kau terlalu berharga untuk dilukai oleh pikiranmu sendiri. Sayangi dirimu, cintai dirimu lebih dari kemarin, lebih dari sebelumnya, lebih dari yang bisa kubilang dengan kata-kata. Karena buat aku, Piixiie selalu tuan putri yang imut, kuat, dan berhak atas kebahagiaan yang indah.\n\n" +

"Tak apa kalau hari-hari tidak selalu mulus. Tak apa kalau kita sekarang jarang main Roblox lagi. Yang penting, senyamanmu saja. Karena yang paling penting adalah kamu tetap bertahan, tetap semangat, dan terus berjalan ke depan.\n\n" +

"Dan kalau dunia terasa terlalu berat, ingatlah — aku ada di sini. Aku Luxxalf, akan menemani, mendengar, dan tetap ada, kapan pun kau butuh.\n\n" +

"Piixiie, semoga kau selalu mencintai dirimu setulus ayam yang menghargai setiap detik sebelum dipotong.\n\n" +

"Dengan bodoh,\n" +
"Luxxalf.\n\n" +

"ajg gw bikin ini 14 jam";

function showLetter() {
  document.getElementById("introText").style.opacity = 0;
  document.querySelector(".btn").style.display = "none";
  document.querySelector(".btn2").style.display = "none"; // kalau ada tombol lain

  setTimeout(() => {
    const letterBox = document.getElementById("letterBox");
    const typedText = document.getElementById("typedText");
    letterBox.style.display = "block";
    let i = 0;

    function typeWriter() {
      if (i < message.length) {
        typedText.innerHTML += message.charAt(i);
        i++;

        // ⬇️ Tambahin ini biar auto scroll
        const letterBox = document.getElementById("letterBox");
        letterBox.scrollTop = letterBox.scrollHeight;

        // atau kalau mau full halaman scroll:
        // window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

        setTimeout(typeWriter, 30);
      }
    }

    typeWriter();
  }, 600);
}

