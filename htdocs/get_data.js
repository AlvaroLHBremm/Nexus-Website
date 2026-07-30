
import { toggleLED, toggleFetchSuccess, toggleFetchError, toggleRefresh } from './dataDisplay.js';

GET_DATA(1000);
var i = 0;
var GET_DATA_TIMEOUT;
function GET_DATA(delay = 3000)
{
	clearTimeout(GET_DATA_TIMEOUT);
	GET_DATA_TIMEOUT = setTimeout(() => {
		fetch("controller.php", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({action: "get_data"})                        
		 }).then(response => {
			if (!response.ok) {
			  throw new Error(`HTTP error! Status: ${response.status}`);
			}
			return response.text().then(text => {
                //console.log("Raw controller response:", text);
                try {
                    return JSON.parse(text);
                } catch (error) {
                    throw new Error("Controller did not return valid JSON: " + text);
                }
            });
		 }).then(data => {
			if (!data.ok) {
                console.log(data);
    			throw new Error(`Server error: ${data.error || data.message || "Unknown error"}`);
			}
			const PROTOCOL_DATA = data;	//.json();                
			//console.log(++i, PROTOCOL_DATA);     
			
			displayDATA(PROTOCOL_DATA);
			//updateGraph("PROFINET", PROTOCOL_DATA.data.profinet.frequencia);
			//updateGraph("MQTT"    , PROTOCOL_DATA.data.mqtt.temperatura.replaceAll("ºC", ""));
			//updateGraph("CAN"     , PROTOCOL_DATA.data.can.velocidade);

			toggleLED("sensorDisplay");
			setTimeout(() => { toggleLED("sensorDisplay"); }, 200);
			GET_DATA(); 
			
		}).catch(error => {
			console.error("Fetch failed:", error);            

			toggleLED("sensorError");
			setTimeout(() => { toggleLED("sensorError"); }, 200);                			
			GET_DATA();
		});
	}, delay);                        
}
function displayDATA(PROTOCOL){
	//---------------------[ PROFINET Protocol   ]---------------------//
	if(PROTOCOL.data.profinet.online){
		document.getElementById("operator_PROFINET").classList.add("PROFINET_ON");   
		toggleFetchSuccess("PROFINET");
		if(sounds.PROFINET.habilitado && !sounds.PROFINET.estado_anterior){
			SetAnnouncement("PROFINET connected");                    
		}
		sounds.PROFINET.estado_anterior = true;
	} else {
		document.getElementById("operator_PROFINET").classList.remove("PROFINET_ON");
		toggleFetchError("PROFINET");
		if(sounds.PROFINET.habilitado && sounds.PROFINET.estado_anterior){
			SetAnnouncement("PROFINET disconnected");                    
		}
		sounds.PROFINET.estado_anterior = false;
	}
	document.getElementById("PROFINET_estado"    ).innerHTML = PROTOCOL.data.profinet.estado    ? "Ligado"     : "Desligado"   ;
	document.getElementById("PROFINET_habilitar" ).innerHTML = PROTOCOL.data.profinet.habilitar ? "Habilitado" : "Desabilitado";
	document.getElementById("PROFINET_resetar"   ).innerHTML = PROTOCOL.data.profinet.resetar   ? "Resetar"    : "---"         ;
	document.getElementById("PROFINET_frequencia").innerHTML = `${PROTOCOL.data.profinet.frequencia} Hz`;   
	document.getElementById("PROFINET_date"      ).innerHTML = PROTOCOL.data.profinet.horario.split(" ")[1];
   
	//---------------------[ CAN      Protocol   ]---------------------//       
	if(PROTOCOL.data.can.online){
		document.getElementById("operator_CAN").classList.add("CAN_ON");      
		toggleFetchSuccess("CAN");
		if(sounds.CAN.habilitado && !sounds.CAN.estado_anterior){
			SetAnnouncement("CAN connected");                    
		}
		sounds.CAN.estado_anterior = true;
	} else {
		document.getElementById("operator_CAN").classList.remove("CAN_OFF");
		toggleFetchError("CAN");
		if(sounds.CAN.habilitado && sounds.CAN.estado_anterior){
			SetAnnouncement("CAN disconnected");
		}                       
		sounds.CAN.estado_anterior = false;
	}	
	document.getElementById("CAN_velocity"       ).innerHTML = `${(PROTOCOL.data.can.velocidade).toFixed(1)} km`;
	document.getElementById("CAN_gear"           ).innerHTML = PROTOCOL.data.can.marcha;
	document.getElementById("CAN_error"          ).innerHTML = PROTOCOL.data.can.erro;       
	document.getElementById("CAN_date"           ).innerHTML = PROTOCOL.data.can.horario.split(" ")[1];
	
	//---------------------[ MQTT     Protocol   ]---------------------//
	if(PROTOCOL.data.mqtt.online){
		document.getElementById("operator_MQTT").classList.add("MQTT_ON");  
		toggleFetchSuccess("MQTT");
		if(sounds.MQTT.habilitado && !sounds.MQTT.estado_anterior){
			SetAnnouncement("MQTT connected");                    
		}
		sounds.MQTT.estado_anterior = true;
	} else {
		document.getElementById("operator_MQTT").classList.remove("MQTT_ON");
		toggleFetchError("MQTT");
		if(sounds.MQTT.habilitado && sounds.CAN.estado_anterior){
			SetAnnouncement("MQTT disconnected");                    
		}         
		sounds.CAN.estado_anterior = false;
	}
	document.getElementById("MQTT_temperatura"   ).innerHTML = PROTOCOL.data.mqtt.temperatura;
	document.getElementById("MQTT_estado"        ).innerHTML = PROTOCOL.data.mqtt.estado;
	document.getElementById("MQTT_date"          ).innerHTML = PROTOCOL.data.mqtt.horario.split(" ")[1];        
}





