var productos = [];

// deleteAllCookies();
//
// function deleteAllCookies() {
//     var cookies = document.cookie.split(";");
//
//     for (var i = 0; i < cookies.length; i++) {
//         var cookie = cookies[i];
//         var eqPos = cookie.indexOf("=");
//         var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     }
// }

getCookies();

function getCookies() {
    let x = document.cookie;
    let arrayProducts = x.split('; ');

    let provisionalArray = '{';
    for (var i = 0; i < arrayProducts.length; i++) {
        let data = arrayProducts[i].split('=');
        provisionalArray += '"' + data[0] + '": "' + data[1] + '"';
        if (i !== arrayProducts.length - 1) {
            provisionalArray += ',';
        }
    }
    provisionalArray += '}';
    console.log(JSON.parse(provisionalArray));
    productos = JSON.parse(provisionalArray);
}

function setProduct(product) {
    getCookies();
    // console.log()
    let boolean = true;
    // for (var i = 0; i < 10; i++) {
    //     if (productos.hasOwnProperty('product' + i)) {
    //         boolean = false;
    //     }
    // }
    // if (boolean) {
    //     document.cookie = "username=John Doe";
    // }
    let i = 0;
    do {
        console.log(productos.hasOwnProperty('product' + i));
        if (i < 10) {
            if (!productos.hasOwnProperty('product' + i)) {
                document.cookie = "product" + i + "=" + product;
                boolean = false;
            }
            i++;
        } else {
            boolean = false;
            alert('Tienes demasiados productos en tu carrito');
        }
    } while (boolean);

    console.log(boolean);

    console.log(product);
}
