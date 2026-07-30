import { toggleLED, toggleFetchSuccess, toggleFetchError, toggleRefresh } from './dataDisplay.js';


var i = 0;
FETCH_DATA();
async function FETCH_DATA(){
    const NODE_IP = "127.0.0.1";
    const NODE_URL = `http://${NODE_IP}:1880/api/state`;   

    try{                
        const response = await fetch(NODE_URL);                               
        const data = await response.json();                
        console.log(++i, data);        

        displayDATA(data);
        SET_DATA(data);

        toggleLED("sensorUpdate");
        setTimeout(() => { toggleLED("sensorUpdate"); }, 200);  
        if(data.profinet.online == true) {toggleFetchSuccess("PROFINET", data)} else {toggleFetchError("PROFINET")}             
        if(data.mqtt.online     == true) {toggleFetchSuccess("MQTT"    , data)} else {toggleFetchError("MQTT"    )}  
        if(data.can.online      == true) {toggleFetchSuccess("CAN"     , data)} else {toggleFetchError("CAN"     )}  


    } catch(error) { 
        console.error("Fetch failed:", error.message);            

        toggleLED("sensorError");
        setTimeout(() => { toggleLED("sensorError"); }, 200);
        toggleFetchError("PROFINET");
        toggleFetchError("MQTT"    );
        toggleFetchError("CAN"     );   
    }
    setTimeout(() => {FETCH_DATA()}, 3000);
}

function displayDATA(DATA){                
    //---------------------[ PROFINET Protocol   ]---------------------//
    if(DATA.profinet.online == true){
        document.getElementById("PROFINET_estado"    ).innerHTML = DATA.profinet.estado    ? "Ligado"     : "Desligado"   ;
        document.getElementById("PROFINET_habilitar" ).innerHTML = DATA.profinet.habilitar ? "Habilitado" : "Desabilitado";
        document.getElementById("PROFINET_reset"     ).innerHTML = DATA.profinet.resetar   ? "Resetar"    : "---"         ;
        document.getElementById("PROFINET_frequencia").innerHTML = `${DATA.profinet.frequencia} KHz`;   
    }          
    //---------------------[ MQTT     Protocol   ]---------------------//
    if(DATA.mqtt.online == true){
        document.getElementById("MQTT_temperatura"   ).innerHTML = DATA.mqtt.estado;
        document.getElementById("MQTT_estado"        ).innerHTML = DATA.mqtt.temperatura;
    }
    if(DATA.can.online == true){
        //---------------------[ CAN      Protocol   ]---------------------//   
        let NDR = ['N','D','R'];
        document.getElementById("CAN_velocity"       ).innerHTML = `${(DATA.can.velocidade*0.1).toFixed(1)} km`;
        document.getElementById("CAN_gear"           ).innerHTML = NDR[DATA.can.marcha];
        document.getElementById("CAN_error"          ).innerHTML = DATA.can.erro;         
    }
}

async function SET_DATA(data) {
    try {
        const response = await fetch("controller.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "set_data",
                senha: data.senha,
                profinet: {
                    online:     data.profinet.online,
                    estado:     data.profinet.estado,
                    habilitar:  data.profinet.habilitar,
                    resetar:    data.profinet.resetar,
                    frequencia: data.profinet.frequencia
                },
                mqtt: {
                    online:      data.mqtt.online,
                    temperatura: data.mqtt.temperatura,
                    estado:      data.mqtt.estado
                },
                can: {
                    online:     data.can.online,
                    velocidade: data.can.velocidade,
                    marcha:     data.can.marcha,
                    erro:       data.can.erro
                }
            })
        });                   
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const data2 = await response.json(); // Or response.text() if backend doesn't return JSON

    } catch (error) {
        console.error("Fetch failed:", error);
    }
}