document.addEventListener("visibilitychange", (event)=>{
	if(document.visibilityState == "hidden"){
		clearTimeout(GET_DATA_TIMEOUT);
	} else{
		GET_DATA(1000);
	}
});

const sounds = {
	PROFINET: {
		habilitado:      false,
		estado_anterior: false
	},
	CAN: {
		habilitado:      false,
		estado_anterior: false
	},
	MQTT: {
		habilitado:      false,
		estado_anterior: false
	},
	switchAudio : new Audio("imagens/switch.mp3")
};


var announcement;
function SetAnnouncement(texto, config = {}) {
	console.log(sounds["PROFINET"].habilitado,sounds["MQTT"].habilitado,sounds["CAN"].habilitado);   
   
	if(speechSynthesis){
		speechSynthesis.cancel();
	}            
	
	announcement = new SpeechSynthesisUtterance(texto);
	announcement.lang  = config.lang  ?? "en-US";
	announcement.rate  = config.rate  ?? 1;
	announcement.pitch = config.pitch ?? 1;
	speechSynthesis.speak(announcement);
}

var stored_data = {
	PROFINET_graph: [],
	MQTT_graph: [],
	CAN_graph: [],
    PROFINET_last: 0,
    MQTT_last: 0,
    CAN_last: 0
};

setInterval(()=>{
    updateGraph("PROFINET", +Math.random()*Math.random()*1000, "Hz");
    updateGraph("MQTT"    , +Math.random()*Math.random()*50, "ºC");
    updateGraph("CAN"     , +Math.random()*Math.random()*200, "Km");
}, 500);

function updateGraph(Protocol_ID, data, dataUnit){
	const canvas_ID = document.getElementById(`${Protocol_ID}_CANVAS`);
	const graph = canvas_ID.getContext("2d");       
	
	stored_data[`${Protocol_ID}_graph`].push(data);	    
    const data_length = stored_data[`${Protocol_ID}_graph`].length;
	if(data_length > 70){            	                              
		stored_data[`${Protocol_ID}_graph`].shift();
	}
    
    // Graph characteristics
    const unit = dataUnit ? dataUnit : "";
    const padding = 20;
	const spacing = 10;
    const offset = padding + 30;
    const graphWidth  = canvas_ID.width  - padding*2;
    const graphHeight = canvas_ID.height - padding*2;    
    
    // Graph
    const max = (Math.max(...stored_data[`${Protocol_ID}_graph`]).toFixed(1)); 
    const average = (stored_data[`${Protocol_ID}_graph`].reduce((accumulator, current) => accumulator + current, 0) / data_length).toFixed(1);
    const adjust = (graphHeight * 0.8) / max;
		                    	        
    // Create background
    graph.reset();   
    graph.fillStyle = "#F0F0F0";
    graph.fillRect(padding, padding, graphWidth, graphHeight);   
    graph.font = "40px Arial";
    graph.fillStyle = "black";
    graph.textAlign = "center";
    graph.textBaseline = "top";
	graph.fillText(Protocol_ID, canvas_ID.width / 2, 5); 
    
    //Create graph axis scale description
    graph.font = "30px Arial";
    graph.fillText(`${max} ${unit}`, padding*4 + 5, padding - 5);   
    graph.fillText(`média: ${average} ${unit}`, canvas_ID.width / 2, canvas_ID.height - padding*2 + 5);    
    
    //Create [X,Y] graph axis
    graph.lineWidth = 4;
    graph.strokeStyle = "black";
    graph.beginPath();
    graph.moveTo(padding*2, padding*2);
    graph.lineTo(padding*2, graphHeight);
    graph.lineTo(graphWidth, graphHeight);
    graph.stroke(); 
        
    
    //Standard graph candle configuration
    graph.strokeStyle = "#ED4848";
	graph.lineWidth = 8;
	graph.lineCap = "butt";                   
	
    //if(stored_data.every(num => num > 0)){
        //console.log("positivo");
    //} else {
    //    console.log("negativo");
    //}
	for(let i = 0; i < data_length; i++){ 
        let data_index = stored_data[`${Protocol_ID}_graph`][i];
        graph.beginPath();
		graph.moveTo(i*spacing + offset, graphHeight - 5);
		graph.lineTo(i*spacing + offset, graphHeight - data_index*adjust); // data_index
		graph.stroke();      
        
        if(i % 10 == 10){
            graph.fillText(`${data_index}`, i*spacing + offset, graphHeight - data_index*adjust);  
            graph.fillText(`${data_index}`, 200, 200);  
            console.log("aloo");
        }
        
        
        if(stored_data[`${Protocol_ID}_last`] !== data_index){
			     
            //stored_data[`${Protocol_ID}_last`] = stored_data[`${Protocol_ID}_graph`][i];                        
        }        
	}                             
}