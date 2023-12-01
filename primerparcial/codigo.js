class Personaje
{
    constructor(id, nombre, tipo)
    {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
    }

    set Nombre(value)
    {
        this.nombre = value;
    }

    get Nombre()
    {
        return this.nombre;
    }

}

class Monstruo extends Personaje
{
    constructor(id, nombre, alias, defensa, miedo, tipo)
    {
        super(id, nombre, tipo);

        this.miedo = miedo;
        this.alias = alias;
        this.defensa = defensa;
    }

    set Alias(value)
    {
        this.alias = value;
    }

    get Alias()
    {
        return this.alias;
    }
}

const spinner = document.getElementById('spinner');


/*---------------CARGAR SELECT DEL LOCAL STORAGE---------------*/ 

localStorage.clear();

const tipos = ["Esqueleto", "Zombie", "Vampiro", "Fantasma", "Bruja", "Hombre Lobo"];

const monstruos = [];

cargarLocalStorage(tipos, monstruos);

const select = document.getElementById('select-tipo');

cargarSelect(select);

function cargarLocalStorage(arrayTipos, arrayMonstruos)
{
    const arrayTiposString = JSON.stringify(arrayTipos);

    const arrayMonstruosString = JSON.stringify(arrayMonstruos);

    localStorage.setItem('arrayTipos', arrayTiposString);
    localStorage.setItem('arrayMonstruos', arrayMonstruosString);

}

function cargarSelect(select)
{
    const arrayTiposString = localStorage.getItem('arrayTipos');

    const arrayTipos = JSON.parse(arrayTiposString);

    arrayTipos.forEach(function(tipo, index){
        const option= document.createElement('option');

        option.value = index;
        option.text = tipo;

        select.appendChild(option);
    });
}

/*---------------------------------------------------------------*/



/*--------------FUNCIONES DEL SERVER CON AJAX--------------------*/

const URL = "http://localhost:3000/monstruos";


function getMonstruos()
{
    return fetch(URL)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
}
function getMonstruo(id)
{
    try
    {
        const res = fetch(URL + "/" + id);

        if(!res.ok)
        {
            throw res;
        }
        const data = res.json();
    }
    catch(res)
    {
        console.error(`Error ${res.status}: ${res.statusText}`);
    }
}


function postMonstruo(event)
{
    event.preventDefault();

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = ()=>
    {
        if(xhr.readyState == 4)
        {
            if(xhr.status >= 200 && xhr.status < 300)
            {
                const data = JSON.parse(xhr.responseText);
            }
            else
            {
                console.error(`Error ${xhr.status}: ${xhr.statusText}`);
            }
        }
    };

    xhr.open("POST", URL, true);

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    let id;

    getMonstruos()
    .then(data => {
        const arrayMonstruos = data;

        if(arrayMonstruos.length == 0)
        {
            id = 1;
        }
        else
        {
            for(let i=0; i<arrayMonstruos.length; i++)
            {           
                if(arrayMonstruos[i].id == arrayMonstruos.length)
                {
                    id = arrayMonstruos[i].id + 1;
                }   
            }
        }

        let nombre = document.getElementById('nombre-txt').value;
        let alias = document.getElementById('alias-txt').value;
        let defensa = obtenerRadioButtonChecked();
        let miedo = document.getElementById('rng-miedo').value;
        let tipo = document.getElementById('select-tipo').options[select.selectedIndex].text;

        const nuevoMonstruo = new Monstruo(id,nombre,alias,defensa,miedo,tipo);
    
        try
        {
            xhr.send(JSON.stringify(nuevoMonstruo));
        }
        catch(err)
        {
            console.error(err);
        } 

        getMonstruos()
        .then(data=>{
            refrescarDiv(crearTabla(data));
            asignarEventoButtons();
        })
        .catch(error => {
         console.error("Error al obtener monstruos", error);
        })
        
    })
    .catch(error => {
        console.error("Error al obtener monstruos", error);
    })
    
    
}


function deleteMonstruo(id)
{    
    axios.delete(URL + "/" + id)

    .then((res)=>
    {
    })

    .catch((err)=>
    {
        console.error(err.message);
    })

}

