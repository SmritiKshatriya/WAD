let cart = [];

function addToCart(item) {
    cart.push(item);
    alert(item + " added to cart!");
}

function clearCart() {
    cart = [];
    document.getElementById("cartList").innerHTML = "";
}

$(document).on("pageshow", "#cart", function () {
    let list = $("#cartList");
    list.empty();

    cart.forEach(function(item) {
        list.append("<li>" + item + "</li>");
    });

    list.listview("refresh");
});