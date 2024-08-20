// Configuración de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Inicializa Firebase
const firebaseConfig = {
    databaseURL: "https://powergym-abb76-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Cargar modelos disponibles y llenar el <select>
export function cargarModelos() {
    const modelSelect = document.getElementById("modelSelect");
    const dbRef = ref(database, 'models');

    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            for (let model in data) {
                const option = document.createElement("option");
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            }
        } else {
            console.log("No se encontraron modelos.");
        }
    }).catch((error) => {
        console.error("Error al cargar los modelos:", error);
    });
}

// Cargar códigos de error según el modelo seleccionado
export function cargarErrores() {
    const modelSelect = document.getElementById("modelSelect");
    const errorSelect = document.getElementById("errorSelect");
    const selectedModel = modelSelect.value;

    // Limpiar el menú de códigos de error
    errorSelect.innerHTML = "";

    if (selectedModel) {
        const dbRef = ref(database, `models/${selectedModel}/errors`);

        get(dbRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                for (let key in data) {
                    const option = document.createElement("option");
                    option.value = key;
                    option.textContent = key;
                    errorSelect.appendChild(option);
                }
            } else {
                console.log("No se encontraron errores para el modelo seleccionado.");
            }
        }).catch((error) => {
            console.error("Error al cargar los errores:", error);
        });
    }
}

// Función para buscar un código de error en Firebase
export function buscarError() {
    const errorCode = document.getElementById("errorSelect").value;
    const selectedModel = document.getElementById("modelSelect").value;
    const dbRef = ref(database, `models/${selectedModel}/errors`);
    console.log(`Buscando en la ruta: models/${selectedModel}/errors`); // Depuración

    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Datos disponibles en 'errors':", data); // Depuración

            const errorData = data[errorCode] || null;

            if (errorData) {
                document.getElementById("printerName").textContent = errorData.Impresora || "No disponible";
                document.getElementById("errorName").textContent = errorData.Error || "No disponible";
                document.getElementById("symptom").textContent = errorData.Sintoma || "No disponible";

                const solutionList = document.getElementById("solutionList");
                solutionList.innerHTML = "";

                if (errorData.Solucion && Array.isArray(errorData.Solucion)) {
                    errorData.Solucion.forEach(step => {
                        const li = document.createElement("li");
                        li.textContent = step;
                        solutionList.appendChild(li);
                    });
                } else {
                    solutionList.innerHTML = "<li>No hay soluciones disponibles.</li>";
                }
            } else {
                document.getElementById("printerName").textContent = "No disponible";
                document.getElementById("errorName").textContent = "No disponible";
                document.getElementById("symptom").textContent = "No disponible";
                document.getElementById("solutionList").innerHTML = "<li>No hay datos disponibles para este código de error.</li>";
            }
        } else {
            document.getElementById("printerName").textContent = "No disponible";
            document.getElementById("errorName").textContent = "No disponible";
            document.getElementById("symptom").textContent = "No disponible";
            document.getElementById("solutionList").innerHTML = "<li>No hay datos disponibles para este código de error.</li>";
        }
    }).catch((error) => {
        console.error("Error al obtener los datos:", error);
        document.getElementById("result").innerHTML = "<p>Hubo un error al obtener los datos. Inténtalo de nuevo.</p>";
    });
}

// Cargar modelos y errores al iniciar
window.onload = cargarModelos;

// Agregar el EventListener al menú de selección de modelos
document.getElementById("modelSelect").addEventListener("change", cargarErrores);

// Agregar el EventListener al menú de selección de errores
document.getElementById("errorSelect").addEventListener("change", buscarError);