function updateMonstruo(id)
{
    let nombre = document.getElementById('nombre-txt').value;
    let alias = document.getElementById('alias-txt').value;
    let defensa = obtenerRadioButtonChecked();
    let miedo = document.getElementById('rng-miedo').value;
    let tipo = document.getElementById('select-tipo').options[select.selectedIndex].text;

    const nuevoMonstruo = new Monstruo(id,nombre,alias,defensa,miedo,tipo);

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = ()=>
    {
        if(xhr.readyState == 4)
        {
            if(xhr.status >= 200 && xhr.status < 300)
            {
                const data = JSON.parse(xhr.responseText);
            }
            else
            {
                console.error(`Error ${xhr.status}: ${xhr.statusText}`);
            }
        }      
    };

    xhr.open("PUT", URL + "/" + id, true);

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    try
    {
        xhr.send(JSON.stringify(nuevoMonstruo));
        getMonstruos()
        .then(data=>{
            refrescarDiv(crearTabla(data));
            asignarEventoButtons();
        })
        .catch(error => {
            console.error("Error al obtener monstruos", error);
        })
    }
    catch(err)
    {
        console.error(err);
    } 
}


function mostrarMonstruos()
{
    getMonstruos()
    .then(data=>{
        console.log(data)
    })
    .catch(error => {
        console.error("Error al obtener monstruos", error);
    })
}
/*----------------------------------------------------------------*/

/*-------------------------TABLA DE MONSTRUOS---------------------*/

getMonstruos()
    .then(data=>{
        refrescarDiv(crearTabla(data));
        asignarEventoButtons();
    })
    .catch(error => {
        console.error("Error al obtener monstruos", error);
    })


   
function asignarEventoButtons()
{
    setTimeout(function(){
        const filasTabla = document.querySelectorAll('#tablaMonstruos tbody tr');
        

        filasTabla.forEach(fila=>{
            const botonSeleccionar = fila.querySelector('button:nth-child(1)');
            const btnCancelar = document.getElementById('btnCancelar');

            botonSeleccionar.addEventListener('click', ()=>{
                btnCancelar.classList.remove('oculto');
                const datosMonstruo = obtenerDatosMonstruo(fila);
                cargarDatosEnFormulario(datosMonstruo);
                cambiarTextoGuardarModificar();
                asignarEventoModificar(botonSeleccionar.getAttribute('data-monstruo-id'));
                });    
            });
        console.log("Ready");
        
    }, 3000);
    
}


const btnCancel = document.getElementById('btnCancelar');

btnCancel.addEventListener('click', ()=>{
    btnCancel.classList.add('oculto');
    cambiarTextoModificarGuardar();
});


function asignarEventoModificar(id)
{
    const btnGuardar = document.getElementById('btnGuardar');
    const btnCancel = document.getElementById('btnCancelar');

    btnGuardar.onclick = function(event){
        event.preventDefault();
        updateMonstruo(id);
        cambiarTextoModificarGuardar();
        btnCancel.classList.add('oculto');
    }
}

function cambiarTextoGuardarModificar()
{
    const btnGuardar = document.getElementById('btnGuardar');

    const icono = document.createElement('i');
    
    icono.classList.add('fa-regular', 'fa-floppy-disk');

    btnGuardar.textContent = '';
    btnGuardar.appendChild(icono);
    btnGuardar.appendChild(document.createTextNode('Modificar'));

    btnGuardar.classList.add('estilo-modificar');

}

function cambiarTextoModificarGuardar()
{
    const btnGuardar = document.getElementById('btnGuardar');

    const icono = document.createElement('i');
    
    icono.classList.add('fa-regular', 'fa-floppy-disk');

    btnGuardar.textContent = '';
    btnGuardar.appendChild(icono);
    btnGuardar.appendChild(document.createTextNode('Guardar'));

    btnGuardar.classList.add('estilo-modificar');

}


    function obtenerDatosMonstruo(fila) {
        const celdas = fila.querySelectorAll('td');
        const datos = {};
        const ordenColumnas = ['Nombre', 'Alias', 'Defensa', 'Miedo', 'Tipo'];
    
        celdas.forEach((celda, index) => {
            const clave = ordenColumnas[index];
            datos[clave] = celda.textContent;
        });
    
        return datos;
    }

    function obtenerIdMonstruo(fila) {
        const celdas = fila.querySelectorAll('td');
        return celdas[0].textContent;
    }
    
    function cargarDatosEnFormulario(datosMonstruo)
    {
        document.getElementById('nombre-txt').value = datosMonstruo['Nombre'];

        document.getElementById('alias-txt').value = datosMonstruo['Alias'];

        cargarDefensa(datosMonstruo['Defensa']);

        document.getElementById('rng-miedo').value = datosMonstruo['Miedo'];

        const tipoMonstruo = datosMonstruo['Tipo'];
        const selectTipo = document.getElementById('select-tipo');

        for (let i = 0; i < selectTipo.options.length; i++)
        {
            if (selectTipo.options[i].text === tipoMonstruo)
            {
                selectTipo.selectedIndex = i;
                break;
            }
        }
    }

    function cargarDefensa(defensa) {
        const radioLabels = document.querySelectorAll('#divDefensa label');

        radioLabels.forEach((label) => {
        if (label.innerText.toLowerCase() === defensa.toLowerCase()) {
            label.previousElementSibling.checked = true;
        }
    });
    }

