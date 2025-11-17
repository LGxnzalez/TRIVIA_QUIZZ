const API_KEY = "AIzaSyASuAlwy91tpAaWPRkVnwtFlhQjDb5tW4o";
const MODEL = "gemini-2.5-flash"; // Modelo actualizado a 2.5

const temas = [ //temas
        "concepto de arreglo y operaciones sobre arreglos",
        "concepto de diccionarios y funciones básicas",
        "operadores lógicos, aritméticos, de comparación, ternario",
        "uso de la consola para debuggear",
        "funciones con parámetros por default"];


const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const preguntas = async ()=>{
    const temaAleatorio = temas[Math.floor(Math.random() * temas.length)];
    const prompt = `En el contexto de JavaScript, CSS y HTML. Genera una pregunta de opción múltiple sobre el siguiente tema ${temaAleatorio}. Proporciona cuatro opciones de respuesta y señala cuál es la correcta.    
            Genera la pregunta y sus posibles respuestas en formato JSON como el siguiente ejemplo, asegurándote de que el resultado SÓLO contenga el objeto JSON y no texto adicional enseguida te doy dos ejemplos:  
            1. Sobre arreglos en JavaScript:
            {
              "question": "¿Cuál de los siguientes métodos agrega un elemento al final de un arreglo en JavaScript?",
              "options": [
                "a) shift()",
                "b) pop()",
                "c) push()",
                "d) unshift()",
              ],
              "correct_answer": "c) push()",
              "explanation": "El método push() agrega uno o más elementos al final de un arreglo y devuelve la nueva longitud del arreglo."
            }
              2. Sobre eventos en JavaScript:
            {
              "question": "¿Cuál de los siguientes eventos se dispara cuando un usuario hace clic en un elemento HTML?",
              "options": [
                "a) onmouseover",
                "b) onclick",
                "c) onload",
                "d) onsubmit"
              ],
              "correct_answer": "b) onclick",
              "explanation": "El evento 'onclick' se dispara cuando un usuario hace clic en un elemento HTML, permitiendo ejecutar funciones en respuesta a ese clic."
            }
              
            `;
    try {
        const response = await fetch(
            url,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
    
                    generationConfig: {
                        temperature: 0.25,
                        responseMimeType: "application/json"
                    },
                }),
            }
        );

        // Manejo de errores 
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log("Respuesta transformada a json:", data);

             
        const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        const textResultTrimmed = textResult.trim();
        const firstBraceIndex = textResultTrimmed.indexOf('{');
        const lastBraceIndex = textResultTrimmed.lastIndexOf('}');
        const jsonString = textResultTrimmed.substring(firstBraceIndex, lastBraceIndex + 1);


        if (jsonString) {            
            const questionData = JSON.parse(jsonString);
            console.log(questionData);
            return questionData;
        } else {
            console.log("No se pudo extraer el texto de la respuesta.");
        }

    } catch (error) {
        console.error("Hubo un error en la petición:", error);
        document.getElementById('question').textContent = 'Error al cargar la pregunta. Por favor, revisa tu clave API.';
        return null;
    }
}

// --- Función obtenerPregunta ---
const obtenerPregunta = async (n) => {
    document.getElementById('Cargando').style.display = 'block';
    document.getElementById('Cargando').className = 'text-warning';
    document.getElementById('Cargando').textContent = 'Cargando la pregunta ..';
    document.getElementById('form_contain').style.display = 'none';

    const datosPregunta = await preguntas();

    document.getElementById('Cargando').style.display = 'none';
    document.getElementById('form_contain').style.display = 'block';

    if (datosPregunta) {
        desplegarPregunta(datosPregunta, n);
    }
    return datosPregunta;
}

// --- Función desplegarPregunta ---
const desplegarPregunta = (datosPregunta, numQuestion) => {
    const label_question = document.getElementById('question');
    const select_option = document.getElementById('options_select');

    label_question.textContent = datosPregunta.question;
    select_option.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Elija una opción...";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select_option.appendChild(defaultOption);

    datosPregunta.options.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select_option.appendChild(option);
    });

    select_option.name = `question-${numQuestion}`;
    label_question.htmlFor = 'options_select';
    select_option.required = true;
}

// --- Función desplegarContadores) ---
const desplegarContadores = () => {
    const correctas = document.getElementById('correctas');
    const incorrectas = document.getElementById('incorrectas');
    
    // Ahora toma ambos valores directamente de localStorage
    let numcorrectas = parseInt(localStorage.getItem('numcorrectas') || 0);
    let numincorrectas = parseInt(localStorage.getItem('numincorrectas') || 0); // NUEVO

    correctas.textContent = numcorrectas;
    incorrectas.textContent = numincorrectas;
}


window.onload = () => {
    console.log("Página cargada y función inicial ejecutada.");

    // --- Variables de Estado ---
    const numeroPreguntas = 10;
    let i = 0;
    let numcorrectas = 0;
    let numincorrectas = 0;
    let datosPreguntaActual = null; 

    // --- Elementos del DOM ---
    const form_contain = document.getElementById('form_contain');
    const resultados = document.getElementById('resultados');
    const submit_btn = document.getElementById('submit_btn');
    const cargando_p = document.getElementById('Cargando');

    // --- Botón "Siguiente" ---
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Siguiente Pregunta';
    button.style.display = 'none';
    form_contain.appendChild(button);

    // --- Función para cargar la próxima pregunta ---
    const cargarProximaPregunta = async () => {
        if (i < numeroPreguntas) {
            // Limpiar estado anterior
            form_contain.reset();
            resultados.textContent = '';
            submit_btn.style.display = 'inline';
            button.style.display = 'none';

            // Cargar nueva pregunta
            datosPreguntaActual = await obtenerPregunta(i);
            
            if (!datosPreguntaActual) {
                // Manejar error si de la API
                cargando_p.textContent = 'Error al cargar. Intenta recargar.';
                cargando_p.style.display = 'block';
                form_contain.style.display = 'none';
            }
        } else {
            // FINAL DE QUIZZ
            form_contain.style.display = 'none';
            cargando_p.style.display = 'block';
            cargando_p.className = 'fs-5';
            cargando_p.textContent = '¡Trivia completada! Revisa tus resultados finales.';
            desplegarContadores();
        }
    };

    // Listener para ENVIAR respuesta  
    form_contain.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (submit_btn.style.display === 'none') return;

        const formRespuestas = new FormData(e.target);
        const valorSeleccionado = formRespuestas.get(document.getElementById('options_select').name);

        if (valorSeleccionado == datosPreguntaActual.correct_answer) {
            numcorrectas++;
            localStorage.setItem('numcorrectas', numcorrectas); 
        } else {
            numincorrectas++;
            localStorage.setItem('numincorrectas', numincorrectas);
        }
        
        // Mostrar explicación
        resultados.textContent = `Respuesta Correcta: ${datosPreguntaActual.correct_answer}\n${datosPreguntaActual.explanation}`;
        
        desplegarContadores(); 

        // Ocultar "Enviar" y mostrar "Siguiente"
        submit_btn.style.display = 'none';
        button.style.display = 'inline';
    });

    // -listener para la SIGUIENTE PREGUNTA" ---
    button.addEventListener('click', () => {
        i++;
        cargarProximaPregunta();
    });

    // --- Inicio del Quiz  ---
    localStorage.setItem('numcorrectas', 0);
    localStorage.setItem('numincorrectas', 0);
    numcorrectas = 0;
    numincorrectas = 0; 
    desplegarContadores();
    cargarProximaPregunta();
};