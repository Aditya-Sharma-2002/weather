'use strict';

const key = 'dda175c03f9d60359987d65376ea067f';
const aqi = document.querySelector('.aqi');
let latitude, longitude;
const date = new Date();
const news = document.querySelector('.news-a');

if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
        function(position){            
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            setTimeout(() => {

                // leaflet library     
                var map = L.map('map1').setView([latitude, longitude], 13);
            
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                
                // reverse geocoding api
            
                fetch(`https://geocode.xyz/${latitude},${longitude}?geoit=json`).
                then(response => response.json()).
                then(el => {
            
                    // aqi api
                    // console.log("Place name = ", el);
                    fetch(`https://api.waqi.info/search/?token=d9d6fd38c2f43fc932d2c011f45d9b605748e0c6&keyword=${el.city}`).
                    then(response => response.json()).
                    then(el => {
                        console.log(el.data);
                        el.data.forEach((item, index) => {
                            if(item.aqi !== '-'){
                                let aqiClass = "";
                            let message = "";
                                if(Number(item.aqi) > 0 && Number(item.aqi) <= 50){
                                    aqiClass = "good";
                                    message = 'good';
                                }
                                else if(Number(item.aqi) >= 51 && Number(item.aqi) <= 100){
                                    aqiClass = "moderate";                                    
                                    message = 'moderate';
                                }
                                else if(Number(item.aqi) >= 101 && Number(item.aqi) <= 150){
                                    aqiClass = "unhealthy_sg";
                                    message = 'unhealthy for sensitive groups';
                                }
                                else if(Number(item.aqi) >= 151 && Number(item.aqi) <= 200){
                                    aqiClass = "unhealthy";
                                    message = 'unhealthy';
                                }
                                else if(Number(item.aqi) >= 201 && Number(item.aqi) <= 300){
                                    aqiClass = "vunhealthy"
                                    message = 'very unhealthy';
                                }
                                else if(Number(item.aqi) > 300){
                                    aqiClass = "hazardous";
                                    message = 'hazardous';
                                }
                            L.marker([item.station.geo[0], item.station.geo[1]])
                            .addTo(map)
                            .bindPopup(L.popup({
                                maxWidth: 250,
                                minWidth: 100,
                                autoClose: false,
                                closeOnClick: false,
                                className: `${aqiClass}-strip`,
                            }))
                            .setPopupContent(`AQI: ${!!Number(item.aqi) ? `${item.aqi}, ${message}` : 'NA'} Place: ${item.station.name}`)
                            .openPopup();
                            }
                            })
                    });
                });
            
                // Pollutants api
            
                fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${key}`).
                then(response => response.json()).
                then(el => {
                    console.log(el);
                    console.log(el.list[0].components);
                    for(let i = 0; i < Object.keys(el.list[0].components).length; i++){
                        let html = // style="background: linear-gradient(to right, white 70%, red 30%);"
                        `<div class="cards">
                        <img src="./images/${Object.keys(el.list[0].components)[i]}.png" class="news--logo"/>
                        <div style="margin-left: 40px;">
                            <h3>${Object.values(el.list[0].components)[i]}</h3>
                        </div>
                        </div>`;
                        news.insertAdjacentHTML('beforeend', html);
                    }
                });
            
                //////////////////// when map is clicked ////////////////
            
                map.on('click', function(mapEvent){
                    let {lat, lng} = mapEvent.latlng;
                    
                    // reverse geocoding api
            
                    fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`).
                    then(response => response.json()).
                    then(el => {
                        console.log(el);
                        // aqi api
            
                        fetch(`https://api.waqi.info/search/?token=d9d6fd38c2f43fc932d2c011f45d9b605748e0c6&keyword=${el.city}`).
                        then(response => response.json()).
                        then(el => {
                            console.log(el.data);
                            el.data.forEach((item, index) => {
                                if(item.aqi !== '-'){
                                    let aqiClass = "";
                                let message = "";                                
                                if(Number(item.aqi) > 0 && Number(item.aqi) <= 50){
                                    aqiClass = "good";
                                    message = 'good';
                                }
                                else if(Number(item.aqi) >= 51 && Number(item.aqi) <= 100){
                                    aqiClass = "moderate";                                    
                                    message = 'moderate';
                                }
                                else if(Number(item.aqi) >= 101 && Number(item.aqi) <= 150){
                                    aqiClass = "unhealthy_sg";
                                    message = 'unhealthy for sensitive groups';
                                }
                                else if(Number(item.aqi) >= 151 && Number(item.aqi) <= 200){
                                    aqiClass = "unhealthy";
                                    message = 'unhealthy';
                                }
                                else if(Number(item.aqi) >= 201 && Number(item.aqi) <= 300){
                                    aqiClass = "vunhealthy"
                                    message = 'very unhealthy';
                                }
                                else if(Number(item.aqi) > 300){
                                    aqiClass = "hazardous";
                                    message = 'hazardous';
                                }
                                L.marker([item.station.geo[0], item.station.geo[1]])
                                .addTo(map)
                                .bindPopup(L.popup({
                                    maxWidth: 250,
                                    minWidth: 100,
                                    autoClose: false,
                                    closeOnClick: false,
                                    className: `${aqiClass}-strip`,
                                }))
                                .setPopupContent(`AQI: ${!!Number(item.aqi) ? `${item.aqi}, ${message}` : 'NA'} Place: ${item.station.name}`)
                                .openPopup();
                                }
                                });
                        });
                    });
            
                    // pollutants api
            
                    fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${key}`).
                    then(response => response.json()).
                    then(el => {
                        // console.log(el);
                        // console.log(el.list[0].components);
                        while (news.firstChild) {
                            news.removeChild(news.firstChild);
                        }        
                        for(let i = 0; i < Object.keys(el.list[0].components).length; i++){
                            let html = // style="background: linear-gradient(to right, white 70%, red 30%);"
                            `<div class="cards">
                            <img src="./images/${Object.keys(el.list[0].components)[i]}.png" class="news--logo"/>
                            <div style="margin-left: 40px;">
                                <h3>${Object.values(el.list[0].components)[i]}</h3>
                            </div>
                            </div>`;
                            news.insertAdjacentHTML('beforeend', html);
                        }
                    });
                });
                ////////////////// map click ends here //////////////////////
            }, 800);

        },
        function(){
            alert(`Can't do anything`);
        }
    )
}