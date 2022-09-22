const productsList = document.getElementById('productList');
const noproducto = document.getElementById('noproducto');
//console.log(productsList)

let products = [];
let carrito = JSON.parse( localStorage.carrito);
let idModelSelected = []
for (let i in carrito) {
    idModelSelected.push(carrito[i].id)}

//console.log(carrito)

const res = await fetch('http://45.9.188.254:4040/api/products');
const productsJSON = await res.json();
products = productsJSON.data;
var elementSelected = []
for (let index = 0; index < idModelSelected.length; index++) {
    elementSelected.push(products.find(elem => elem.idModelo ==idModelSelected[index]))
    }
//console.log(elementSelected)

for(let i  in elementSelected){
    //console.log(elementSelected[i])
    for (let j in carrito){
        //console.log(carrito[j])
        if(elementSelected[i].idModelo == carrito[j].id){
            elementSelected[i]['count']= carrito[j].count

        }

    }
}
console.log(elementSelected)

elementSelected['total'] = 0
elementSelected.map(elemento => {

    elemento['subtotal']= elemento.count * elemento.precio
    elementSelected['total']+= elemento.subtotal
})




console.log(elementSelected)

const htmlString = elementSelected
        .map((product) => {
            return `
            <li>
                <img src="./../imgs/products/${product.imgProducto}" alt="Imágen del producto">
                <h3 href="/products/detail/${product.idModelo}" class="inv-nombre">${product.nombreModelo}</h3>
                <h4 class="inv-precio">USD ${product.precio}</h4>
                <h4 class="inv-precio"> Cantidad: ${product.count}</h4>
                <h4 class="inv-precio">Subtotal USD ${product.precio * product.count}</h4>
            </li>
        `;
        })
        .join('');
        if(htmlString){
            productsList.innerHTML = htmlString;
            productsList.style.display = 'block';
            noproducto.style.display = 'none';
        } 

const vaciarCarrito = document.querySelector('#vaciar-carrito')

//console.log(vaciarCarrito)
//console.log(idmodelo)

vaciarCarrito.addEventListener('click', function(event){
    localStorage.clear()
    elementSelected = []
    new AWN().success('Se vació el carrito')

    window.location.reload();
    event.preventDefault()
});

const total = document.getElementById('total-compra'
)

total.innerHTML = `USD ${elementSelected.total}`

