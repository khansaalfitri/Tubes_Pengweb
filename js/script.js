console.log("KasToko Loaded");

const requestButtons = document.querySelectorAll(".btn-request");

requestButtons.forEach(button => {
    button.addEventListener("click", () => {
        alert("Permintaan perubahan stok telah diajukan ke Pemilik Toko.");
    });
});

function toggleMenu(button){

    const menu =
        button.nextElementSibling;

    menu.classList.toggle("show");

}