function crearTabla(arr)
{
    let tabla = document.createElement('table');
    tabla.id = 'tablaMonstruos';
    tabla.appendChild(crearCabeceraTabla(arr[0]));
    tabla.appendChild(crearCuerpoTabla(arr));
    tabla.classList.add('table');
    tabla.classList.add('table-striped');
    tabla.classList.add('table-hover');

    return tabla;
}

function crearCabeceraTabla(objeto)
{
    let tHead = document.createElement('thead');
    let tr = document.createElement('tr');

    const headers = ['Nombre', 'Alias', 'Defensa', 'Miedo', 'Tipo', 'Seleccionar', 'Eliminar'];

    headers.forEach(headerText=>{
        let th = document.createElement('th');
        let texto = document.createTextNode(headerText);
        th.appendChild(texto);
        th.classList.add('table-warning');
        tr.appendChild(th);
    });

    tHead.appendChild(tr);

    tHead.classList.add('text-capitalize');
    tHead.classList.add('text-center');

    return tHead;
}

function crearCuerpoTabla(arr)
{
    let tbody = document.createElement('tbody');
    

    arr.forEach(element => {
        let tr = document.createElement('tr');

        const ordenKeys = ['nombre', 'alias', 'defensa', 'miedo', 'tipo'];

        ordenKeys.forEach(key=>{
            let td = document.createElement('td');
            let texto = document.createTextNode(element[key]);
            td.appendChild(texto);
            td.classList.add('text-center');
            td.classList.add('text-capitalize');
            td.classList.add('table-danger');
            tr.appendChild(td);
        });

        let tdSleccionar = document.createElement('td');
        let btnSeleccionar = document.createElement('button');

        btnSeleccionar.textContent = 'Select';
        btnSeleccionar.setAttribute('data-monstruo-id', element.id);

        tdSleccionar.appendChild(btnSeleccionar);
        tdSleccionar.classList.add('text-center');
        tdSleccionar.classList.add('table-danger');
        tr.appendChild(tdSleccionar);

        let tdEliminar = document.createElement('td');
        let btnEliminar = document.createElement('button');

        btnEliminar.textContent = 'Delete';
        btnEliminar.dataset.id = element.id;
        btnEliminar.addEventListener('click', ()=>{
            const id = btnEliminar.dataset.id;
            deleteMonstruo(id);
            getMonstruos()
                .then(data=>{
                    refrescarDiv(crearTabla(data));
                    asignarEventoButtons();
                    })
                .catch(error => {
                     console.error("Error al obtener monstruos", error);
                    })
        });

        tdEliminar.appendChild(btnEliminar);
        tdEliminar.classList.add('text-center');
        tdEliminar.classList.add('table-danger');
        tr.appendChild(tdEliminar);

        tbody.appendChild(tr);
    });

    return tbody
}

function refrescarDiv(tabla)
{
    spinner.classList.remove('oculto');

    calcularPromedio();

    getMonstruos()
    .then(data => {
        const monstruos = data;
        cargarMiedoMaximoEnInput(monstruos);
        cargarMiedoMinimoEnInput(monstruos);
    })
    .catch(error => {
        console.error("Error al obtener monstruos", error);
    });

    const div = document.getElementById('tabla');
    
    while(div.firstChild)
    {
        div.removeChild(div.firstChild);
    }

    const btnGuardar = document.getElementById('btnGuardar');

    btnGuardar.onclick = function(){
        cambiarTextoModificarGuardar();
    }

    setTimeout(function(){
        div.appendChild(tabla);
        spinner.classList.add("oculto");
    }, 2000);
}

