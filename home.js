document.addEventListener("DOMContentLoaded", function () {

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        card.addEventListener("click", function () {

            // remove active from all
            cards.forEach(c => c.classList.remove("active"));

            // add active to clicked
            this.classList.add("active");

            const target = this.dataset.link;

            // delay for visual feedback
            setTimeout(() => {
                window.location.replace(target);
            }, 150);
        });
    });

});