/*----------------------------------------------------------------*/
function obtenerRadioButtonChecked()
{
    let radioButtons = document.getElementsByName('rad-defensa');

    let idChecked = "";

    let defensa = "";

    for(let i=0; i<radioButtons.length; i++)
    {
        if(radioButtons[i].checked)
        {
            idChecked = radioButtons[i].id;
            break;
        }
    }

    switch(idChecked)
    {
        case 'rad-estaca':
            defensa = "Estaca";
            break;
        case 'rad-plata':
            defensa = "Plata";
            break;
        case 'rad-crucifijo':
            defensa = "Crucifijo";
            break;
        case 'rad-pocion':
            defensa = "Pocion";
            break; 
    }

    return defensa;
    
}

const btnMonstruos = document.getElementById('btn-monstruos');

btnMonstruos.addEventListener('click', function(){
    document.querySelectorAll('body > *:not(nav)').forEach(element=>{
        element.classList.add('oculto');
    });

    mostrarCards();

    const imagenFondo = document.createElement('div');

    imagenFondo.classList.add('fullscreen-image');
    document.body.appendChild(imagenFondo);

    
});

function mostrarCards()
{
    const cardsMonstruos = document.getElementById('cards-monstruos');
    cardsMonstruos.innerHTML = '';

    getMonstruos()
    .then(data=>{
        data.forEach(monstruo=>{
            const card = crearCardMonstruo(monstruo);
            card.classList.add('tarjeta-monstruo');
            cardsMonstruos.appendChild(card);
        });
        cardsMonstruos.classList.remove('oculto');
    })
    .catch(error=>{
        console.error("Error al obtener monstruos", error);
    });

}

function crearCardMonstruo(monstruo)
{
    const card = document.createElement('div');
    card.classList.add('card');

    const contenido = `
    <h3>${monstruo.nombre}</h3>
    <p>Alias: ${monstruo.alias}</p>
    <p>Defensa: ${monstruo.defensa}</p>
    <p>Miedo: ${monstruo.miedo}</p>
    <p>Tipo: ${monstruo.tipo}</p>
    `;
    card.innerHTML = contenido;
    card.classList.add('estilo-cards');

    return card;
}

const btnInicio = document.getElementById('btn-inicio');

btnInicio.addEventListener('click', function(){
    const elementosOcultos = document.querySelectorAll(':not(#spinner).oculto');
    const divCards = document.getElementById('cards-monstruos');
    const cards = document.querySelectorAll('.estilo-cards');

    divCards.classList.add('oculto');

    elementosOcultos.forEach(elemento => {
        elemento.classList.remove('oculto');
    });

    cards.forEach(card => {
        card.classList.add('oculto');
    });

    const imagenFondo = document.querySelector('.fullscreen-image');

    if(imagenFondo)
    {
        imagenFondo.remove();
    }   
});

function calcularPromedio()
{
    getMonstruos()
    .then(data=>{
        const monstruos = data;
            const totalMiedo = monstruos.reduce((acumulador, monstruo) => {
                return acumulador + parseInt(monstruo.miedo);
            }, 0);

            const promedio = totalMiedo / monstruos.length;
            const txtPromedio = document.getElementById('txt-promedio-miedo');
            txtPromedio.value = promedio.toFixed(2);

    })
    .catch(error => {
        console.error("Error al obtener monstruos", error);
    })
}

function calcularMiedoMaximo(monstruos) {
    let maximo = 0;

    monstruos.forEach(monstruo => {
        const miedo = parseInt(monstruo.miedo);
        if (miedo > maximo) {
            maximo = miedo;
        }
    });

    return maximo;
}

function cargarMiedoMaximoEnInput(monstruos) {
    const miedoMaximo = calcularMiedoMaximo(monstruos);
    const inputMiedoMaximo = document.getElementById('txt-miedo-maximo');
    inputMiedoMaximo.value = miedoMaximo.toString();
}

function calcularMiedoMinimo(monstruos) {
    let minimo = 0;

    monstruos.forEach(monstruo => {
        const miedo = parseInt(monstruo.miedo);
        if (miedo < minimo) {
            minimo = miedo;
        }
    });

    return minimo;
}

function cargarMiedoMinimoEnInput(monstruos) {
    const miedoMinimo = calcularMiedoMinimo(monstruos);
    const inputMiedoMinimo = document.getElementById('txt-miedo-minimo');
    inputMiedoMinimo.value = miedoMinimo.toString();
}



selectTabla = document.getElementById('select-tipos-tabla');

const arrayTiposTabla = ["Todos", "Vampiro", "Hombre Lobo", "Fantasma", "Esqueleto", "Bruja", "Zombie"];

cargarTiposTablaLocalStorage(arrayTiposTabla);
cargarSelectTabla(selectTabla);


function cargarTiposTablaLocalStorage(arrayTiposTabla)
{
    const arrayTiposString = JSON.stringify(arrayTiposTabla);

    localStorage.setItem('arrayTiposTabla', arrayTiposString);

}


function cargarSelectTabla(selectTabla)
{
    const arrayTiposString = localStorage.getItem('arrayTiposTabla');

    const arrayTipos = JSON.parse(arrayTiposString);

    arrayTipos.forEach(function(tipo, index){
        const option= document.createElement('option');

        option.value = index;
        option.text = tipo;

        selectTabla.appendChild(option);
    });
}

const selectTablaTipos = document.getElementById('select-tipos-tabla');

selectTablaTipos.addEventListener('change', function(){

    const valorSeleccionado = selectTabla.options[selectTabla.selectedIndex].text;
    getMonstruos()
    .then(data => {
     
        let monstruosFiltrados = data;
        if (valorSeleccionado !== 'Todos') {
            monstruosFiltrados = data.filter(monstruo => monstruo.tipo === valorSeleccionado);
        }
        refrescarDiv(crearTabla(monstruosFiltrados));
        asignarEventoButtons();
    })
    .catch(error => {
        console.error("Error al obtener monstruos", error);
    });
});

function obtenerColumnas() {
    return new Promise((resolve) => {
        setTimeout(function () {
            const filasTabla = document.querySelectorAll('#tablaMonstruos tbody tr');
            const header = document.getElementById('#tablaMonstruos th');
            const columnas = [];

            filasTabla.forEach((fila) => {
                const celdas = fila.querySelectorAll('td');
                celdas.forEach((celda, index) => {
                    if (!columnas[index]) {
                        columnas[index] = [];
                    }
                    columnas[index].push(celda);
                });
            });

            resolve(columnas);
        }, 4000);
    });
}

agregarEventosCheckBoxes();

function agregarEventosCheckBoxes()
{
    setTimeout(function(){
        const chkboxNombre = document.getElementById('chkbox-nombre');
        const chkboxAlias = document.getElementById('chkbox-alias');
        const chkboxDefensa = document.getElementById('chkbox-defensa');
        const chkboxMiedo = document.getElementById('chkbox-miedo');
        const chkboxTipo = document.getElementById('chkbox-tipo');


        chkboxNombre.addEventListener('change', () => {
            mostrarOcultarColumna(0, chkboxNombre.checked);
            guardarColumnaLocalStorage(chkboxNombre, chkboxNombre.checked);
        });

        chkboxAlias.addEventListener('change', () => {
            mostrarOcultarColumna(1, chkboxAlias.checked);
            guardarColumnaLocalStorage(chkboxAlias, chkboxAlias.checked);
        });

        chkboxDefensa.addEventListener('change', () => {
            mostrarOcultarColumna(2, chkboxDefensa.checked);
            guardarColumnaLocalStorage(chkboxDefensa, chkboxDefensa.checked);
        });

        chkboxMiedo.addEventListener('change', () => {
            mostrarOcultarColumna(3, chkboxMiedo.checked);
            guardarColumnaLocalStorage(chkboxMiedo, chkboxMiedo.checked);
        });

        chkboxTipo.addEventListener('change', () => {
            mostrarOcultarColumna(4, chkboxTipo.checked);
            guardarColumnaLocalStorage(chkboxTipo, chkboxTipo.checked);
        });

        recuperarColumnas();

        console.log("Listos");
    }, 4000);
}

function mostrarOcultarColumna(indice, mostrar)
{
    obtenerColumnas()
    .then((col)=>{
        const columnas = col;
        if (columnas[indice]) {
            columnas[indice].forEach(celda => {
                if (mostrar) {
                    celda.classList.remove('oculto');
                } else {
                    celda.classList.add('oculto');
                }
            });
        }
    });
    
}

/*
function obtenerMonstruosOrdenadosPorMiedoDescendente() {
        getMonstruos()
        .then((monstruos) => {
            const arrayMonstruosOrdenados = monstruos.sort((a, b) => b.miedo - a.miedo);
            console.log(arrayMonstruosOrdenados);
        })
        .catch((error) => {
            console.error("Error al obtener monstruos", error);
            throw error;
        });
}

/*
setTimeout(function(){
    const mama = obtenerMonstruosOrdenadosPorMiedoDescendente();

}, 5000)*/

  
